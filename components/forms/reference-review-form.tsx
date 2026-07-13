"use client";

import { useMemo, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { reviewComplianceRecordAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";
import { formatMonthYear } from "@/lib/utils";
import {
  reviewReferenceSchema,
  type ReviewReferenceSchema,
} from "@/lib/validations/compliance";

export function ReferenceReviewForm({
  record,
}: {
  record: ComplianceRecordWithRelations;
}) {
  const [isPending, startTransition] = useTransition();

  const fallbackCompanyId = useMemo(
    () => record.previous_companies[0]?.id || crypto.randomUUID(),
    [record],
  );

  const defaultValues = useMemo<ReviewReferenceSchema>(
    () => ({
      record_id: record.id,
      decision: "draft",
      previous_companies:
        record.previous_companies.length > 0
          ? record.previous_companies.map((company) => ({
              id: company.id,
              company_name: company.company_name,
              job_title: company.job_title,
              employment_start: company.employment_start,
              employment_end: company.employment_end,
              display_order: company.display_order ?? 0,
              references: [],
            }))
          : [
              {
                id: fallbackCompanyId,
                company_name: record.vendor_name || "Previous Company",
                job_title: record.applied_role || "Consultant",
                employment_start: "2024-01-01",
                employment_end: "2025-01-01",
                display_order: 0,
                references: [],
              },
            ],
      references: (() => {
        const existingRefs = record.previous_companies.flatMap(
          (company) => company.references || [],
        );
        if (existingRefs.length > 0) {
          return existingRefs.map((ref) => ({
            id: ref.id,
            previous_company_id:
              ref.previous_company_id || fallbackCompanyId,
            reference_name: ref.reference_name ?? "",
            designation: ref.designation ?? "",
            email: ref.email ?? "",
            phone: ref.phone ?? "",
            notes: ref.notes ?? "",
          }));
        }
        return [
          {
            previous_company_id: fallbackCompanyId,
            reference_name: "",
            designation: "",
            email: "",
            phone: "",
            notes: "",
          },
        ];
      })(),
    }),
    [record, fallbackCompanyId],
  );

  const form = useForm<ReviewReferenceSchema>({
    resolver: zodResolver(reviewReferenceSchema) as never,
    defaultValues,
  });

  const companies = useFieldArray({
    control: form.control,
    name: "previous_companies",
  });

  const references = useFieldArray({
    control: form.control,
    name: "references",
  });

  const save = (decision: ReviewReferenceSchema["decision"]) => {
    startTransition(async () => {
      form.setValue("decision", decision);
      const response = await reviewComplianceRecordAction(form.getValues());

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);

      if (decision === "approve") {
        window.location.href = `/records/${record.id}`;
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Reference Provided */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Reference Provided
        </h3>

        {/* Candidate & Record Summary */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-xs text-slate-400">Candidate Name</div>
            <div className="text-sm font-medium text-white mt-0.5">
              {record.candidate_name || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Applied Role</div>
            <div className="text-sm font-medium text-white mt-0.5">
              {record.applied_role || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Technology</div>
            <div className="text-sm font-medium text-white mt-0.5">
              {record.candidate_technology || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">End Client</div>
            <div className="text-sm font-medium text-white mt-0.5">
              {record.end_client || "N/A"}
            </div>
          </div>
        </div>

        {/* Previous Companies Total Details */}
        <div className="grid gap-3">
          {companies.fields.map((company, companyIdx) => (
            <div
              key={company.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div className="font-medium text-white border-b border-white/10 pb-2">
                Company {companyIdx + 1}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Company Name</div>
                  <div className="font-medium text-white mt-0.5">
                    {company.company_name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Role / Job Title</div>
                  <div className="font-medium text-white mt-0.5">
                    {company.job_title || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Employment Start</div>
                  <div className="font-medium text-white mt-0.5">
                    {formatMonthYear(company.employment_start)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Employment End</div>
                  <div className="font-medium text-white mt-0.5">
                    {formatMonthYear(company.employment_end)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standalone References Addition */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white tracking-tight">
            References Addition
          </h3>
        </div>

        <div className="space-y-4">
          {references.fields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">
                  Reference {idx + 1}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => references.remove(idx)}>
                  <Trash2 className="size-4 text-slate-400 hover:text-red-400" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Reference Name</Label>
                  <Input
                    {...form.register(`references.${idx}.reference_name`)}
                    placeholder="Enter reference name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    {...form.register(`references.${idx}.designation`)}
                    placeholder="Enter role"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    {...form.register(`references.${idx}.email`)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phn number</Label>
                  <Input
                    {...form.register(`references.${idx}.phone`)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    {...form.register(`references.${idx}.notes`)}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              references.append({
                previous_company_id:
                  companies.fields[0]?.id || fallbackCompanyId,
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs border border-white/10 hover:bg-white/5"
            onClick={() =>
              references.append({
                previous_company_id:
                  companies.fields[0]?.id || fallbackCompanyId,
                reference_name: "",
                designation: "Manager",
                email: "",
                phone: "",
                notes: "",
              })
            }>
            + Manager
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs border border-white/10 hover:bg-white/5"
            onClick={() =>
              references.append({
                previous_company_id:
                  companies.fields[0]?.id || fallbackCompanyId,
                reference_name: "",
                designation: "Team Lead",
                email: "",
                phone: "",
                notes: "",
              })
            }>
            + Team Lead
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs border border-white/10 hover:bg-white/5"
            onClick={() =>
              references.append({
                previous_company_id:
                  companies.fields[0]?.id || fallbackCompanyId,
                reference_name: "",
                designation: "Senior Peer",
                email: "",
                phone: "",
                notes: "",
              })
            }>
            + Senior Peer
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => save("draft")}>
          <Save className="size-4 mr-2" />
          Save Draft
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => save("approve")}>
          <ShieldCheck className="size-4 mr-2" />
          Approve
        </Button>
      </div>
    </div>
  );
}
