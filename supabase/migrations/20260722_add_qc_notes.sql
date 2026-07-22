-- Add notes fields to resume_qc for all visa blocks

alter table public.resume_qc
  add column cpt_notes text,
  add column opt_notes text,
  add column stem_opt_notes text,
  add column h1b_notes text,
  add column h4_notes text,
  add column gc_notes text,
  add column usc_notes text;
