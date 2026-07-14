"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { deleteResumeQcRecord, upsertResumeQcGraph } from "@/lib/db/qc-queries";
import type { ResumeQcInput } from "@/lib/types/app";
import { resumeQcSchema } from "@/lib/validations/qc";
import type { ActionState } from "@/app/actions";

async function ensureAdminUser() {
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

  if (role !== "Admin") {
    return null;
  }

  return user;
}

export async function saveResumeQcAction(values: ResumeQcInput): Promise<ActionState> {
  const currentUser = await ensureAdminUser();

  if (!currentUser) {
    return {
      success: false,
      message: "Only Admin users can manage Resume QC records.",
    };
  }

  const parsed = resumeQcSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please review the form values.",
    };
  }

  const recordId = values.id?.trim() || randomUUID();

  try {
    await upsertResumeQcGraph(recordId, parsed.data, currentUser.id);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to save the Resume QC record.";

    return {
      success: false,
      message,
    };
  }

  revalidatePath("/resume-qc");
  revalidatePath(`/resume-qc/${recordId}`);
  revalidatePath(`/resume-qc/${recordId}/edit`);

  return {
    success: true,
    message: values.id ? "Resume QC record updated." : "Resume QC record created successfully.",
  };
}

export async function deleteResumeQcAction(recordId: string): Promise<ActionState> {
  const currentUser = await ensureAdminUser();

  if (!currentUser) {
    return {
      success: false,
      message: "Only Admin users can delete Resume QC records.",
    };
  }

  try {
    await deleteResumeQcRecord(recordId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete the record.",
    };
  }

  revalidatePath("/resume-qc");

  return {
    success: true,
    message: "Resume QC record deleted.",
  };
}
