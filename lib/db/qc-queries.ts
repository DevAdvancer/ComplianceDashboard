import { randomUUID } from "node:crypto";
import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/server";
import { getUsersMap } from "@/lib/db/queries";
import type { ResumeQcInput } from "@/lib/types/app";
import type {
  Database,
  ResumeQcWithRelations,
} from "@/lib/types/database";

const nestedQcSelect = `
  *,
  experiences:resume_qc_experiences (*),
  opt_employers:resume_qc_opt_employers (*),
  stem_opt_employers:resume_qc_stem_opt_employers (*)
`;

export async function getResumeQcRecords(options?: {
  query?: string;
  candidateName?: string;
  qcListName?: string;
}) {
  const supabase = createAdminClient();

  const buildQuery = (selectString: string) => {
    let q = supabase
      .from("resume_qc")
      .select(selectString)
      .order("created_at", { ascending: false });

    if (options?.query && options.query.trim().length > 0) {
      const search = options.query.trim();
      const tokens = search.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        q = q.or(
          [
            `candidate_name.ilike.%${token}%`,
            `qc_list_name.ilike.%${token}%`,
            `technology.ilike.%${token}%`,
            `email.ilike.%${token}%`,
            `visa_status.ilike.%${token}%`,
            `phone.ilike.%${token}%`,
          ].join(","),
        );
      }
    }

    if (options?.candidateName) {
      q = q.ilike("candidate_name", `%${options.candidateName.trim()}%`);
    }

    if (options?.qcListName) {
      q = q.ilike("qc_list_name", `%${options.qcListName.trim()}%`);
    }

    return q;
  };

  const [res, usersMap] = await Promise.all([buildQuery(nestedQcSelect), getUsersMap()]);
  let data: unknown = res.data;

  if (res.error) {
    console.warn("Full Resume QC select unavailable, using fallback select:", res.error.message || res.error.code || "PostgREST relation error");
    const fallbackRes = await buildQuery("*");
    data = fallbackRes.data;
  }

  const rows = (data ?? []) as unknown as ResumeQcWithRelations[];

  return rows.map((record) => ({
    ...record,
    experiences: (record.experiences ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    opt_employers: (record.opt_employers ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    stem_opt_employers: (record.stem_opt_employers ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    creator: usersMap.get(record.created_by) ?? null,
  }));
}

export const getResumeQcById = cache(async (id: string) => {
  const supabase = createAdminClient();
  const [res, usersMap] = await Promise.all([
    supabase.from("resume_qc").select(nestedQcSelect).eq("id", id).maybeSingle(),
    getUsersMap(),
  ]);
  let data: unknown = res.data;

  if (res.error) {
    console.warn("Full Resume QC select by ID unavailable, using fallback select:", res.error.message || res.error.code || "PostgREST relation error");
    const fallbackRes = await supabase.from("resume_qc").select("*").eq("id", id).maybeSingle();
    data = fallbackRes.data;
  }

  if (!data) {
    return null;
  }

  const record = data as unknown as ResumeQcWithRelations;

  return {
    ...record,
    experiences: (record.experiences ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    opt_employers: (record.opt_employers ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    stem_opt_employers: (record.stem_opt_employers ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    creator: usersMap.get(record.created_by) ?? null,
  } satisfies ResumeQcWithRelations;
});

function normalizeDateStr(value?: string): string | null {
  const trimmed = value?.trim() || "";
  return trimmed || null;
}

export async function upsertResumeQcGraph(
  recordId: string,
  values: ResumeQcInput,
  userId: string,
) {
  const supabase = createAdminClient();

  const recordPayload: Database["public"]["Tables"]["resume_qc"]["Insert"] = {
    id: recordId,
    candidate_name: values.candidate_name.trim(),
    qc_list_name: values.qc_list_name?.trim() || "General Resume QC",
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    linkedin_url: values.linkedin_url?.trim() || null,
    bachelors_start_date: normalizeDateStr(values.bachelors_start_date),
    bachelors_end_date: normalizeDateStr(values.bachelors_end_date),
    masters_start_date: normalizeDateStr(values.masters_start_date),
    masters_end_date: normalizeDateStr(values.masters_end_date),
    us_arrival_date: normalizeDateStr(values.us_arrival_date),
    visa_status: values.visa_status?.trim() || null,
    technology: values.technology?.trim() || null,
    cpt_taken: Boolean(values.cpt_taken),
    cpt_start_date: normalizeDateStr(values.cpt_start_date),
    cpt_end_date: normalizeDateStr(values.cpt_end_date),
    cpt_employer_name: values.cpt_employer_name?.trim() || null,
    opt_taken: Boolean(values.opt_taken),
    opt_start_date: normalizeDateStr(values.opt_start_date),
    opt_end_date: normalizeDateStr(values.opt_end_date),
    stem_opt_taken: Boolean(values.stem_opt_taken),
    stem_opt_start_date: normalizeDateStr(values.stem_opt_start_date),
    stem_opt_end_date: normalizeDateStr(values.stem_opt_end_date),
    h1b_taken: Boolean(values.h1b_taken),
    h1b_start_date: normalizeDateStr(values.h1b_start_date),
    h1b_end_date: normalizeDateStr(values.h1b_end_date),
    h4_taken: Boolean(values.h4_taken),
    h4_start_date: normalizeDateStr(values.h4_start_date),
    h4_end_date: normalizeDateStr(values.h4_end_date),
    gc_taken: Boolean(values.gc_taken),
    gc_start_date: normalizeDateStr(values.gc_start_date),
    gc_end_date: normalizeDateStr(values.gc_end_date),
    usc_taken: Boolean(values.usc_taken),
    usc_start_date: normalizeDateStr(values.usc_start_date),
    usc_end_date: normalizeDateStr(values.usc_end_date),
    cpt_notes: values.cpt_notes?.trim() || null,
    opt_notes: values.opt_notes?.trim() || null,
    stem_opt_notes: values.stem_opt_notes?.trim() || null,
    h1b_notes: values.h1b_notes?.trim() || null,
    h4_notes: values.h4_notes?.trim() || null,
    gc_notes: values.gc_notes?.trim() || null,
    usc_notes: values.usc_notes?.trim() || null,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };

  const { error: recordError } = await supabase.from("resume_qc").upsert(recordPayload);

  if (recordError) {
    throw new Error(recordError.message);
  }

  // Replace experiences
  await supabase.from("resume_qc_experiences").delete().eq("resume_qc_id", recordId);

  const experiencesPayload: Database["public"]["Tables"]["resume_qc_experiences"]["Insert"][] =
    (values.experiences ?? [])
      .filter((exp) => exp.company_name.trim() || exp.job_title.trim())
      .map((exp, index) => ({
        id: exp.id || randomUUID(),
        resume_qc_id: recordId,
        company_name: exp.company_name.trim() || "Experience",
        job_title: exp.job_title.trim() || "Role",
        start_date: normalizeDateStr(exp.start_date),
        end_date: normalizeDateStr(exp.end_date),
        technologies: exp.technologies?.trim() || null,
        display_order: exp.display_order ?? index,
      }));

  if (experiencesPayload.length > 0) {
    const { error: expError } = await supabase.from("resume_qc_experiences").insert(experiencesPayload);
    if (expError) {
      throw new Error(expError.message);
    }
  }

  // Replace OPT employers
  await supabase.from("resume_qc_opt_employers").delete().eq("resume_qc_id", recordId);

  const optEmployersPayload: Database["public"]["Tables"]["resume_qc_opt_employers"]["Insert"][] =
    (values.opt_employers ?? [])
      .filter((emp) => emp.employer_name.trim())
      .map((emp, index) => ({
        id: emp.id || randomUUID(),
        resume_qc_id: recordId,
        employer_name: emp.employer_name.trim(),
        start_date: normalizeDateStr(emp.start_date),
        end_date: normalizeDateStr(emp.end_date),
        role_or_notes: emp.role_or_notes?.trim() || null,
        display_order: emp.display_order ?? index,
      }));

  if (optEmployersPayload.length > 0) {
    const { error: optError } = await supabase.from("resume_qc_opt_employers").insert(optEmployersPayload);
    if (optError) {
      throw new Error(optError.message);
    }
  }

  // Replace STEM OPT employers
  await supabase.from("resume_qc_stem_opt_employers").delete().eq("resume_qc_id", recordId);

  const stemOptEmployersPayload: Database["public"]["Tables"]["resume_qc_stem_opt_employers"]["Insert"][] =
    (values.stem_opt_employers ?? [])
      .filter((emp) => emp.employer_name.trim())
      .map((emp, index) => ({
        id: emp.id || randomUUID(),
        resume_qc_id: recordId,
        employer_name: emp.employer_name.trim(),
        start_date: normalizeDateStr(emp.start_date),
        end_date: normalizeDateStr(emp.end_date),
        e_verify_or_notes: emp.e_verify_or_notes?.trim() || null,
        display_order: emp.display_order ?? index,
      }));

  if (stemOptEmployersPayload.length > 0) {
    const { error: stemOptError } = await supabase.from("resume_qc_stem_opt_employers").insert(stemOptEmployersPayload);
    if (stemOptError) {
      throw new Error(stemOptError.message);
    }
  }
}

export async function deleteResumeQcRecord(recordId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("resume_qc").delete().eq("id", recordId);
  if (error) {
    throw new Error(error.message);
  }
}
