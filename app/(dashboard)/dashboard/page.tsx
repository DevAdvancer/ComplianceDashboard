import {
  Archive,
  CheckCircle2,
  CircleX,
  Clock3,
  FileStack,
  TimerReset,
  Waves,
} from "lucide-react";

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthContext } from "@/lib/auth/session";
import { getActivityFeed, getDashboardStats } from "@/lib/db/queries";

export default async function DashboardPage() {
  const auth = await getAuthContext();

  if (auth.role === "Marketing") {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Marketing Workspace"
          title="Send a new compliance request"
          description="Marketing users only create and submit new compliance records for Admin review."
          badge={auth.role}
        />

        <QuickActions role={auth.role} />
      </div>
    );
  }

  const [stats, activity] = await Promise.all([
    getDashboardStats(auth.user.id, auth.role),
    getActivityFeed(auth.user.id, auth.role),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace Overview"
        title="Enterprise compliance dashboard"
        description="Track submissions, review pipeline health, and jump into the next action without losing context."
        badge={auth.role}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Compliance Records"
          value={stats.totalRecords}
          hint="All-time tracked records"
          icon={<FileStack className="size-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          hint="Waiting for admin review"
          icon={<TimerReset className="size-5" />}
        />
        <StatCard
          label="Approved Records"
          value={stats.approvedRecords}
          hint="Included in compliance records"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Rejected Records"
          value={stats.rejectedRecords}
          hint="Need follow-up or revision"
          icon={<CircleX className="size-5" />}
        />
        <StatCard
          label="Archived Records"
          value={stats.archivedRecords}
          hint="Closed and archived"
          icon={<Archive className="size-5" />}
        />
        <StatCard
          label="Recent Activity"
          value={stats.recentActivity}
          hint="Events from the last 7 days"
          icon={<Clock3 className="size-5" />}
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pendingReviews}
          hint="Queue requiring action now"
          icon={<Waves className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartsSection
          pending={stats.pendingRequests}
          approved={stats.approvedRecords}
          rejected={stats.rejectedRecords}
        />
        <ActivityTimeline items={activity} />
      </div>

      <QuickActions role={auth.role} />
    </div>
  );
}
