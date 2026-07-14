import { PageHeader } from "@/components/layout/page-header";
import { ResumeQcForm } from "@/components/forms/resume-qc-form";
import { getAuthContext } from "@/lib/auth/session";

export default async function NewResumeQcPage() {
  await getAuthContext({ allowedRoles: ["Admin"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Create Checkpoint"
        title="Add Resume QC Details"
        description="Fill out degree durations, customizable work experiences, visa status, arrival dates, and CPT / OPT / STEM OPT employer records."
      />
      <ResumeQcForm />
    </div>
  );
}
