import { ComplianceForm } from "@/components/forms/compliance-form";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthContext } from "@/lib/auth/session";

export default async function NewRecordPage() {
  await getAuthContext({ allowedRoles: ["Marketing"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Marketing Workflow"
        title="Create Compliance Record"
        description="Only Marketing can create a new compliance request and submit it into the pending queue for Admin review."
      />
      <ComplianceForm />
    </div>
  );
}
