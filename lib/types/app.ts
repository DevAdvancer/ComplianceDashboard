export const recordStatuses = [
  "Draft",
  "Pending",
  "Approved",
  "Rejected",
  "Archived",
] as const;

export const userRoles = ["Admin", "Marketing"] as const;

export type RecordStatus = (typeof recordStatuses)[number];
export type UserRole = (typeof userRoles)[number];

export type ReferenceInput = {
  id?: string;
  previous_company_id?: string;
  reference_name: string;
  designation: string;
  email: string;
  phone: string;
  notes: string;
};

export type PreviousCompanyInput = {
  id?: string;
  company_name: string;
  job_title: string;
  employment_start: string;
  employment_end: string;
  display_order: number;
  references: ReferenceInput[];
};

export type EmployerDetailInput = {
  id?: string;
  name: string;
};

export type ComplianceRecordInput = {
  id?: string;
  candidate_name: string;
  visa_status: string;
  candidate_technology: string;
  applied_role: string;
  location: string;
  contract_tenure: string;
  vendor_name: string;
  vendor_contact_name: string;
  vendor_phone: string;
  vendor_email: string;
  end_client: string;
  status?: RecordStatus;
  rejection_reason?: string;
  previous_companies: PreviousCompanyInput[];
  flat_references?: ReferenceInput[];
  employer_details?: EmployerDetailInput[];
};

export type DashboardStats = {
  totalRecords: number;
  pendingRequests: number;
  approvedRecords: number;
  rejectedRecords: number;
  archivedRecords: number;
  recentActivity: number;
  pendingReviews: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: RecordStatus;
};

export type ResumeQcExperienceInput = {
  id?: string;
  company_name: string;
  job_title: string;
  start_date?: string;
  end_date?: string;
  technologies?: string;
  display_order?: number;
};

export type ResumeQcOptEmployerInput = {
  id?: string;
  employer_name: string;
  start_date?: string;
  end_date?: string;
  role_or_notes?: string;
  display_order?: number;
};

export type ResumeQcStemOptEmployerInput = {
  id?: string;
  employer_name: string;
  start_date?: string;
  end_date?: string;
  e_verify_or_notes?: string;
  display_order?: number;
};

export type ResumeQcInput = {
  id?: string;
  candidate_name: string;
  qc_list_name: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  bachelors_start_date?: string;
  bachelors_end_date?: string;
  masters_start_date?: string;
  masters_end_date?: string;
  us_arrival_date?: string;
  visa_status?: string;
  technology?: string;
  cpt_taken?: boolean;
  cpt_start_date?: string;
  cpt_end_date?: string;
  cpt_employer_name?: string;
  opt_taken?: boolean;
  opt_start_date?: string;
  opt_end_date?: string;
  stem_opt_taken?: boolean;
  stem_opt_start_date?: string;
  stem_opt_end_date?: string;
  experiences: ResumeQcExperienceInput[];
  opt_employers: ResumeQcOptEmployerInput[];
  stem_opt_employers: ResumeQcStemOptEmployerInput[];
};

