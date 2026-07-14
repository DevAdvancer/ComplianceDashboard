import { NextResponse } from "next/server";

import { getOptionalAuthContext } from "@/lib/auth/session";
import { getComplianceRecords } from "@/lib/db/queries";
import { getResumeQcRecords } from "@/lib/db/qc-queries";
import type { RecordStatus } from "@/lib/types/app";

export type SearchResultItem = {
  id: string;
  type: "Compliance" | "QC" | "Both";
  candidate_name: string;
  subtitle: string;
  vendor: string;
  created_at: string;
  status: string;
  href: string;
  compliance_id?: string;
  compliance_href?: string;
  compliance_status?: string;
  qc_id?: string;
  qc_href?: string;
  qc_status?: string;
};

export async function GET(request: Request) {
  const auth = await getOptionalAuthContext();

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") as RecordStatus | null;

  const [complianceRecords, qcRecords] = await Promise.all([
    getComplianceRecords({
      role: auth.role,
      userId: auth.user.id,
      query,
      status: statusFilter ?? undefined,
    }),
    statusFilter ? Promise.resolve([]) : getResumeQcRecords({ query }),
  ]);

  const rawComplianceItems: SearchResultItem[] = complianceRecords.map((record) => ({
    id: record.id,
    type: "Compliance" as const,
    candidate_name: record.candidate_name,
    subtitle: `${record.candidate_technology} · ${record.applied_role} · ${record.end_client}`,
    vendor: record.vendor_name || "Direct / Internal",
    created_at: record.created_at,
    status: record.status,
    href: `/records/${record.id}/report`,
    compliance_id: record.id,
    compliance_href: `/records/${record.id}/report`,
    compliance_status: record.status,
  }));

  const rawQcItems: SearchResultItem[] = qcRecords.map((record) => ({
    id: record.id,
    type: "QC" as const,
    candidate_name: record.candidate_name,
    subtitle: `${record.technology || "General Tech"} · QC List: ${record.qc_list_name}`,
    vendor: record.visa_status ? `Visa: ${record.visa_status}` : "Visa: N/A",
    created_at: record.created_at,
    status: "Active QC",
    href: `/resume-qc/${record.id}`,
    qc_id: record.id,
    qc_href: `/resume-qc/${record.id}`,
    qc_status: "Active QC",
  }));

  // Group by normalized candidate name to merge when matching in both databases
  const candidateMap = new Map<
    string,
    { compliance: SearchResultItem[]; qc: SearchResultItem[] }
  >();

  for (const item of rawComplianceItems) {
    const key = item.candidate_name.trim().toLowerCase().replace(/\s+/g, " ");
    const group = candidateMap.get(key) ?? { compliance: [], qc: [] };
    group.compliance.push(item);
    candidateMap.set(key, group);
  }

  for (const item of rawQcItems) {
    const key = item.candidate_name.trim().toLowerCase().replace(/\s+/g, " ");
    const group = candidateMap.get(key) ?? { compliance: [], qc: [] };
    group.qc.push(item);
    candidateMap.set(key, group);
  }

  const results: SearchResultItem[] = [];

  for (const group of candidateMap.values()) {
    if (group.compliance.length > 0 && group.qc.length > 0) {
      // Candidate exists in both Compliance and QC -> merge into ONE result showing all data at once
      const cItem = group.compliance[0]!;
      const qItem = group.qc[0]!;
      results.push({
        id: `${cItem.id}_${qItem.id}`,
        type: "Both",
        candidate_name: cItem.candidate_name,
        subtitle: `Compliance: (${cItem.subtitle}) | QC: (${qItem.subtitle})`,
        vendor: `${cItem.vendor} | ${qItem.vendor}`,
        created_at:
          new Date(cItem.created_at) > new Date(qItem.created_at)
            ? cItem.created_at
            : qItem.created_at,
        status: `${cItem.status} & Active QC`,
        href: cItem.href,
        compliance_id: cItem.compliance_id,
        compliance_href: cItem.compliance_href,
        compliance_status: cItem.compliance_status,
        qc_id: qItem.qc_id,
        qc_href: qItem.qc_href,
        qc_status: qItem.qc_status,
      });
      // Add any remaining compliance/qc items if more than 1 of either exists for the same candidate name
      for (const extraC of group.compliance.slice(1)) results.push(extraC);
      for (const extraQ of group.qc.slice(1)) results.push(extraQ);
    } else {
      for (const c of group.compliance) results.push(c);
      for (const q of group.qc) results.push(q);
    }
  }

  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(results);
}
