import { Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/records/status-badge";
import type { ActivityItem } from "@/lib/types/app";
import { formatDateTime } from "@/lib/utils";

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
            Activity will appear here once submissions and reviews begin.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="mt-1 rounded-full border border-white/10 bg-white/[0.04] p-2">
                <Clock3 className="size-4 text-sky-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-white">{item.title}</div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {item.description}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {formatDateTime(item.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
