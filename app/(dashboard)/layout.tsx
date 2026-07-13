import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { getAuthContext } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  return (
    <>
      <CommandMenu role={auth.role} />
      <div className="mx-auto flex min-h-screen max-w-[1700px] gap-6 px-4 py-6 md:px-6">
        <AppSidebar role={auth.role} />
        <div className="min-w-0 flex-1">
          <AppHeader profile={auth.profile} role={auth.role} />
          {children}
        </div>
      </div>
    </>
  );
}
