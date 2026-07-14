import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  GraduationCap,
  User,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth/session";
import { getResumeQcById } from "@/lib/db/qc-queries";
import { formatDate } from "@/lib/utils";

export default async function ViewResumeQcPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getAuthContext({ allowedRoles: ["Admin"] });
  const { id } = await params;
  const record = await getResumeQcById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={record.qc_list_name}
        title={record.candidate_name}
        description="Full Resume QC checkpoint breakdown, degree verifications, dynamic experiences, and CPT/OPT/STEM OPT employer histories."
        badge={record.visa_status ?? "Resume QC"}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/resume-qc/${record.id}/edit`}>
              <Button className="bg-sky-500 hover:bg-sky-400 text-white gap-2">
                <Edit className="size-4" />
                Edit QC Details
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6">
        {/* ── Candidate Details & Identification ────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
                <User className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Candidate Profile & Identification
                </h3>
                <p className="text-xs text-slate-400">
                  Unique QC Checkpoint ID: {record.qc_list_name}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Candidate Name</span>
                <span className="font-medium text-white">{record.candidate_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">QC List Name</span>
                <span className="font-medium text-violet-300">{record.qc_list_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Technology</span>
                <span className="font-medium text-slate-200">{record.technology || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Email Id</span>
                <span className="font-medium text-slate-200">{record.email || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Phone Number</span>
                <span className="font-medium text-slate-200">{record.phone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">LinkedIn URL</span>
                {record.linkedin_url ? (
                  <a
                    href={record.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-sky-400 hover:underline break-all">
                    {record.linkedin_url}
                  </a>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Visa Status</span>
                <span className="font-medium text-slate-200">{record.visa_status || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">US Arrival Date</span>
                <span className="font-medium text-slate-200">{record.us_arrival_date || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Last Updated</span>
                <span className="font-medium text-slate-400">{formatDate(record.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Education & Degree Durations ──────────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-400">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Degree Durations
                </h3>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 text-sm">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <h4 className="font-medium text-violet-300">Bachelors Degree Duration</h4>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Start: <strong className="text-white">{record.bachelors_start_date || "—"}</strong></span>
                  <span>End: <strong className="text-white">{record.bachelors_end_date || "—"}</strong></span>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <h4 className="font-medium text-violet-300">Master&apos;s Degree Duration</h4>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Start: <strong className="text-white">{record.masters_start_date || "—"}</strong></span>
                  <span>End: <strong className="text-white">{record.masters_end_date || "—"}</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Work Experiences ──────────────────────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400">
                <Briefcase className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Experiences ({record.experiences.length})
                </h3>
              </div>
            </div>

            {record.experiences.length === 0 ? (
              <p className="text-sm text-slate-400">No work experiences recorded.</p>
            ) : (
              <div className="space-y-4">
                {record.experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <span className="font-semibold text-sky-400">
                        #{idx + 1} {exp.company_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {exp.start_date || "—"} to {exp.end_date || "Present"}
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block">Job Title / Role</span>
                        <span className="font-medium text-white">{exp.job_title}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs text-slate-400 block">Technologies & Description</span>
                        <span className="text-slate-300">{exp.technologies || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── CPT Information ───────────────────────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    CPT Taken Information
                  </h3>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border ${
                  record.cpt_taken
                    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}>
                {record.cpt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                CPT Taken: {record.cpt_taken ? "Yes" : "No"}
              </span>
            </div>

            {record.cpt_taken && (
              <div className="grid gap-4 md:grid-cols-3 text-sm rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
                <div>
                  <span className="text-xs text-slate-400 block">CPT Start Date</span>
                  <span className="font-medium text-white">{record.cpt_start_date || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">CPT End Date</span>
                  <span className="font-medium text-white">{record.cpt_end_date || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">CPT Employer&apos;s Name</span>
                  <span className="font-medium text-amber-300">{record.cpt_employer_name || "—"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── OPT Information & Employers ───────────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    OPT Taken Information ({record.opt_employers.length} Employers)
                  </h3>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border ${
                  record.opt_taken
                    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}>
                {record.opt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                OPT Taken: {record.opt_taken ? "Yes" : "No"}
              </span>
            </div>

            {record.opt_taken && (
              <div className="space-y-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4 text-sm">
                <div className="grid gap-4 md:grid-cols-2 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-xs text-slate-400 block">Overall OPT Start Date</span>
                    <span className="font-medium text-white">{record.opt_start_date || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Overall OPT End Date</span>
                    <span className="font-medium text-white">{record.opt_end_date || "—"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-blue-300 block">OPT Employer Records</span>
                  {record.opt_employers.length === 0 ? (
                    <p className="text-xs text-slate-400">No specific employers added for OPT.</p>
                  ) : (
                    record.opt_employers.map((emp, idx) => (
                      <div key={emp.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <span className="text-xs text-slate-400 block">Employer #{idx + 1}</span>
                          <span className="font-medium text-white">{emp.employer_name}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Role / Notes</span>
                          <span className="text-slate-300">{emp.role_or_notes || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Dates</span>
                          <span className="text-slate-300">{emp.start_date || "—"} to {emp.end_date || "—"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── STEM OPT Information & Employers ──────────────────── */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-400/20 text-teal-400">
                  <ClipboardCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    STEM OPT Taken Information ({record.stem_opt_employers.length} Employers)
                  </h3>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border ${
                  record.stem_opt_taken
                    ? "border-teal-400/30 bg-teal-500/10 text-teal-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}>
                {record.stem_opt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                STEM OPT Taken: {record.stem_opt_taken ? "Yes" : "No"}
              </span>
            </div>

            {record.stem_opt_taken && (
              <div className="space-y-4 rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-4 text-sm">
                <div className="grid gap-4 md:grid-cols-2 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-xs text-slate-400 block">Overall STEM OPT Start Date</span>
                    <span className="font-medium text-white">{record.stem_opt_start_date || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Overall STEM OPT End Date</span>
                    <span className="font-medium text-white">{record.stem_opt_end_date || "—"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-teal-300 block">STEM OPT Employer Records</span>
                  {record.stem_opt_employers.length === 0 ? (
                    <p className="text-xs text-slate-400">No specific employers added for STEM OPT.</p>
                  ) : (
                    record.stem_opt_employers.map((emp, idx) => (
                      <div key={emp.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <span className="text-xs text-slate-400 block">Employer #{idx + 1}</span>
                          <span className="font-medium text-white">{emp.employer_name}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">E-Verify / Notes</span>
                          <span className="text-slate-300">{emp.e_verify_or_notes || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Dates</span>
                          <span className="text-slate-300">{emp.start_date || "—"} to {emp.end_date || "—"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
