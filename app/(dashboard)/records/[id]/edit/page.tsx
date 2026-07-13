import { notFound } from "next/navigation";

import { ComplianceForm } from "@/components/forms/compliance-form";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthContext } from "@/lib/auth/session";
import { getComplianceRecordById } from "@/lib/db/queries";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getAuthContext({
    allowedRoles: ["Admin"],
  });
  const { id } = await params;
  const record = await getComplianceRecordById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Full Record Edit"
        title={`Edit ${record.candidate_name}`}
        description="As an Admin, you can edit all candidate compliance details, previous companies, references, and review decision at once."
        badge={record.status}
      />
      <ComplianceForm record={record} isAdminEdit />
    </div>
  );
}

