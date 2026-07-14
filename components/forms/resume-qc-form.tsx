"use client";

import { useMemo, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { saveResumeQcAction } from "@/app/qc-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  resumeQcSchema,
  type ResumeQcSchema,
} from "@/lib/validations/qc";
import type { ResumeQcWithRelations } from "@/lib/types/database";

export function ResumeQcForm({
  record,
}: {
  record?: ResumeQcWithRelations | null;
}) {
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo<ResumeQcSchema>(
    () => ({
      id: record?.id,
      candidate_name: record?.candidate_name ?? "",
      qc_list_name: record?.qc_list_name ?? "General Resume QC",
      email: record?.email ?? "",
      phone: record?.phone ?? "",
      linkedin_url: record?.linkedin_url ?? "",
      bachelors_start_date: record?.bachelors_start_date ?? "",
      bachelors_end_date: record?.bachelors_end_date ?? "",
      masters_start_date: record?.masters_start_date ?? "",
      masters_end_date: record?.masters_end_date ?? "",
      us_arrival_date: record?.us_arrival_date ?? "",
      visa_status: record?.visa_status ?? "",
      technology: record?.technology ?? "",
      cpt_taken: Boolean(record?.cpt_taken),
      cpt_start_date: record?.cpt_start_date ?? "",
      cpt_end_date: record?.cpt_end_date ?? "",
      cpt_employer_name: record?.cpt_employer_name ?? "",
      opt_taken: Boolean(record?.opt_taken),
      opt_start_date: record?.opt_start_date ?? "",
      opt_end_date: record?.opt_end_date ?? "",
      stem_opt_taken: Boolean(record?.stem_opt_taken),
      stem_opt_start_date: record?.stem_opt_start_date ?? "",
      stem_opt_end_date: record?.stem_opt_end_date ?? "",
      experiences:
        record?.experiences?.length ? record.experiences.map((exp, index) => ({
          id: exp.id,
          company_name: exp.company_name,
          job_title: exp.job_title,
          start_date: exp.start_date ?? "",
          end_date: exp.end_date ?? "",
          technologies: exp.technologies ?? "",
          display_order: exp.display_order ?? index,
        })) : [
          {
            company_name: "",
            job_title: "",
            start_date: "",
            end_date: "",
            technologies: "",
            display_order: 0,
          },
        ],
      opt_employers:
        record?.opt_employers?.length ? record.opt_employers.map((emp, index) => ({
          id: emp.id,
          employer_name: emp.employer_name,
          start_date: emp.start_date ?? "",
          end_date: emp.end_date ?? "",
          role_or_notes: emp.role_or_notes ?? "",
          display_order: emp.display_order ?? index,
        })) : [],
      stem_opt_employers:
        record?.stem_opt_employers?.length ? record.stem_opt_employers.map((emp, index) => ({
          id: emp.id,
          employer_name: emp.employer_name,
          start_date: emp.start_date ?? "",
          end_date: emp.end_date ?? "",
          e_verify_or_notes: emp.e_verify_or_notes ?? "",
          display_order: emp.display_order ?? index,
        })) : [],
    }),
    [record],
  );

  const form = useForm<ResumeQcSchema>({
    resolver: zodResolver(resumeQcSchema) as never,
    defaultValues,
  });

  const experiences = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const optEmployers = useFieldArray({
    control: form.control,
    name: "opt_employers",
  });

  const stemOptEmployers = useFieldArray({
    control: form.control,
    name: "stem_opt_employers",
  });

  const cptTaken = form.watch("cpt_taken");
  const optTaken = form.watch("opt_taken");
  const stemOptTaken = form.watch("stem_opt_taken");

  const onSubmit = (values: ResumeQcSchema) => {
    startTransition(async () => {
      const response = await saveResumeQcAction(values);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      if (!record?.id) {
        window.location.href = "/resume-qc";
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Section 1: Candidate & QC Identification ──────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <User className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Candidate & QC List Identification
              </h3>
              <p className="text-xs text-slate-400">
                Primary candidate details and unique QC checklist title for searching and grouping.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="candidate_name">Candidate Name *</Label>
              <Input
                id="candidate_name"
                {...form.register("candidate_name")}
                placeholder="e.g. Alex Rivera"
              />
              <p className="text-xs text-rose-300">
                {form.formState.errors.candidate_name?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qc_list_name">QC List Name (Search Identifier) *</Label>
              <Input
                id="qc_list_name"
                {...form.register("qc_list_name")}
                placeholder="e.g. Q3 Cloud Architect QC List"
              />
              <p className="text-xs text-rose-300">
                {form.formState.errors.qc_list_name?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Id</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="candidate@example.com"
              />
              <p className="text-xs text-rose-300">
                {form.formState.errors.email?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+1 (555) 000-0000"
              />
              <p className="text-xs text-rose-300">
                {form.formState.errors.phone?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                {...form.register("linkedin_url")}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology">Technology</Label>
              <Input
                id="technology"
                {...form.register("technology")}
                placeholder="e.g. React / Node.js / AWS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visa_status">Visa Status</Label>
              <Input
                id="visa_status"
                {...form.register("visa_status")}
                placeholder="e.g. H1B / OPT / Green Card"
              />
            </div>

            <div className="space-y-2">
              <Label>US Arrival Date</Label>
              <Controller
                control={form.control}
                name="us_arrival_date"
                render={({ field: { value, onChange } }) => (
                  <MonthYearPicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select arrival month & year"
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Education & Degrees ────────────────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-400">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Education & Degree Durations
              </h3>
              <p className="text-xs text-slate-400">
                Record start and end dates for academic milestones.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Bachelors Degree Duration
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Controller
                    control={form.control}
                    name="bachelors_start_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select Bachelors start"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Controller
                    control={form.control}
                    name="bachelors_end_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select Bachelors end"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Master&apos;s Degree Duration
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Controller
                    control={form.control}
                    name="masters_start_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select Master's start"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Controller
                    control={form.control}
                    name="masters_end_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select Master's end"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Experiences (Dynamic List) ─────────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400">
                <Briefcase className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Experiences
                </h3>
                <p className="text-xs text-slate-400">
                  Add work experiences with 3-4 customizable detail fields per entry.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {experiences.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-semibold text-sm text-sky-400">
                    Experience #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => experiences.remove(index)}>
                    <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      {...form.register(`experiences.${index}.company_name`)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title / Role *</Label>
                    <Input
                      {...form.register(`experiences.${index}.job_title`)}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Controller
                      control={form.control}
                      name={`experiences.${index}.start_date`}
                      render={({ field: { value, onChange } }) => (
                        <MonthYearPicker
                          value={value}
                          onChange={onChange}
                          placeholder="Select start date"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Controller
                      control={form.control}
                      name={`experiences.${index}.end_date`}
                      render={({ field: { value, onChange } }) => (
                        <MonthYearPicker
                          value={value}
                          onChange={onChange}
                          placeholder="Select end date"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Technologies / Description Summary</Label>
                    <Input
                      {...form.register(`experiences.${index}.technologies`)}
                      placeholder="e.g. React, Next.js, GraphQL, Microservices architecture"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                experiences.append({
                  company_name: "",
                  job_title: "",
                  start_date: "",
                  end_date: "",
                  technologies: "",
                  display_order: experiences.fields.length,
                })
              }>
              <Plus className="size-4 mr-2" />
              Add Experience Field / Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: CPT Information ────────────────────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400">
                <Calendar className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  CPT Taken Status & Details
                </h3>
                <p className="text-xs text-slate-400">
                  Did the candidate take CPT? If yes, record dates and employer name.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="cpt_taken" className="text-sm text-slate-300">
                CPT Taken?
              </Label>
              <input
                id="cpt_taken"
                type="checkbox"
                {...form.register("cpt_taken")}
                className="size-5 rounded border-white/20 bg-white/5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {cptTaken && (
            <div className="grid gap-5 md:grid-cols-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
              <div className="space-y-2">
                <Label>CPT Start Date</Label>
                <Controller
                  control={form.control}
                  name="cpt_start_date"
                  render={({ field: { value, onChange } }) => (
                    <MonthYearPicker
                      value={value}
                      onChange={onChange}
                      placeholder="Select CPT start"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>CPT End Date</Label>
                <Controller
                  control={form.control}
                  name="cpt_end_date"
                  render={({ field: { value, onChange } }) => (
                    <MonthYearPicker
                      value={value}
                      onChange={onChange}
                      placeholder="Select CPT end"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpt_employer_name">CPT Employer&apos;s Name</Label>
                <Input
                  id="cpt_employer_name"
                  {...form.register("cpt_employer_name")}
                  placeholder="e.g. University Labs Inc."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 5: OPT Information & Employers ────────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400">
                <Building2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  OPT Taken Status & Employers
                </h3>
                <p className="text-xs text-slate-400">
                  Record OPT dates and add 3-4 customizable fields per employer during OPT tenure.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="opt_taken" className="text-sm text-slate-300">
                OPT Taken?
              </Label>
              <input
                id="opt_taken"
                type="checkbox"
                {...form.register("opt_taken")}
                className="size-5 rounded border-white/20 bg-white/5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {optTaken && (
            <div className="space-y-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Overall OPT Start Date</Label>
                  <Controller
                    control={form.control}
                    name="opt_start_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select OPT start"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overall OPT End Date</Label>
                  <Controller
                    control={form.control}
                    name="opt_end_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select OPT end"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold text-slate-300">
                  OPT Employer&apos;s Name & Details (Multiple entries supported)
                </h4>
                {optEmployers.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-semibold text-blue-300">
                        OPT Employer #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => optEmployers.remove(index)}>
                        <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Employer&apos;s Name *</Label>
                        <Input
                          {...form.register(`opt_employers.${index}.employer_name`)}
                          placeholder="e.g. Tech Solutions Inc"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Role / Notes</Label>
                        <Input
                          {...form.register(`opt_employers.${index}.role_or_notes`)}
                          placeholder="e.g. Software Consultant"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start Date</Label>
                        <Controller
                          control={form.control}
                          name={`opt_employers.${index}.start_date`}
                          render={({ field: { value, onChange } }) => (
                            <MonthYearPicker
                              value={value}
                              onChange={onChange}
                              placeholder="Select start"
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">End Date</Label>
                        <Controller
                          control={form.control}
                          name={`opt_employers.${index}.end_date`}
                          render={({ field: { value, onChange } }) => (
                            <MonthYearPicker
                              value={value}
                              onChange={onChange}
                              placeholder="Select end"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    optEmployers.append({
                      employer_name: "",
                      role_or_notes: "",
                      start_date: "",
                      end_date: "",
                      display_order: optEmployers.fields.length,
                    })
                  }>
                  <Plus className="size-3.5 mr-1.5" />
                  Add OPT Employer Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 6: STEM OPT Information & Employers ───────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-400/20 text-teal-400">
                <ClipboardCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Stem OPT Taken Status & Employers
                </h3>
                <p className="text-xs text-slate-400">
                  Record STEM Extension dates and add employer / E-Verify checkpoints.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="stem_opt_taken" className="text-sm text-slate-300">
                Stem OPT Taken?
              </Label>
              <input
                id="stem_opt_taken"
                type="checkbox"
                {...form.register("stem_opt_taken")}
                className="size-5 rounded border-white/20 bg-white/5 accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {stemOptTaken && (
            <div className="space-y-6 rounded-2xl border border-teal-500/20 bg-teal-500/[0.03] p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Overall STEM OPT Start Date</Label>
                  <Controller
                    control={form.control}
                    name="stem_opt_start_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select STEM OPT start"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overall STEM OPT End Date</Label>
                  <Controller
                    control={form.control}
                    name="stem_opt_end_date"
                    render={({ field: { value, onChange } }) => (
                      <MonthYearPicker
                        value={value}
                        onChange={onChange}
                        placeholder="Select STEM OPT end"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold text-slate-300">
                  Stem OPT Employer&apos;s Name & Details (Multiple entries supported)
                </h4>
                {stemOptEmployers.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-semibold text-teal-300">
                        Stem OPT Employer #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => stemOptEmployers.remove(index)}>
                        <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Employer&apos;s Name *</Label>
                        <Input
                          {...form.register(`stem_opt_employers.${index}.employer_name`)}
                          placeholder="e.g. Enterprise Systems Corp"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">E-Verify / Notes</Label>
                        <Input
                          {...form.register(`stem_opt_employers.${index}.e_verify_or_notes`)}
                          placeholder="e.g. E-Verify ID #998877"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start Date</Label>
                        <Controller
                          control={form.control}
                          name={`stem_opt_employers.${index}.start_date`}
                          render={({ field: { value, onChange } }) => (
                            <MonthYearPicker
                              value={value}
                              onChange={onChange}
                              placeholder="Select start"
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">End Date</Label>
                        <Controller
                          control={form.control}
                          name={`stem_opt_employers.${index}.end_date`}
                          render={({ field: { value, onChange } }) => (
                            <MonthYearPicker
                              value={value}
                              onChange={onChange}
                              placeholder="Select end"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    stemOptEmployers.append({
                      employer_name: "",
                      e_verify_or_notes: "",
                      start_date: "",
                      end_date: "",
                      display_order: stemOptEmployers.fields.length,
                    })
                  }>
                  <Plus className="size-3.5 mr-1.5" />
                  Add STEM OPT Employer Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Footer Actions ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => (window.location.href = "/resume-qc")}
          disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-40">
          <Save className="size-4 mr-2" />
          {isPending ? "Saving QC Record..." : record?.id ? "Update QC Record" : "Save QC Record"}
        </Button>
      </div>
    </form>
  );
}
