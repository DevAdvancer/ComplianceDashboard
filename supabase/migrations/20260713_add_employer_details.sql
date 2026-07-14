-- Create employer_details table
create table if not exists public.employer_details (
  id uuid primary key default gen_random_uuid(),
  compliance_record_id uuid not null references public.compliance_records (id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists employer_details_record_id_idx on public.employer_details(compliance_record_id);
create index if not exists employer_details_display_order_idx on public.employer_details(compliance_record_id, display_order);

-- Enable RLS
alter table public.employer_details enable row level security;

-- Admin users can manage employer details
drop policy if exists "Admin users can manage employer details" on public.employer_details;
create policy "Admin users can manage employer details"
  on public.employer_details
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'Admin'
    )
  );

-- Marketing users can view employer details for records they created
drop policy if exists "Marketing users can view employer details of their records" on public.employer_details;
create policy "Marketing users can view employer details of their records"
  on public.employer_details
  for select
  using (
    exists (
      select 1 from public.compliance_records
      where compliance_records.id = employer_details.compliance_record_id
        and compliance_records.created_by = auth.uid()
    )
  );
