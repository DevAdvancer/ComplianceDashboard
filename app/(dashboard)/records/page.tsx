import { PageHeader } from "@/components/layout/page-header";
import { RecordsTable } from "@/components/records/records-table";
import { getAuthContext } from "@/lib/auth/session";
import { getComplianceRecords } from "@/lib/db/queries";

export default async function RecordsPage() {
  const auth = await getAuthContext();
  const records = await getComplianceRecords({
    role: auth.role,
    userId: auth.user.id,
  });

  const isMarketing = auth.role === "Marketing";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isMarketing ? "Marketing Submissions" : "Data Table"}
        title={isMarketing ? "Sent Requests" : "Compliance Records"}
        description={
          isMarketing
            ? "Track all compliance requests you have sent and check their current review status."
            : "Search, sort, and manage all candidate compliance records from one place, including approved records and active workflow items."
        }
        badge={isMarketing ? `${records.length} sent requests` : `${records.length} records`}
      />
      <RecordsTable data={records} role={auth.role} />
    </div>
  );
}
