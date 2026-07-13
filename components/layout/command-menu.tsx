"use client";

import { Command } from "cmdk";
import Link from "next/link";
import { Search } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppShellStore } from "@/lib/stores/app-shell-store";
import type { UserRole } from "@/lib/types/app";

const adminShortcuts = [
  { href: "/dashboard", label: "Go to Dashboard" },
  { href: "/records", label: "Open Compliance Records" },
  { href: "/records/new", label: "Create Compliance Record" },
  { href: "/pending", label: "View Pending Requests" },
  { href: "/search", label: "Search Records" },
];

const marketingShortcuts = [
  { href: "/dashboard", label: "Go to Dashboard" },
  { href: "/records/new", label: "Create Compliance Record" },
];

export function CommandMenu({ role }: { role: UserRole }) {
  const { commandMenuOpen, setCommandMenuOpen } = useAppShellStore();
  const shortcuts = role === "Admin" ? adminShortcuts : marketingShortcuts;

  return (
    <Dialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="bg-transparent">
          <div className="flex items-center gap-2 border-b border-white/10 px-4">
            <Search className="size-4 text-slate-500" />
            <Command.Input
              className="h-12 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Search pages and actions..."
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-slate-400">
              Nothing matched your query.
            </Command.Empty>
            <Command.Group
              heading="Quick actions"
              className="text-xs text-slate-500">
              {shortcuts.map((shortcut) => (
                <Command.Item key={shortcut.href} asChild>
                  <Link
                    href={shortcut.href}
                    className="flex rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                    onClick={() => setCommandMenuOpen(false)}>
                    {shortcut.label}
                  </Link>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
