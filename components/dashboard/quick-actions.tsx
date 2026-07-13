import Link from "next/link";
import {
  ArrowRight,
  FolderSearch2,
  FolderKanban,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/lib/types/app";

export function QuickActions({ role }: { role: UserRole }) {
  const actions =
    role === "Marketing"
      ? [
          {
            href: "/records/new",
            title: "Create compliance request",
            description:
              "Start a new Marketing submission and send it directly to Admin for review.",
            icon: Plus,
          },
          {
            href: "/records",
            title: "View sent requests",
            description:
              "Track your sent compliance requests and monitor their review status.",
            icon: FolderKanban,
          },
        ]
      : [
          {
            href: "/pending",
            title: "Complete pending review",
            description:
              "Open requests sent from Marketing and add the remaining review details.",
            icon: ShieldCheck,
          },
          {
            href: "/records",
            title: "Browse compliance records",
            description:
              "Open the full compliance record list, including approved records and current workflow status.",
            icon: FolderKanban,
          },
          {
            href: "/search",
            title: "Global search",
            description:
              "Live search across candidate, visa, client, vendor, and technology.",
            icon: FolderSearch2,
          },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-sky-400/30 hover:bg-white/[0.04]">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <Icon className="size-5 text-sky-200" />
                </div>
                <ArrowRight className="size-4 text-slate-500 transition group-hover:text-white" />
              </div>
              <div className="font-medium text-white">{action.title}</div>
              <div className="mt-2 text-sm text-slate-400">
                {action.description}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
