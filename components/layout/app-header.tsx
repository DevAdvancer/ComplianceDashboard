"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppShellStore } from "@/lib/stores/app-shell-store";
import type { UserRole } from "@/lib/types/app";
import type { UserProfile } from "@/lib/types/database";
import { formatRecordCode, initials } from "@/lib/utils";
import { MobileSidebar } from "@/components/layout/app-sidebar";

export function AppHeader({
  profile,
  role,
}: {
  profile: UserProfile | null;
  role: UserRole;
}) {
  const { setCommandMenuOpen } = useAppShellStore();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    ...segments.slice(1).map((segment, index) => ({
      href: `/${segments.slice(0, index + 2).join("/")}`,
      label: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(segment)
        ? formatRecordCode(segment)
        : segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()),
    })),
  ];

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 mb-8 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3">
          <MobileSidebar
            role={role}
            trigger={
              <Button variant="secondary" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
            }
          />
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img
                src="/silverspace.png"
                alt="Silverspace Icon"
                className="size-7 object-contain"
              />
            </div>
            <div className="space-y-1">
              <Breadcrumb items={breadcrumbs} />
              <div className="text-lg font-semibold text-white">
                Compliance Management System
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === "Admin" ? (
            <Button
              variant="secondary"
              onClick={() => setCommandMenuOpen(true)}
              className="hidden md:flex">
              <Search className="size-4" />
              Command
            </Button>
          ) : null}
          {role === "Marketing" ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/records/new">
                <Plus className="size-4" />
                New Record
              </Link>
            </Button>
          ) : null}
          {role === "Admin" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon">
                  <Bell className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Notifications coming from realtime status changes.
              </TooltipContent>
            </Tooltip>
          ) : null}
          <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
            {profile ? initials(profile.name) : "CM"}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
