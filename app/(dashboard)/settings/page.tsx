import { SingleUserCreateCard } from "@/components/admin/single-user-create-card";
import { Lock, ShieldCheck, Users } from "lucide-react";

import { BulkUserImportCard } from "@/components/admin/bulk-user-import-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthContext } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";

export default async function SettingsPage() {
  const auth = await getAuthContext({ allowedRoles: ["Admin"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Profile metadata, access model, and security context for the current signed-in workspace."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div>Name: {auth.profile?.name ?? "Not provisioned"}</div>
            <div>
              Email: {auth.profile?.email ?? auth.user.email ?? "Unknown"}
            </div>
            <div>Role: {auth.role}</div>
            <div>Created: {formatDateTime(auth.profile?.created_at)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-sky-300" /> Supabase Auth
              login-only access
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-violet-300" /> Middleware-backed
              protected routes
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-emerald-300" /> Role-based RLS for
              Admin and Marketing
            </div>
          </CardContent>
        </Card>
        <SingleUserCreateCard />
        <BulkUserImportCard />
      </div>
    </div>
  );
}
