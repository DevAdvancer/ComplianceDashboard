-- Create resume_qc table
create table if not exists public.resume_qc (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null,
  qc_list_name text not null default 'General Resume QC',
  email text,
  phone text,
  linkedin_url text,
  bachelors_start_date text,
  bachelors_end_date text,
  masters_start_date text,
  masters_end_date text,
  us_arrival_date text,
  visa_status text,
  technology text,
  cpt_taken boolean not null default false,
  cpt_start_date text,
  cpt_end_date text,
  cpt_employer_name text,
  opt_taken boolean not null default false,
  opt_start_date text,
  opt_end_date text,
  stem_opt_taken boolean not null default false,
  stem_opt_start_date text,
  stem_opt_end_date text,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance indexes for unique search and lookups
create index if not exists resume_qc_candidate_name_idx on public.resume_qc(candidate_name);
create index if not exists resume_qc_qc_list_name_idx on public.resume_qc(qc_list_name);
create index if not exists resume_qc_technology_idx on public.resume_qc(technology);
create index if not exists resume_qc_created_by_idx on public.resume_qc(created_by);

-- Create child table for Experiences (allowing multiple fields and rows)
create table if not exists public.resume_qc_experiences (
  id uuid primary key default gen_random_uuid(),
  resume_qc_id uuid not null references public.resume_qc(id) on delete cascade,
  company_name text not null,
  job_title text not null,
  start_date text,
  end_date text,
  technologies text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists resume_qc_experiences_qc_id_idx on public.resume_qc_experiences(resume_qc_id, display_order);

-- Create child table for OPT Employers (allowing multiple fields and rows)
create table if not exists public.resume_qc_opt_employers (
  id uuid primary key default gen_random_uuid(),
  resume_qc_id uuid not null references public.resume_qc(id) on delete cascade,
  employer_name text not null,
  start_date text,
  end_date text,
  role_or_notes text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists resume_qc_opt_employers_qc_id_idx on public.resume_qc_opt_employers(resume_qc_id, display_order);

-- Create child table for STEM OPT Employers (allowing multiple fields and rows)
create table if not exists public.resume_qc_stem_opt_employers (
  id uuid primary key default gen_random_uuid(),
  resume_qc_id uuid not null references public.resume_qc(id) on delete cascade,
  employer_name text not null,
  start_date text,
  end_date text,
  e_verify_or_notes text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists resume_qc_stem_opt_employers_qc_id_idx on public.resume_qc_stem_opt_employers(resume_qc_id, display_order);

-- Enable RLS
alter table public.resume_qc enable row level security;
alter table public.resume_qc_experiences enable row level security;
alter table public.resume_qc_opt_employers enable row level security;
alter table public.resume_qc_stem_opt_employers enable row level security;

-- Admin users can manage resume_qc and all child tables
drop policy if exists "Admin users can manage resume_qc" on public.resume_qc;
create policy "Admin users can manage resume_qc"
  on public.resume_qc
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'Admin'
    )
  );

drop policy if exists "Admin users can manage resume_qc_experiences" on public.resume_qc_experiences;
create policy "Admin users can manage resume_qc_experiences"
  on public.resume_qc_experiences
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'Admin'
    )
  );

drop policy if exists "Admin users can manage resume_qc_opt_employers" on public.resume_qc_opt_employers;
create policy "Admin users can manage resume_qc_opt_employers"
  on public.resume_qc_opt_employers
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'Admin'
    )
  );

drop policy if exists "Admin users can manage resume_qc_stem_opt_employers" on public.resume_qc_stem_opt_employers;
create policy "Admin users can manage resume_qc_stem_opt_employers"
  on public.resume_qc_stem_opt_employers
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'Admin'
    )
  );
