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
