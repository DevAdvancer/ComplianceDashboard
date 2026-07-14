"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Edit,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { deleteResumeQcAction } from "@/app/qc-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ResumeQcWithRelations } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

export function ResumeQcList({
  initialRecords,
}: {
  initialRecords: ResumeQcWithRelations[];
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [qcListFilter, setQcListFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const { data: records, isLoading } = useQuery({
    queryKey: ["resume-qc-list", query, candidateFilter, qcListFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (candidateFilter) params.set("candidateName", candidateFilter);
      if (qcListFilter) params.set("qcListName", qcListFilter);

      const response = await fetch(`/api/resume-qc?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to search Resume QC records");
      }
      return (await response.json()) as ResumeQcWithRelations[];
    },
    initialData: query === "" && candidateFilter === "" && qcListFilter === "" ? initialRecords : undefined,
  });

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the Resume QC record for "${name}"?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteResumeQcAction(id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["resume-qc-list"] });
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar & Unique Search Filters ───────────────────────── */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-slate-200">
              Unique Search by Candidate Name & QC List Name
            </div>
            <Link href="/resume-qc/new">
              <Button className="w-full md:w-auto bg-sky-500 hover:bg-sky-400 text-white">
                <Plus className="size-4 mr-2" />
                Add New Resume QC
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all fields..."
                className="pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
                placeholder="Filter specifically by Candidate Name..."
                className="pl-10 text-sm border-sky-500/30 bg-sky-500/5 focus:border-sky-400"
              />
            </div>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={qcListFilter}
                onChange={(e) => setQcListFilter(e.target.value)}
                placeholder="Filter specifically by QC List Name..."
                className="pl-10 text-sm border-violet-500/30 bg-violet-500/5 focus:border-violet-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Record List / Cards ───────────────────────────────────── */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-400">
            Searching Resume QC records...
          </CardContent>
        </Card>
      ) : !records || records.length === 0 ? (
        <Card className="border-white/10 bg-white/[0.02] py-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-base font-medium text-white">
              No Resume QC records found
            </div>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find any records matching your unique search criteria. You can create a new Resume QC checkpoint using the button above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card
              key={record.id}
              className="border-white/10 bg-white/[0.02] transition hover:border-sky-400/30">
              <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/resume-qc/${record.id}`}
                      className="text-lg font-semibold text-white hover:text-sky-300 transition">
                      {record.candidate_name}
                    </Link>
                    <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-0.5 text-xs font-medium text-violet-300">
                      {record.qc_list_name}
                    </span>
                    {record.visa_status && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                        {record.visa_status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-400">
                    {record.technology && (
                      <span>
                        <strong className="text-slate-300">Tech:</strong> {record.technology}
                      </span>
                    )}
                    {record.email && (
                      <span>
                        <strong className="text-slate-300">Email:</strong> {record.email}
                      </span>
                    )}
                    {record.phone && (
                      <span>
                        <strong className="text-slate-300">Phone:</strong> {record.phone}
                      </span>
                    )}
                  </div>

                  {/* Quick status overview badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                      <Briefcase className="size-3.5 text-emerald-400" />
                      {record.experiences?.length ?? 0} Experiences
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                      <GraduationCap className="size-3.5 text-violet-400" />
                      {record.bachelors_start_date || record.masters_start_date ? "Degrees Recorded" : "No Degree Dates"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs border ${
                        record.cpt_taken
                          ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }`}>
                      {record.cpt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      CPT: {record.cpt_taken ? "Yes" : "No"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs border ${
                        record.opt_taken
                          ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }`}>
                      {record.opt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      OPT: {record.opt_taken ? `Yes (${record.opt_employers?.length ?? 0} employers)` : "No"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs border ${
                        record.stem_opt_taken
                          ? "border-teal-400/30 bg-teal-500/10 text-teal-300"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }`}>
                      {record.stem_opt_taken ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      STEM OPT: {record.stem_opt_taken ? `Yes (${record.stem_opt_employers?.length ?? 0} employers)` : "No"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 pt-0.5">
                    Updated {formatDate(record.updated_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:flex-col md:items-end">
                  <div className="flex items-center gap-2">
                    <Link href={`/resume-qc/${record.id}`}>
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <Eye className="size-3.5" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/resume-qc/${record.id}/edit`}>
                      <Button variant="secondary" size="sm" className="gap-1.5 border border-sky-400/20 hover:bg-sky-500/10">
                        <Edit className="size-3.5 text-sky-400" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record.id, record.candidate_name)}
                      disabled={isPending}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
