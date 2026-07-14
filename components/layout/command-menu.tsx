"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { ClipboardCheck, FolderKanban, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppShellStore } from "@/lib/stores/app-shell-store";
import type { UserRole } from "@/lib/types/app";
import type { SearchResultItem } from "@/app/api/search/route";

export function CommandMenu({}: { role?: UserRole } = {}) {
  const router = useRouter();
  const { commandMenuOpen, setCommandMenuOpen } = useAppShellStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName || "") || target?.isContentEditable;

      if (
        (!isInput && event.shiftKey && event.key.toLowerCase() === "s") ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault();
        const nextState = !commandMenuOpen;
        setCommandMenuOpen(nextState);
        if (!nextState) {
          setQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandMenuOpen, setCommandMenuOpen]);

  const result = useQuery({
    queryKey: ["command-menu-search", query],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to search records");
      }
      return (await response.json()) as SearchResultItem[];
    },
    enabled: commandMenuOpen && query.trim().length > 0,
  });

  const handleSelect = (href: string) => {
    setCommandMenuOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleOpenChange = (open: boolean) => {
    setCommandMenuOpen(open);
    if (!open) {
      setQuery("");
    }
  };

  return (
    <Dialog open={commandMenuOpen} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined} className="overflow-hidden p-0 sm:max-w-2xl border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl">
        <DialogTitle className="sr-only">Search across databases</DialogTitle>
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="flex items-center gap-2.5 border-b border-white/10 px-4">
            <Search className="size-4 text-sky-400" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              className="h-14 w-full bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Search across Compliance and QC databases (press Shift + S to toggle)..."
            />
          </div>
          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            {query.trim().length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-slate-400">
                Type above to search across Compliance and Resume QC databases...
              </div>
            ) : result.isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Searching across Compliance & Resume QC databases...
              </div>
            ) : result.data && result.data.length > 0 ? (
              <Command.Group
                heading={`Found ${result.data.length} matching record${result.data.length === 1 ? "" : "s"}`}
                className="text-xs text-slate-500 px-2 py-1.5">
                {result.data.map((record) => (
                  <Command.Item
                    key={`${record.type}-${record.id}`}
                    value={`${record.type}-${record.id}`}
                    onSelect={() => handleSelect(record.href)}
                    className="flex flex-col gap-1.5 rounded-xl px-3.5 py-3 text-slate-200 transition hover:bg-white/5 cursor-pointer aria-selected:bg-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {record.candidate_name}
                        </span>
                        {record.type === "Both" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                              <FolderKanban className="size-3" />
                              Compliance
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                              <ClipboardCheck className="size-3" />
                              QC
                            </span>
                          </div>
                        ) : record.type === "Compliance" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                            <FolderKanban className="size-3" />
                            Compliance
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                            <ClipboardCheck className="size-3" />
                            QC
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">
                          {record.status}
                        </span>
                        {record.type === "Both" ? (
                          <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
                            {record.compliance_href ? (
                              <button
                                type="button"
                                onClick={() => handleSelect(record.compliance_href!)}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/20 px-2 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition">
                                <FolderKanban className="size-3" />
                                Report
                              </button>
                            ) : null}
                            {record.qc_href ? (
                              <button
                                type="button"
                                onClick={() => handleSelect(record.qc_href!)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition">
                                <ClipboardCheck className="size-3" />
                                QC List
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{record.subtitle}</span>
                      <span className="text-slate-500">{record.vendor}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : (
              <Command.Empty className="px-4 py-8 text-center text-sm text-slate-400">
                No matching records found in Compliance or Resume QC databases.
              </Command.Empty>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
