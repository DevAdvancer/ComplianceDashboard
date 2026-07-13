"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Archive,
  FileSearch,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  TimerReset,
} from "lucide-react";

import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/app";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const adminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/records", label: "Compliance Records", icon: FolderKanban },
  { href: "/pending", label: "Pending Requests", icon: TimerReset },
  { href: "/search", label: "Search", icon: Search },
  {
    href: "/records/sample/report",
    label: "Reports",
    icon: FileSearch,
    disabled: true,
  },
  { href: "/settings", label: "Settings", icon: Settings },
];

const marketingNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/records/new", label: "New Request", icon: FolderKanban },
  { href: "/records", label: "Sent Requests", icon: FolderKanban },
];

function SidebarContent({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = role === "Admin" ? adminNavItems : marketingNavItems;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img
              src="/silverspace.png"
              alt="Silverspace Icon"
              className="size-8 object-contain"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.34em] text-sky-300/80">
              CMS
            </div>
            <div className="text-xl font-semibold text-white">
              Compliance OS
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          {role === "Admin"
            ? "Enterprise workflow for candidate compliance, review, approval, and reporting."
            : "Marketing can submit new compliance requests for Admin review."}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "border border-sky-400/20 bg-sky-500/10 text-white"
                  : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-white",
                item.disabled && "pointer-events-none opacity-50",
              )}>
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Archive className="size-4 text-violet-300" />
          Audit-ready workflow
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full justify-start">
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AppSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden w-80 shrink-0 lg:block">
      <div className="sticky top-6 h-[calc(100vh-3rem)]">
        <SidebarContent role={role} />
      </div>
    </aside>
  );
}

export function MobileSidebar({
  trigger,
  role,
}: {
  trigger: React.ReactNode;
  role: UserRole;
}) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="left-0 top-0 h-screen w-[86vw] max-w-sm rounded-none rounded-r-3xl p-5">
        <SidebarContent role={role} />
        <DrawerClose asChild>
          <Button variant="ghost" className="mt-4 w-full">
            Close
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
