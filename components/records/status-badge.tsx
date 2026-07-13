import { Badge } from "@/components/ui/badge";
import type { RecordStatus } from "@/lib/types/app";

const variantMap: Record<
  RecordStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Draft: "violet",
  Pending: "amber",
  Approved: "green",
  Rejected: "rose",
  Archived: "default",
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
