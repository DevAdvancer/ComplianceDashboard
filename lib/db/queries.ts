import { randomUUID } from "node:crypto";
import { cache } from "react";

import type { DashboardStats, RecordStatus } from "@/lib/types/app";
import type { ActivityItem, ComplianceRecordInput } from "@/lib/types/app";
import type {
  Database,
  ComplianceRecordWithRelations,
} from "@/lib/types/database";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { normalizeCandidateKey } from "@/lib/utils";

const nestedRecordSelect = `
  *,
  previous_companies (
    *,
    references (*)
  ),
  employer_details (*)
`;

export async function getDashboardStats(userId?: string, role?: "Admin" | "Marketing") {
  const supabase = await createClient();
  let query = supabase
    .from("compliance_records")
    .select("status, created_at", { count: "exact" });

  if (role === "Marketing" && userId) {
    query = query.eq("created_by", userId);
  }

  const { data, count } = await query;
  const rows = data ?? [];

  const counts = rows.reduce<Record<RecordStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { Draft: 0, Pending: 0, Approved: 0, Rejected: 0, Archived: 0 },
  );

  return {
    totalRecords: count ?? 0,
    pendingRequests: counts.Pending,
    approvedRecords: counts.Approved,
    rejectedRecords: counts.Rejected,
    archivedRecords: counts.Archived,
    recentActivity: rows.filter((item) => {
      const createdAt = new Date(item.created_at);
      return Date.now() - createdAt.getTime() <= 1000 * 60 * 60 * 24 * 7;
    }).length,
    pendingReviews: counts.Pending,
  } satisfies DashboardStats;
}

export async function getActivityFeed(userId?: string, role?: "Admin" | "Marketing") {
  const supabase = await createClient();
  let query = supabase
    .from("compliance_records")
    .select("id, candidate_name, status, created_at, end_client, candidate_technology")
    .order("updated_at", { ascending: false })
    .limit(8);

  if (role === "Marketing" && userId) {
    query = query.eq("created_by", userId);
  }

  const { data } = await query;
  const rows = data ?? [];

  return rows.map(
    (item) =>
      ({
        id: item.id,
        title: `${item.candidate_name} · ${item.status}`,
        description: `${item.candidate_technology} for ${item.end_client}`,
        created_at: item.created_at,
        status: item.status,
      }) satisfies ActivityItem,
  );
}

export const getUsersMap = cache(async () => {
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("*");
  const rows = data ?? [];

  return new Map(rows.map((user) => [user.id, user]));
});

export async function getComplianceRecords(options?: {
  role?: "Admin" | "Marketing";
  userId?: string;
  status?: RecordStatus;
  query?: string;
}) {
  const supabase = createAdminClient();

  const buildQuery = (selectString: string) => {
    let q = supabase.from("compliance_records").select(selectString).order("created_at", {
      ascending: false,
    });

    if (options?.role === "Marketing" && options.userId) {
      q = q.eq("created_by", options.userId);
    }

    if (options?.status) {
      q = q.eq("status", options.status);
    }

    if (options?.query && options.query.trim().length > 0) {
      const search = options.query.trim();
      const tokens = search.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        q = q.or(
          [
            `candidate_name.ilike.%${token}%`,
            `candidate_technology.ilike.%${token}%`,
            `vendor_name.ilike.%${token}%`,
            `end_client.ilike.%${token}%`,
            `visa_status.ilike.%${token}%`,
            `applied_role.ilike.%${token}%`,
            `status.ilike.%${token}%`,
          ].join(","),
        );
      }
    }
    return q;
  };

  const [res, usersMap] = await Promise.all([buildQuery(nestedRecordSelect), getUsersMap()]);
  let data: unknown = res.data;

  if (res.error) {
    console.warn("Full nested select unavailable, using fallback select:", res.error.message || res.error.code || "PostgREST relation error");
    const fallbackRes = await buildQuery("*, previous_companies (*, references (*))");
    data = fallbackRes.data;
    if (fallbackRes.error) {
      console.warn("Fallback select unavailable, using basic select:", fallbackRes.error.message || fallbackRes.error.code || "PostgREST relation error");
      const basicRes = await buildQuery("*");
      data = basicRes.data;
    }
  }

  const rows = (data ?? []) as unknown as ComplianceRecordWithRelations[];

  return rows.map((record) => ({
    ...record,
    creator: usersMap.get(record.created_by) ?? null,
    approver: record.approved_by ? usersMap.get(record.approved_by) ?? null : null,
  }));
}

export const getComplianceRecordById = cache(async (id: string) => {
  const supabase = createAdminClient();
  const [res, usersMap] = await Promise.all([
    supabase.from("compliance_records").select(nestedRecordSelect).eq("id", id).maybeSingle(),
    getUsersMap(),
  ]);
  let data: unknown = res.data;

  if (res.error) {
    console.warn("Full nested select by ID unavailable, using fallback select:", res.error.message || res.error.code || "PostgREST relation error");
    const fallbackRes = await supabase
      .from("compliance_records")
      .select("*, previous_companies (*, references (*))")
      .eq("id", id)
      .maybeSingle();
    data = fallbackRes.data;
    if (fallbackRes.error) {
      const basicRes = await supabase.from("compliance_records").select("*").eq("id", id).maybeSingle();
      data = basicRes.data;
    }
  }

  if (!data) {
    return null;
  }

  const record = data as unknown as ComplianceRecordWithRelations;

  return {
    ...record,
    creator: usersMap.get(record.created_by) ?? null,
    approver: record.approved_by ? usersMap.get(record.approved_by) ?? null : null,
  } satisfies ComplianceRecordWithRelations;
});

export async function detectDuplicateCandidate(payload: ComplianceRecordInput) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("compliance_records")
    .select("id, candidate_name, candidate_technology, vendor_name, end_client")
    .neq("status", "Archived");
  const rows = data ?? [];

  const currentKey = normalizeCandidateKey(payload);

  return rows.find(
    (item) =>
      normalizeCandidateKey({
        candidate_name: item.candidate_name,
        candidate_technology: item.candidate_technology,
        vendor_name: item.vendor_name,
        end_client: item.end_client,
      }) === currentKey && item.id !== payload.id,
  );
}

function normalizeDateInput(value?: string): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return new Date().toISOString().split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }
  return new Date().toISOString().split("T")[0];
}

export async function upsertRecordGraph(
  recordId: string,
  values: ComplianceRecordInput,
  userId: string,
  options?: {
    created_by?: string;
    approved_by?: string | null;
    approved_at?: string | null;
    rejection_reason?: string | null;
  },
) {
  const supabase = createAdminClient();

  const recordPayload: Database["public"]["Tables"]["compliance_records"]["Insert"] = {
    id: recordId,
    candidate_name: values.candidate_name,
    visa_status: values.visa_status,
    candidate_technology: values.candidate_technology,
    applied_role: values.applied_role,
    location: values.location,
    contract_tenure: values.contract_tenure,
    vendor_name: values.vendor_name,
    vendor_contact_name: values.vendor_contact_name,
    vendor_phone: values.vendor_phone,
    vendor_email: values.vendor_email,
    end_client: values.end_client,
    status: values.status ?? "Draft",
    created_by: options?.created_by ?? userId,
    approved_by: options?.approved_by !== undefined ? options.approved_by : null,
    rejection_reason: options?.rejection_reason !== undefined ? options.rejection_reason : null,
    submitted_at: values.status === "Pending" ? new Date().toISOString() : null,
    approved_at: options?.approved_at !== undefined ? options.approved_at : null,
    archived_at: null,
  };

  const { error: recordError } = await supabase.from("compliance_records").upsert(recordPayload);

  if (recordError) {
    throw new Error(recordError.message);
  }

  await supabase.from("previous_companies").delete().eq("compliance_record_id", recordId);

  const companiesPayload: Database["public"]["Tables"]["previous_companies"]["Insert"][] =
    values.previous_companies.map((company, index) => ({
      id: company.id || randomUUID(),
      compliance_record_id: recordId,
      company_name: company.company_name,
      job_title: company.job_title,
      employment_start: normalizeDateInput(company.employment_start),
      employment_end: normalizeDateInput(company.employment_end),
      display_order: company.display_order ?? index,
    }));

  const { error: companiesError } = await supabase.from("previous_companies").insert(companiesPayload);

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const flatRefs = values.flat_references ?? [];
  const referencesPayload: Database["public"]["Tables"]["references"]["Insert"][] =
    flatRefs.length > 0
      ? flatRefs
          .filter(
            (ref) =>
              ref.reference_name.trim() ||
              ref.designation.trim() ||
              ref.email.trim() ||
              ref.phone.trim(),
          )
          .map((ref) => ({
            previous_company_id: ref.previous_company_id || (companiesPayload[0].id as string),
            reference_name: ref.reference_name,
            designation: ref.designation,
            email: ref.email || null,
            phone: ref.phone || null,
            notes: ref.notes || null,
            created_by: userId,
          }))
      : values.previous_companies.flatMap((company, index) => {
          const companyId = companiesPayload[index].id as string;
          return (company.references ?? [])
            .filter(
              (reference) =>
                reference.reference_name.trim() ||
                reference.designation.trim() ||
                reference.email.trim() ||
                reference.phone.trim(),
            )
            .map((reference) => ({
              previous_company_id: companyId,
              reference_name: reference.reference_name,
              designation: reference.designation,
              email: reference.email || null,
              phone: reference.phone || null,
              notes: reference.notes || null,
              created_by: userId,
            }));
        });

  if (referencesPayload.length > 0) {
    const { error: referencesError } = await supabase
      .from("references")
      .insert(referencesPayload);

    if (referencesError) {
      throw new Error(referencesError.message);
    }
  }

  await supabase.from("employer_details").delete().eq("compliance_record_id", recordId);

  const employerDetailsList = values.employer_details ?? [];
  const employerDetailsPayload: Database["public"]["Tables"]["employer_details"]["Insert"][] =
    employerDetailsList
      .filter((ed) => ed.name.trim())
      .map((ed, index) => ({
        id: ed.id || randomUUID(),
        compliance_record_id: recordId,
        name: ed.name.trim(),
        display_order: index,
      }));

  if (employerDetailsPayload.length > 0) {
    const { error: employerDetailsError } = await supabase
      .from("employer_details")
      .insert(employerDetailsPayload);

    if (employerDetailsError) {
      throw new Error(employerDetailsError.message);
    }
  }
}
