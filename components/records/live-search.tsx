"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/records/status-badge";
import { useRealtimeRecords } from "@/hooks/use-realtime-records";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";
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
      return (await response.json()) as ComplianceRecordWithRelations[];
    },
    enabled: query.length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by candidate, technology, vendor, client, visa, role, or status"
          className="pl-11"
        />
      </div>

      {query.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-400">
            Start typing to search role-visible compliance records in real time.
          </CardContent>
        </Card>
      ) : result.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-400">
            Searching records...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {result.data?.map((record) => (
            <Link key={record.id} href={`/records/${record.id}/report`}>
              <Card className="transition hover:border-sky-400/30">
                <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="text-lg font-medium text-white">
                      {record.candidate_name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {record.candidate_technology} · {record.applied_role} ·{" "}
                      {record.end_client}
                    </div>
                    <div className="text-xs text-slate-500">
                      Created {formatDate(record.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm text-slate-400">
                      {record.vendor_name}
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
