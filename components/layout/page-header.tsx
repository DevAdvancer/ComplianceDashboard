import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-xs uppercase tracking-[0.34em] text-sky-300/80">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {badge ? <Badge variant="sky">{badge}</Badge> : null}
      </div>
    </div>
  );
}
