import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ComplianceReportView } from "@/components/report/compliance-report-view";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/lib/auth/session";
import { getComplianceRecordById } from "@/lib/db/queries";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthContext();
  const { id } = await params;
  const record = await getComplianceRecordById(id);

  if (!record || (auth.role === "Marketing" && record.created_by !== auth.user.id)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance Report"
        title={`${record.candidate_name} report`}
        description="A polished, printable report that preserves the required information hierarchy in a modern dark enterprise layout."
        actions={
          auth.role === "Admin" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/records/${record.id}/edit`}>
                  <Pencil className="size-4 mr-2" />
                  Edit Full Record
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/records/${record.id}/review`}>
                  <ShieldCheck className="size-4 mr-2" />
                  Add/Edit References
                </Link>
              </Button>
            </div>
          ) : null
        }
      />
      <ComplianceReportView record={record} />
    </div>
  );
}
