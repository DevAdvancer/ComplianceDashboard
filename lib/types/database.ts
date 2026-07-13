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

export type ComplianceRecordWithRelations = ComplianceRecordRow & {
  creator?: UserProfile | null;
  approver?: UserProfile | null;
  previous_companies: (PreviousCompanyRow & {
    references: ReferenceRow[];
  })[];
};
