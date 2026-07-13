import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-200">{item.label}</span>
          )}
          {index < items.length - 1 ? (
            <ChevronRight className="size-3.5" />
          ) : null}
        </div>
      ))}
    </nav>
  );
}
