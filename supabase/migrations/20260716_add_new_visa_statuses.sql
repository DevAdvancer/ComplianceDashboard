-- Add H1B, H4, GC, and USC tracking fields to resume_qc

alter table public.resume_qc
  add column h1b_taken boolean not null default false,
  add column h1b_start_date text,
  add column h1b_end_date text,
  add column h4_taken boolean not null default false,
  add column h4_start_date text,
  add column h4_end_date text,
  add column gc_taken boolean not null default false,
  add column gc_start_date text,
  add column gc_end_date text,
  add column usc_taken boolean not null default false,
  add column usc_start_date text,
  add column usc_end_date text;
