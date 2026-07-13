"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Copy, Download, FileSpreadsheet, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/records/status-badge";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";
import {
  formatDateTime,
  formatMonthYear,
  formatRecordCode,
} from "@/lib/utils";

function ReportRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10 last:border-b-0 py-3.5 px-4 sm:px-6 hover:bg-white/[0.015] transition-colors">
      <div className="md:col-span-4 font-semibold text-slate-300 text-sm flex items-center">
        {label}
      </div>
      <div className="md:col-span-8 text-sm text-white mt-1 md:mt-0 font-medium">
        {children}
      </div>
    </div>
  );
}

export function ComplianceReportView({
  record,
}: {
  record: ComplianceRecordWithRelations;
}) {
  const allReferences = record.previous_companies.flatMap(
    (comp) => comp.references,
  );

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border border-white/10 bg-slate-950/60 shadow-2xl">
        <CardHeader className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Badge variant="violet" className="font-mono">
                  {formatRecordCode(record.id)}
                </Badge>
                <Badge variant="sky">Compliance Report</Badge>
                <StatusBadge status={record.status} />
              </div>
              <CardTitle className="text-3xl">
                {record.candidate_name}
              </CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                Submitted {formatDateTime(record.created_at)} · Created by{" "}
                {record.creator?.name ?? "Unknown"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href={`/api/reports/${record.id}/csv`}>
                  <Download className="size-4" />
                  CSV
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/api/reports/${record.id}/excel`}>
                  <FileSpreadsheet className="size-4" />
                  Excel
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/api/reports/${record.id}/pdf`}>
                  <Download className="size-4" />
                  PDF
                </Link>
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="size-4" />
                Print
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }>
                <Copy className="size-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/10">
            <ReportRow label="Name of the Candidate:">
              {record.candidate_name || "N/A"}
            </ReportRow>
            <ReportRow label="Visa Status:">
              {record.visa_status || "N/A"}
            </ReportRow>
            <ReportRow label="Candidate Technology:">
              {record.candidate_technology || "N/A"}
            </ReportRow>
            <ReportRow label="Job Role (Applied):">
              {record.applied_role || "N/A"}
            </ReportRow>
            <ReportRow label="Location Showed:">
              {record.location || "N/A"}
            </ReportRow>
            <ReportRow label="Contract Tenure:">
              {record.contract_tenure || "N/A"}
            </ReportRow>
            <ReportRow label="Vendor Name and Contact Info:">
              <div className="space-y-0.5">
                <div className="font-semibold text-white">
                  {record.vendor_contact_name || "N/A"}
                </div>
                <div className="text-slate-300">
                  O {record.vendor_name || "N/A"} | M {record.vendor_phone || "N/A"}
                </div>
                <div className="text-slate-400">
                  {record.vendor_email || "N/A"}
                </div>
              </div>
            </ReportRow>
            <ReportRow label="End Client (Vendor Hiring For):">
              {record.end_client || "N/A"}
            </ReportRow>

            {record.previous_companies.map((company, idx) => (
              <ReportRow
                key={company.id}
                label={`Reference Provided: Company ${idx + 1}`}>
                {company.company_name} | {company.job_title} |{" "}
                {formatMonthYear(company.employment_start)} -{" "}
                {formatMonthYear(company.employment_end)}
              </ReportRow>
            ))}

            {allReferences.map((ref, idx) => (
              <ReportRow key={ref.id} label={`Reference ${idx + 1}:`}>
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">
                    {ref.reference_name || "N/A"}
                  </div>
                  <div className="text-slate-300">
                    {ref.designation || "N/A"}
                  </div>
                  {ref.email ? (
                    <div className="text-slate-400">{ref.email}</div>
                  ) : null}
                  {ref.phone ? (
                    <div className="text-slate-400">{ref.phone}</div>
                  ) : null}
                </div>
              </ReportRow>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
