"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Contact,
  Layers,
  ListChecks,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { saveComplianceRecordAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  complianceRecordSchema,
  type ComplianceRecordSchema,
} from "@/lib/validations/compliance";
import { recordStatuses } from "@/lib/types/app";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";

const steps = [
  "Compliance Information",
  "Previous Companies",
  "References",
] as const;

const REFERENCE_PRESETS = ["Manager", "Team Lead", "Senior Peer"] as const;

export function ComplianceForm({
  record,
  isAdminEdit = false,
}: {
  record?: ComplianceRecordWithRelations | null;
  isAdminEdit?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState<"all" | "steps">(
    isAdminEdit || record ? "all" : "steps",
  );
  const [isPending, startTransition] = useTransition();

  // Collect all references flat from existing companies
  const existingFlatRefs = useMemo(() => {
    if (!record?.previous_companies) return [];
    return record.previous_companies.flatMap((company) =>
      (company.references ?? []).map((ref) => ({
        id: ref.id,
        previous_company_id: ref.previous_company_id,
        reference_name: ref.reference_name ?? "",
        designation: ref.designation ?? "",
        email: ref.email ?? "",
        phone: ref.phone ?? "",
        notes: ref.notes ?? "",
      })),
    );
  }, [record]);

  const defaultValues = useMemo<ComplianceRecordSchema>(
    () => ({
      id: record?.id,
      candidate_name: record?.candidate_name ?? "",
      visa_status: record?.visa_status ?? "",
      candidate_technology: record?.candidate_technology ?? "",
      applied_role: record?.applied_role ?? "",
      location: record?.location ?? "",
      contract_tenure: record?.contract_tenure ?? "",
      vendor_name: record?.vendor_name ?? "",
      vendor_contact_name: record?.vendor_contact_name ?? "",
      vendor_phone: record?.vendor_phone ?? "",
      vendor_email: record?.vendor_email ?? "",
      end_client: record?.end_client ?? "",
      status: record?.status ?? "Draft",
      rejection_reason: record?.rejection_reason ?? "",
      previous_companies: record?.previous_companies?.map((company, index) => ({
        id: company.id,
        company_name: company.company_name,
        job_title: company.job_title,
        employment_start: company.employment_start,
        employment_end: company.employment_end,
        display_order: company.display_order ?? index,
        references: [],
      })) ?? [
        {
          company_name: "",
          job_title: "",
          employment_start: "",
          employment_end: "",
          display_order: 0,
          references: [],
        },
      ],
      flat_references: existingFlatRefs,
      employer_details: [],
    }),
    [record, existingFlatRefs],
  );

  const form = useForm<ComplianceRecordSchema>({
    resolver: zodResolver(complianceRecordSchema) as never,
    defaultValues,
  });

  const companies = useFieldArray({
    control: form.control,
    name: "previous_companies",
  });

  const flatReferences = useFieldArray({
    control: form.control,
    name: "flat_references",
  });

  const employerDetails = useFieldArray({
    control: form.control,
    name: "employer_details",
  });

  const companyValues = form.watch("previous_companies");
  const currentStatus = form.watch("status");

  const submit = (
    intent: "draft" | "submit" | "approve" | "reject" | "save",
  ) => {
    startTransition(async () => {
      const values = form.getValues();
      const response = await saveComplianceRecordAction(
        values,
        intent,
        values.rejection_reason,
      );

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    });
  };

  // ─── Section: Candidate & Vendor ────────────────────────────────────────────
  const renderCandidateFields = () => (
    <div className="grid gap-5 md:grid-cols-2">
      {[
        ["candidate_name", "Candidate Name"],
        ["candidate_technology", "Candidate Technology"],
        ["applied_role", "Applied Role"],
        ["location", "Location"],
        ["contract_tenure", "Contract Tenure"],
        ["vendor_name", "Vendor Name"],
        ["vendor_contact_name", "Vendor Contact Name"],
        ["vendor_phone", "Vendor Phone"],
        ["vendor_email", "Vendor Email"],
        ["end_client", "End Client"],
      ].map(([field, label]) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>{label}</Label>
          <Input
            id={field}
            {...form.register(field as keyof ComplianceRecordSchema)}
          />
          <p className="text-xs text-rose-300">
            {String(
              form.formState.errors[
                field as keyof ComplianceRecordSchema
              ]?.message ?? "",
            )}
          </p>
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor="visa_status">Visa Status</Label>
        <Input
          id="visa_status"
          {...form.register("visa_status")}
          placeholder="Enter visa status"
        />
        <p className="text-xs text-rose-300">
          {form.formState.errors.visa_status?.message}
        </p>
      </div>
    </div>
  );

  // ─── Section: Previous Companies (no refs nested) ────────────────────────────
  const renderCompanyFields = () => (
    <div className="space-y-6">
      {companies.fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="font-medium text-white">
              Company {index + 1}:{" "}
              {companyValues?.[index]?.company_name || "New Company"}
            </div>
            {companies.fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => companies.remove(index)}>
                <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                {...form.register(`previous_companies.${index}.company_name`)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                {...form.register(`previous_companies.${index}.job_title`)}
                placeholder="Enter job title"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Start</Label>
              <Controller
                control={form.control}
                name={`previous_companies.${index}.employment_start`}
                render={({ field: { value, onChange } }) => (
                  <MonthYearPicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select start month & year"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Employment End</Label>
              <Controller
                control={form.control}
                name={`previous_companies.${index}.employment_end`}
                render={({ field: { value, onChange } }) => (
                  <MonthYearPicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select end month & year"
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
        onClick={() =>
          companies.append({
            company_name: "",
            job_title: "",
            employment_start: "",
            employment_end: "",
            display_order: companies.fields.length,
            references: [],
          })
        }>
        <Plus className="size-4 mr-2" />
        Add Another Company
      </Button>
    </div>
  );

  // ─── Section: References (flat, independent of companies) ───────────────────
  const renderReferencesFields = () => (
    <div className="space-y-4">
      {flatReferences.fields.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">
          No references added yet. Use the buttons below to add.
        </p>
      ) : null}

      {flatReferences.fields.map((field, idx) => (
        <div
          key={field.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="font-medium text-white text-sm">
              Reference {idx + 1}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => flatReferences.remove(idx)}>
              <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Reference Name</Label>
              <Input
                {...form.register(`flat_references.${idx}.reference_name`)}
                placeholder="Enter reference name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role / Designation</Label>
              <Input
                {...form.register(`flat_references.${idx}.designation`)}
                placeholder="e.g. Manager, Team Lead"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                {...form.register(`flat_references.${idx}.email`)}
                placeholder="reference@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                {...form.register(`flat_references.${idx}.phone`)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                {...form.register(`flat_references.${idx}.notes`)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            flatReferences.append({
              reference_name: "",
              designation: "",
              email: "",
              phone: "",
              notes: "",
            })
          }>
          <Plus className="size-4 mr-2" />
          Add Reference
        </Button>
        {REFERENCE_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs border border-white/10 hover:bg-white/5"
            onClick={() =>
              flatReferences.append({
                reference_name: "",
                designation: preset,
                email: "",
                phone: "",
                notes: "",
              })
            }>
            + {preset}
          </Button>
        ))}
      </div>
    </div>
  );

  // ─── Section: Employer Details (admin only, name only, n entries) ────────────
  const renderEmployerDetailsFields = () => (
    <div className="space-y-4">
      {employerDetails.fields.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">
          No employer details added yet. Click below to add.
        </p>
      ) : null}

      {employerDetails.fields.map((field, idx) => (
        <div
          key={field.id}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <UserRound className="size-4 text-sky-400 shrink-0" />
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-slate-400">
              Employer {idx + 1}
            </Label>
            <Input
              {...form.register(`employer_details.${idx}.name`)}
              placeholder="Enter employer name"
              className="h-8 text-sm"
            />
            <p className="text-xs text-rose-300">
              {(form.formState.errors.employer_details?.[idx] as { name?: { message?: string } })?.name?.message ?? ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => employerDetails.remove(idx)}>
            <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => employerDetails.append({ name: "" })}>
        <Plus className="size-4 mr-2" />
        Add Employer
      </Button>
    </div>
  );

  // ─── Action buttons ──────────────────────────────────────────────────────────
  const renderActionButtons = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        {isAdminEdit ? (
          <>
            <Button
              type="button"
              variant="default"
              className="bg-sky-500 hover:bg-sky-400 text-white font-medium"
              disabled={isPending}
              onClick={() => submit("save")}>
              <Save className="size-4 mr-2" />
              Save All Details
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
              disabled={isPending}
              onClick={() => submit("approve")}>
              <CheckCircle2 className="size-4 mr-2" />
              Approve Record
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
              disabled={isPending}
              onClick={() => submit("reject")}>
              <XCircle className="size-4 mr-2" />
              Reject Record
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => submit("draft")}>
              <Save className="size-4 mr-2" />
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => submit("submit")}>
              <ShieldCheck className="size-4 mr-2" />
              Save & Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );

  // ─── All-details view (admin) ────────────────────────────────────────────────
  const renderAllView = () => (
    <div className="space-y-8">
      {/* 1. Candidate & Vendor */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Contact className="size-4 text-sky-400" />
            <h3 className="text-base font-semibold text-white">
              1. Candidate & Vendor Information
            </h3>
          </div>
          {renderCandidateFields()}
        </CardContent>
      </Card>

      {/* 2. Previous Companies */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Briefcase className="size-4 text-violet-400" />
            <h3 className="text-base font-semibold text-white">
              2. Previous Companies
            </h3>
          </div>
          {renderCompanyFields()}
        </CardContent>
      </Card>

      {/* 3. References */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Contact className="size-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              3. References
            </h3>
            <span className="ml-auto text-xs text-slate-500">
              {flatReferences.fields.length} added
            </span>
          </div>
          {renderReferencesFields()}
        </CardContent>
      </Card>

      {/* 4. Employer Details (admin only) */}
      {isAdminEdit && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <UserRound className="size-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">
                4. Employer Details
              </h3>
              <span className="ml-auto text-xs text-slate-500">
                {employerDetails.fields.length} added
              </span>
            </div>
            {renderEmployerDetailsFields()}
          </CardContent>
        </Card>
      )}

      {/* 5. Record Status & Admin Review (admin only) */}
      {isAdminEdit && (
        <Card className="border-sky-500/20 bg-sky-500/[0.02]">
          <CardContent className="pt-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                5. Record Status & Admin Review
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Record Status</Label>
                <select
                  id="status"
                  {...form.register("status")}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none">
                  {recordStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {currentStatus === "Rejected" && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rejection_reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection_reason"
                    {...form.register("rejection_reason")}
                    placeholder="Provide clear feedback on why this record was rejected..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── Step-by-step view (marketing / new records) ─────────────────────────────
  const renderStepsView = () => (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              index === step
                ? "border-sky-400/30 bg-sky-500/10 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-400"
            }`}
            onClick={() => setStep(index)}>
            <div className="text-xs uppercase tracking-[0.24em]">
              Step {index + 1}
            </div>
            <div className="mt-1 font-medium">{label}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}>
                {renderCandidateFields()}
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}>
                {renderCompanyFields()}
              </motion.div>
            ) : (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}>
                {renderReferencesFields()}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}>
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={step === steps.length - 1}
            onClick={() => setStep((value) => value + 1)}>
            Next
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header — only show view toggle for non-admin */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <h3 className="font-semibold text-white">
            {isAdminEdit ? "All-in-One Admin Editor" : "Compliance Record Form"}
          </h3>
          <p className="text-xs text-slate-400">
            {isAdminEdit
              ? "Edit candidate details, companies, references, employer details, and review decision all at once."
              : "Switch between Step-by-Step wizard or All-in-One View."}
          </p>
        </div>
        {!isAdminEdit && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={viewMode === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("all")}>
              <ListChecks className="size-4 mr-2" />
              All Details View
            </Button>
            <Button
              type="button"
              variant={viewMode === "steps" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("steps")}>
              <Layers className="size-4 mr-2" />
              Step-by-Step
            </Button>
          </div>
        )}
      </div>

      {renderActionButtons()}

      {viewMode === "all" ? renderAllView() : renderStepsView()}

      {renderActionButtons()}
    </div>
  );
}
