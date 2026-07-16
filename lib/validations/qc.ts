import { z } from "zod";

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

export const resumeQcExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().min(1, "Company name is required"),
  job_title: z.string().min(1, "Job title is required"),
  start_date: z.string().default(""),
  end_date: z.string().default(""),
  technologies: z.string().default(""),
  display_order: z.number().int().nonnegative().default(0),
});

export const resumeQcOptEmployerSchema = z.object({
  id: z.string().uuid().optional(),
  employer_name: z.string().min(1, "Employer name is required"),
  start_date: z.string().default(""),
  end_date: z.string().default(""),
  role_or_notes: z.string().default(""),
  display_order: z.number().int().nonnegative().default(0),
});

export const resumeQcStemOptEmployerSchema = z.object({
  id: z.string().uuid().optional(),
  employer_name: z.string().min(1, "Employer name is required"),
  start_date: z.string().default(""),
  end_date: z.string().default(""),
  e_verify_or_notes: z.string().default(""),
  display_order: z.number().int().nonnegative().default(0),
});

export const resumeQcSchema = z.object({
  id: z.string().uuid().optional(),
  candidate_name: z.string().min(2, "Candidate Name is required"),
  qc_list_name: z.string().min(1, "QC List Name is required").default("General Resume QC"),
  email: z.string().email("Enter a valid email").or(z.literal("")).default(""),
  phone: z
    .string()
    .refine((value) => value.length === 0 || phoneRegex.test(value), "Enter a valid phone number")
    .default(""),
  linkedin_url: z.string().default(""),
  bachelors_start_date: z.string().default(""),
  bachelors_end_date: z.string().default(""),
  masters_start_date: z.string().default(""),
  masters_end_date: z.string().default(""),
  us_arrival_date: z.string().default(""),
  visa_status: z.string().default(""),
  technology: z.string().default(""),
  cpt_taken: z.boolean().default(false),
  cpt_start_date: z.string().default(""),
  cpt_end_date: z.string().default(""),
  cpt_employer_name: z.string().default(""),
  opt_taken: z.boolean().default(false),
  opt_start_date: z.string().default(""),
  opt_end_date: z.string().default(""),
  stem_opt_taken: z.boolean().default(false),
  stem_opt_start_date: z.string().default(""),
  stem_opt_end_date: z.string().default(""),
  h1b_taken: z.boolean().default(false),
  h1b_start_date: z.string().default(""),
  h1b_end_date: z.string().default(""),
  h4_taken: z.boolean().default(false),
  h4_start_date: z.string().default(""),
  h4_end_date: z.string().default(""),
  gc_taken: z.boolean().default(false),
  gc_start_date: z.string().default(""),
  gc_end_date: z.string().default(""),
  usc_taken: z.boolean().default(false),
  usc_start_date: z.string().default(""),
  usc_end_date: z.string().default(""),
  experiences: z.array(resumeQcExperienceSchema).default([]),
  opt_employers: z.array(resumeQcOptEmployerSchema).default([]),
  stem_opt_employers: z.array(resumeQcStemOptEmployerSchema).default([]),
});

export type ResumeQcSchema = z.infer<typeof resumeQcSchema>;
export type ResumeQcExperienceSchema = z.infer<typeof resumeQcExperienceSchema>;
export type ResumeQcOptEmployerSchema = z.infer<typeof resumeQcOptEmployerSchema>;
export type ResumeQcStemOptEmployerSchema = z.infer<typeof resumeQcStemOptEmployerSchema>;
