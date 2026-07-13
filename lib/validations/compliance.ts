import { z } from "zod";

import { recordStatuses } from "@/lib/types/app";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const referenceSchema = z.object({
  id: z.string().uuid().optional(),
  previous_company_id: z.string().uuid().optional(),
  reference_name: z.string().default(""),
  designation: z.string().default(""),
  email: z.string().email("Enter a valid email").or(z.literal("")).default(""),
  phone: z
    .string()
    .refine((value) => value.length === 0 || phoneRegex.test(value), "Enter a valid phone number")
    .default(""),
  notes: z.string().default(""),
});

export const previousCompanySchema = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().min(2, "Company name is required"),
  job_title: z.string().min(2, "Job title is required"),
  employment_start: z.string().min(1, "Start date is required"),
  employment_end: z.string().min(1, "End date is required"),
  display_order: z.number().int().nonnegative(),
  references: z.array(referenceSchema).default([]),
});

export const complianceRecordSchema = z.object({
  id: z.string().uuid().optional(),
  candidate_name: z.string().min(2, "Candidate name is required"),
  visa_status: z.string().min(2, "Visa status is required"),
  candidate_technology: z.string().min(2, "Technology is required"),
  applied_role: z.string().min(2, "Applied role is required"),
  location: z.string().min(2, "Location is required"),
  contract_tenure: z.string().min(2, "Contract tenure is required"),
  vendor_name: z.string().min(2, "Vendor name is required"),
  vendor_contact_name: z.string().min(2, "Vendor contact name is required"),
  vendor_phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  vendor_email: z.string().email("Enter a valid email"),
  end_client: z.string().min(2, "End client is required"),
  status: z.enum(recordStatuses).optional(),
  rejection_reason: z.string().optional(),
  previous_companies: z.array(previousCompanySchema).min(1, "Add at least one previous company"),
});

export const reviewReferenceSchema = z.object({
  record_id: z.string().uuid(),
  decision: z.enum(["draft", "approve", "reject"]),
  rejection_reason: z.string().optional(),
  previous_companies: z.array(previousCompanySchema).optional(),
  references: z.array(referenceSchema),
});

export type ComplianceRecordSchema = z.infer<typeof complianceRecordSchema>;
export type ReviewReferenceSchema = z.infer<typeof reviewReferenceSchema>;
