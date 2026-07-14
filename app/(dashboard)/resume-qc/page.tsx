import { PageHeader } from "@/components/layout/page-header";
import { ResumeQcList } from "@/components/resume-qc/resume-qc-list";
import { getAuthContext } from "@/lib/auth/session";
import { getResumeQcRecords } from "@/lib/db/qc-queries";

export default async function ResumeQcPage() {
  await getAuthContext({ allowedRoles: ["Admin"] });
  const initialRecords = await getResumeQcRecords();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Quality Control"
        title="Resume QC Management"
        description="Audit and manage candidate resume details. Search uniquely by Candidate Name and QC List Name across degree durations, work experiences, CPT/OPT/STEM OPT histories, and employer verifications."
      />
      <ResumeQcList initialRecords={initialRecords} />
    </div>
  );
}
