import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-slate-300",
        sky: "border-sky-400/20 bg-sky-500/10 text-sky-200",
        violet: "border-violet-400/20 bg-violet-500/10 text-violet-200",
        amber: "border-amber-400/20 bg-amber-500/10 text-amber-200",
        green: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
        rose: "border-rose-400/20 bg-rose-500/10 text-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
