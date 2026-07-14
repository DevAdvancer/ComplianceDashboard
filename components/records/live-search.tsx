"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FolderKanban, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/records/status-badge";
import { useRealtimeRecords } from "@/hooks/use-realtime-records";
import type { SearchResultItem } from "@/app/api/search/route";
import type { RecordStatus } from "@/lib/types/app";
import { formatDate } from "@/lib/utils";

export function LiveSearch() {
  const [query, setQuery] = useState("");

  useRealtimeRecords(["records-search", query]);

  const result = useQuery({
    queryKey: ["records-search", query],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to search records");
      }
      return (await response.json()) as SearchResultItem[];
    },
    enabled: query.trim().length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by candidate, technology, vendor, client, visa, role, or status across Compliance and QC databases"
          className="pl-11"
        />
      </div>

      {query.trim().length === 0 ? (
        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-6 text-center text-sm text-slate-400">
            Start typing in the search box above to find and view records across Compliance and Resume QC databases.
          </CardContent>
        </Card>
      ) : result.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-400">
            Searching records across databases...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {result.data?.map((record) =>
            record.type === "Both" ? (
              <Card
                key={`${record.type}-${record.id}`}
                className="transition border-sky-400/30 bg-sky-500/[0.02]">
                <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="text-lg font-medium text-white">
                        {record.candidate_name}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                        <FolderKanban className="size-3" />
                        Compliance
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <ClipboardCheck className="size-3" />
                        QC
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      {record.subtitle}
                    </div>
                    <div className="text-xs text-slate-500">
                      Created {formatDate(record.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-sm text-slate-400">
                      {record.vendor}
                    </div>
                    <div className="flex items-center gap-2">
                      {record.compliance_href ? (
                        <Link
                          href={record.compliance_href}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-300 transition">
                          <FolderKanban className="size-3.5" />
                          Compliance Report
                        </Link>
                      ) : null}
                      {record.qc_href ? (
                        <Link
                          href={record.qc_href}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 transition">
                          <ClipboardCheck className="size-3.5" />
                          Resume QC
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Link key={`${record.type}-${record.id}`} href={record.href}>
                <Card className="transition hover:border-sky-400/30">
                  <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="text-lg font-medium text-white">
                          {record.candidate_name}
                        </div>
                        {record.type === "Compliance" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                            <FolderKanban className="size-3" />
                            Compliance
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                            <ClipboardCheck className="size-3" />
                            QC
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {record.subtitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        Created {formatDate(record.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm text-slate-400">
                        {record.vendor}
                      </div>
                      {record.type === "Compliance" ? (
                        <StatusBadge status={record.status as RecordStatus} />
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400 border border-sky-400/20">
                          {record.status}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ),
          )}
          {result.data?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-slate-400">
                No records matched your search.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
