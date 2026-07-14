import { notFound } from "next/navigation";

import { ResumeQcForm } from "@/components/forms/resume-qc-form";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthContext } from "@/lib/auth/session";
import { getResumeQcById } from "@/lib/db/qc-queries";

export default async function EditResumeQcPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getAuthContext({ allowedRoles: ["Admin"] });
  const { id } = await params;
  const record = await getResumeQcById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resume QC Edit"
        title={`Edit ${record.candidate_name}`}
        description={`Update details for ${record.qc_list_name}, including degree durations, dynamic experiences, CPT/OPT/STEM OPT checkpoints, and employer records.`}
        badge={record.visa_status ?? "Resume QC"}
      />
      <ResumeQcForm record={record} />
    </div>
  );
}
