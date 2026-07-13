import { PageHeader } from "@/components/layout/page-header";
import { LiveSearch } from "@/components/records/live-search";
import { getAuthContext } from "@/lib/auth/session";

export default async function SearchPage() {
  await getAuthContext({ allowedRoles: ["Admin"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Live Search"
        title="Compliance Search"
        description="Search across candidate name, technology, vendor, client, visa status, role, and status with realtime refresh support."
      />
      <LiveSearch />
    </div>
  );
}
