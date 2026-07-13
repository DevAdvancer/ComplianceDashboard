"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

import {
  buildManagedUserInputFromRow,
  createManagedUser,
  listAuthUsersByEmail,
} from "@/lib/admin/user-provisioning";
import { canAdminArchiveRecord, canAdminReviewRecord } from "@/lib/workflows/records";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ComplianceRecordInput, RecordStatus, ReferenceInput } from "@/lib/types/app";
import type { Database } from "@/lib/types/database";
import { detectDuplicateCandidate, upsertRecordGraph } from "@/lib/db/queries";
import { complianceRecordSchema, reviewReferenceSchema } from "@/lib/validations/compliance";

export type ActionState = {
  success: boolean;
  message: string;
};

async function ensureUserWithRole(requiredRole: "Admin" | "Marketing") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? user.app_metadata?.role;

  if (role !== requiredRole) {
    return null;
  }

  return user;
}

export async function loginAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function getCurrentUserAndRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? user.app_metadata?.role) as "Admin" | "Marketing" | undefined;
  return { user, role };
}

export async function saveComplianceRecordAction(
  values: ComplianceRecordInput,
  intent: "draft" | "submit" | "approve" | "reject" | "save",
  rejectionReason?: string,
): Promise<ActionState> {
  const current = await getCurrentUserAndRole();

  if (!current?.user) {
    return {
      success: false,
      message: "You must be signed in to perform this action.",
    };
  }

  const supabase = createAdminClient();
  const existingRecordId = values.id?.trim();
  let existingRecordRow:
    | Database["public"]["Tables"]["compliance_records"]["Row"]
    | null = null;

  if (existingRecordId) {
    if (current.role !== "Admin") {
      return {
        success: false,
        message: "Only Admin users can edit existing compliance records.",
      };
    }

    const { data } = await supabase
      .from("compliance_records")
      .select("*")
      .eq("id", existingRecordId)
      .maybeSingle();

    existingRecordRow = data;

    if (!existingRecordRow) {
      return {
        success: false,
        message: "The compliance record could not be found.",
      };
    }
  } else if (current.role !== "Admin" && current.role !== "Marketing") {
    return {
      success: false,
      message: "You do not have permission to create compliance records.",
    };
  }

  let targetStatus: RecordStatus;
  if (intent === "approve") {
    targetStatus = "Approved";
  } else if (intent === "reject") {
    targetStatus = "Rejected";
  } else if (values.status) {
    targetStatus = values.status;
  } else if (existingRecordRow) {
    targetStatus = existingRecordRow.status;
  } else if (intent === "submit") {
    targetStatus = "Pending";
  } else {
    targetStatus = "Draft";
  }

  const parsed = complianceRecordSchema.safeParse({
    ...values,
    status: targetStatus,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please review the form values.",
    };
  }

  const duplicate = await detectDuplicateCandidate(parsed.data);

  if (duplicate) {
    return {
      success: false,
      message: "A similar candidate record already exists.",
    };
  }

  const recordId = existingRecordId || randomUUID();

  try {
    await upsertRecordGraph(
      recordId,
      {
        ...parsed.data,
        status: targetStatus,
      },
      current.user.id,
      {
        created_by: existingRecordRow ? existingRecordRow.created_by : current.user.id,
        approved_by: targetStatus === "Approved" ? current.user.id : null,
        approved_at: targetStatus === "Approved" ? new Date().toISOString() : null,
        rejection_reason:
          targetStatus === "Rejected"
            ? (rejectionReason ?? "Rejected by Admin")
            : null,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to save the compliance record.";

    return {
      success: false,
      message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/records");
  revalidatePath("/pending");
  revalidatePath(`/records/${recordId}`);
  revalidatePath(`/records/${recordId}/edit`);
  revalidatePath(`/records/${recordId}/review`);
  revalidatePath(`/records/${recordId}/report`);

  return {
    success: true,
    message:
      intent === "approve"
        ? "Record updated and approved."
        : intent === "reject"
          ? "Record updated and rejected."
          : intent === "submit"
            ? "Compliance request submitted."
            : "All record details updated successfully.",
  };
}

export async function reviewComplianceRecordAction(payload: {
  record_id: string;
  decision: "draft" | "approve" | "reject";
  rejection_reason?: string;
  previous_companies?: {
    id?: string;
    company_name: string;
    job_title: string;
    employment_start: string;
    employment_end: string;
    display_order: number;
  }[];
  references: ReferenceInput[];
}): Promise<ActionState> {
  const parsed = reviewReferenceSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Review data is invalid.",
    };
  }

  const user = await ensureAdminUser();

  if (!user) {
    return {
      success: false,
      message: "Only Admin users can complete pending reviews.",
    };
  }

  const supabase = createAdminClient();
  const { data: record } = await supabase
    .from("compliance_records")
    .select("id, status")
    .eq("id", parsed.data.record_id)
    .maybeSingle();

  if (!record) {
    return {
      success: false,
      message: "The compliance record could not be found.",
    };
  }

  if (!canAdminReviewRecord(record.status)) {
    return {
      success: false,
      message: "Only pending records can be reviewed by Admin.",
    };
  }

  if (parsed.data.previous_companies && parsed.data.previous_companies.length > 0) {
    for (const [idx, comp] of parsed.data.previous_companies.entries()) {
      const companyId = comp.id || randomUUID();
      await supabase.from("previous_companies").upsert({
        id: companyId,
        compliance_record_id: parsed.data.record_id,
        company_name: comp.company_name || "Previous Company",
        job_title: comp.job_title || "Role",
        employment_start: comp.employment_start || "2024-01-01",
        employment_end: comp.employment_end || "2025-01-01",
        display_order: comp.display_order ?? idx,
      });
    }
  }

  const { data: companies } = await supabase
    .from("previous_companies")
    .select("id")
    .eq("compliance_record_id", parsed.data.record_id);

  let allCompanyIds = (companies ?? []).map((c) => c.id);

  if (allCompanyIds.length === 0) {
    const defaultId = randomUUID();
    await supabase.from("previous_companies").insert({
      id: defaultId,
      compliance_record_id: parsed.data.record_id,
      company_name: "General Reference",
      job_title: "Reference",
      employment_start: "2024-01-01",
      employment_end: "2024-01-01",
      display_order: 0,
    });
    allCompanyIds = [defaultId];
  }

  const defaultCompanyId = allCompanyIds[0];

  if (allCompanyIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("references")
      .delete()
      .in("previous_company_id", allCompanyIds);

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      };
    }
  }

  const validReferences = parsed.data.references.filter(
    (reference) =>
      reference.reference_name.trim() ||
      reference.designation.trim() ||
      reference.email.trim() ||
      reference.phone.trim(),
  );

  if (validReferences.length > 0) {
    const { error: insertError } = await supabase.from("references").insert(
      validReferences.map((reference) => ({
        previous_company_id:
          reference.previous_company_id &&
          allCompanyIds.includes(reference.previous_company_id)
            ? reference.previous_company_id
            : defaultCompanyId,
        reference_name: reference.reference_name,
        designation: reference.designation,
        email: reference.email || null,
        phone: reference.phone || null,
        notes: reference.notes || null,
        created_by: user.id,
      })),
    );

    if (insertError) {
      return {
        success: false,
        message: insertError.message,
      };
    }
  }

  const status: RecordStatus =
    parsed.data.decision === "approve"
      ? "Approved"
      : parsed.data.decision === "reject"
        ? "Rejected"
        : "Pending";

  const updatePayload = {
    status,
    approved_by: parsed.data.decision === "approve" ? user.id : null,
    approved_at: parsed.data.decision === "approve" ? new Date().toISOString() : null,
    rejection_reason:
      parsed.data.decision === "reject" ? parsed.data.rejection_reason ?? "Rejected in review" : null,
  };

  const { error: updateError } = await supabase
    .from("compliance_records")
    .update(updatePayload)
    .eq("id", parsed.data.record_id);

  if (updateError) {
    return {
      success: false,
      message: updateError.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/pending");
  revalidatePath(`/records/${parsed.data.record_id}/review`);
  revalidatePath(`/records/${parsed.data.record_id}/report`);
  revalidatePath("/records");

  return {
    success: true,
    message:
      parsed.data.decision === "approve"
        ? "Record approved successfully."
        : parsed.data.decision === "reject"
          ? "Record rejected."
          : "Review draft saved.",
  };
}

export async function archiveComplianceRecordAction(recordId: string) {
  const currentUser = await ensureAdminUser();

  if (!currentUser) {
    return {
      success: false,
      message: "Only Admin users can archive records.",
    };
  }

  const supabase = createAdminClient();
  const { data: record } = await supabase
    .from("compliance_records")
    .select("id, status")
    .eq("id", recordId)
    .maybeSingle();

  if (!record) {
    return {
      success: false,
      message: "The compliance record could not be found.",
    };
  }

  if (!canAdminArchiveRecord(record.status)) {
    return {
      success: false,
      message: "Only approved or rejected records can be archived.",
    };
  }

  const { error } = await supabase
    .from("compliance_records")
    .update({
      status: "Archived",
      archived_at: new Date().toISOString(),
    })
    .eq("id", recordId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/records");
  revalidatePath(`/records/${recordId}/report`);

  return {
    success: true,
    message: "Record archived.",
  };
}

async function ensureAdminUser() {
  return ensureUserWithRole("Admin");
}

export async function createSingleUserAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentUser = await ensureAdminUser();

  if (!currentUser) {
    return {
      success: false,
      message: "Only Admin users can add users.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  try {
    const input = buildManagedUserInputFromRow(
      {
        email,
        password,
        name,
        role,
      },
      1,
    );

    const existingUsers = await listAuthUsersByEmail();

    if (existingUsers.has(input.email.toLowerCase())) {
      return {
        success: false,
        message: "A user with this email already exists.",
      };
    }

    await createManagedUser(input);
    revalidatePath("/settings");

    return {
      success: true,
      message: `${input.role} user created for ${input.email}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create the user.",
    };
  }
}

export async function bulkImportUsersAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentUser = await ensureAdminUser();

  if (!currentUser) {
    return {
      success: false,
      message: "Only Admin users can import accounts.",
    };
  }

  const upload = formData.get("users_file");

  if (!(upload instanceof File)) {
    return {
      success: false,
      message: "Please upload an Excel file.",
    };
  }

  if (upload.size === 0) {
    return {
      success: false,
      message: "The uploaded file is empty.",
    };
  }

  const workbook = XLSX.read(await upload.arrayBuffer(), { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      success: false,
      message: "The workbook does not contain any sheets.",
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (rawRows.length === 0) {
    return {
      success: false,
      message: "The worksheet does not contain any user rows.",
    };
  }

  const existingUsers = await listAuthUsersByEmail();
  let createdCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const [index, row] of rawRows.entries()) {
    try {
      const input = buildManagedUserInputFromRow(
        {
          email: String(row.email ?? row.Email ?? row.EMAIL ?? ""),
          password: String(row.password ?? row.Password ?? row.PASSWORD ?? ""),
          name: String(row.name ?? row.Name ?? row.NAME ?? ""),
          role: String(row.role ?? row.Role ?? row.ROLE ?? ""),
        },
        index + 2,
      );

      const lookupEmail = input.email.toLowerCase();

      if (existingUsers.has(lookupEmail)) {
        skippedCount += 1;
        continue;
      }

      await createManagedUser(input);
      existingUsers.set(lookupEmail, {
        id: lookupEmail,
        email: input.email,
      });
      createdCount += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Row ${index + 2}: unknown import error.`);
    }
  }

  revalidatePath("/settings");

  if (errors.length > 0) {
    return {
      success: false,
      message: `Created ${createdCount}, skipped ${skippedCount}. ${errors.slice(0, 3).join(" ")}`,
    };
  }

  return {
    success: true,
    message: `Imported ${createdCount} users. Skipped ${skippedCount} existing users.`,
  };
}
