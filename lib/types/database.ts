import type { RecordStatus, UserRole } from "@/lib/types/app";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      compliance_records: {
        Row: {
          id: string;
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
          status: RecordStatus;
          created_by: string;
          approved_by: string | null;
          rejection_reason: string | null;
          submitted_at: string | null;
          approved_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["compliance_records"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["compliance_records"]["Insert"]>;
        Relationships: [];
      };
      previous_companies: {
        Row: {
          id: string;
          compliance_record_id: string;
          company_name: string;
          job_title: string;
          employment_start: string;
          employment_end: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["previous_companies"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["previous_companies"]["Insert"]>;
        Relationships: [];
      };
      references: {
        Row: {
          id: string;
          previous_company_id: string;
          reference_name: string;
          designation: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["references"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["references"]["Insert"]>;
        Relationships: [];
      };
      employer_details: {
        Row: {
          id: string;
          compliance_record_id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employer_details"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["employer_details"]["Insert"]>;
        Relationships: [];
      };
      resume_qc: {
        Row: {
          id: string;
          candidate_name: string;
          qc_list_name: string;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          bachelors_start_date: string | null;
          bachelors_end_date: string | null;
          masters_start_date: string | null;
          masters_end_date: string | null;
          us_arrival_date: string | null;
          visa_status: string | null;
          technology: string | null;
          cpt_taken: boolean;
          cpt_start_date: string | null;
          cpt_end_date: string | null;
          cpt_employer_name: string | null;
          opt_taken: boolean;
          opt_start_date: string | null;
          opt_end_date: string | null;
          stem_opt_taken: boolean;
          stem_opt_start_date: string | null;
          stem_opt_end_date: string | null;
          h1b_taken: boolean;
          h1b_start_date: string | null;
          h1b_end_date: string | null;
          h4_taken: boolean;
          h4_start_date: string | null;
          h4_end_date: string | null;
          gc_taken: boolean;
          gc_start_date: string | null;
          gc_end_date: string | null;
          usc_taken: boolean;
          usc_start_date: string | null;
          usc_end_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resume_qc"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resume_qc"]["Insert"]>;
        Relationships: [];
      };
      resume_qc_experiences: {
        Row: {
          id: string;
          resume_qc_id: string;
          company_name: string;
          job_title: string;
          start_date: string | null;
          end_date: string | null;
          technologies: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resume_qc_experiences"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resume_qc_experiences"]["Insert"]>;
        Relationships: [];
      };
      resume_qc_opt_employers: {
        Row: {
          id: string;
          resume_qc_id: string;
          employer_name: string;
          start_date: string | null;
          end_date: string | null;
          role_or_notes: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resume_qc_opt_employers"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resume_qc_opt_employers"]["Insert"]>;
        Relationships: [];
      };
      resume_qc_stem_opt_employers: {
        Row: {
          id: string;
          resume_qc_id: string;
          employer_name: string;
          start_date: string | null;
          end_date: string | null;
          e_verify_or_notes: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["resume_qc_stem_opt_employers"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resume_qc_stem_opt_employers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type ComplianceRecordRow = Database["public"]["Tables"]["compliance_records"]["Row"];
export type PreviousCompanyRow = Database["public"]["Tables"]["previous_companies"]["Row"];
export type ReferenceRow = Database["public"]["Tables"]["references"]["Row"];
export type EmployerDetailRow = Database["public"]["Tables"]["employer_details"]["Row"];

export type ResumeQcRow = Database["public"]["Tables"]["resume_qc"]["Row"];
export type ResumeQcExperienceRow = Database["public"]["Tables"]["resume_qc_experiences"]["Row"];
export type ResumeQcOptEmployerRow = Database["public"]["Tables"]["resume_qc_opt_employers"]["Row"];
export type ResumeQcStemOptEmployerRow = Database["public"]["Tables"]["resume_qc_stem_opt_employers"]["Row"];

export type ComplianceRecordWithRelations = ComplianceRecordRow & {
  creator?: UserProfile | null;
  approver?: UserProfile | null;
  previous_companies: (PreviousCompanyRow & {
    references: ReferenceRow[];
  })[];
  employer_details?: EmployerDetailRow[];
};

export type ResumeQcWithRelations = ResumeQcRow & {
  creator?: UserProfile | null;
  experiences: ResumeQcExperienceRow[];
  opt_employers: ResumeQcOptEmployerRow[];
  stem_opt_employers: ResumeQcStemOptEmployerRow[];
};
