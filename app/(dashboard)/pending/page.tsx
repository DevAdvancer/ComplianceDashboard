import { PageHeader } from "@/components/layout/page-header";
import { RecordsTable } from "@/components/records/records-table";
import { getAuthContext } from "@/lib/auth/session";
import { getComplianceRecords } from "@/lib/db/queries";

export default async function PendingPage() {
  const auth = await getAuthContext({ allowedRoles: ["Admin"] });
  const records = await getComplianceRecords({
    role: auth.role,
    userId: auth.user.id,
    status: "Pending",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Review Queue"
        title="Pending Requests"
        description="Focus on records that are waiting for references, approval, or rejection."
        badge={`${records.length} waiting`}
      />
      <RecordsTable data={records} role={auth.role} />
    </div>
  );
}
