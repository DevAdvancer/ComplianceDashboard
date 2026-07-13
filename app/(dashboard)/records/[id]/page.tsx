import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ComplianceReportView } from "@/components/report/compliance-report-view";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/lib/auth/session";
import { getComplianceRecordById } from "@/lib/db/queries";
import { formatRecordCode } from "@/lib/utils";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthContext();
  const { id } = await params;
  const record = await getComplianceRecordById(id);

  if (!record) {
    notFound();
  }

  if (auth.role === "Marketing" && record.created_by !== auth.user.id) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Compliance Record · ${formatRecordCode(record.id)}`}
        title={record.candidate_name}
        description={`Compliance details and report view for ${record.candidate_name}.`}
        badge={record.status}
        actions={
          auth.role === "Admin" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/records/${record.id}/edit`}>
                  <Pencil className="size-4 mr-2" />
                  Edit All Details & References
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
