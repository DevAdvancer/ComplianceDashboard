create extension if not exists pgcrypto;

alter default privileges for role postgres in schema public
revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke execute on functions from public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'Marketing' check (role in ('Admin', 'Marketing')),
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null,
  visa_status text not null,
  candidate_technology text not null,
  applied_role text not null,
  location text not null,
  contract_tenure text not null,
  vendor_name text not null,
  vendor_contact_name text not null,
  vendor_phone text not null,
  vendor_email text not null,
  end_client text not null,
  status text not null default 'Draft' check (status in ('Draft', 'Pending', 'Approved', 'Rejected', 'Archived')),
  created_by uuid not null references public.users (id) on delete restrict,
  approved_by uuid references public.users (id) on delete set null,
  rejection_reason text,
  submitted_at timestamptz,
  approved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.previous_companies (
  id uuid primary key default gen_random_uuid(),
  compliance_record_id uuid not null references public.compliance_records (id) on delete cascade,
  company_name text not null,
  job_title text not null,
  employment_start date not null,
  employment_end date not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.references (
  id uuid primary key default gen_random_uuid(),
  previous_company_id uuid not null references public.previous_companies (id) on delete cascade,
  reference_name text not null,
  designation text not null,
  email text,
  phone text,
  notes text,
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists compliance_records_status_idx on public.compliance_records(status);
create index if not exists compliance_records_created_by_idx on public.compliance_records(created_by);
create index if not exists compliance_records_candidate_name_idx on public.compliance_records(candidate_name);
create index if not exists compliance_records_vendor_name_idx on public.compliance_records(vendor_name);
create index if not exists compliance_records_end_client_idx on public.compliance_records(end_client);
create index if not exists compliance_records_created_at_idx on public.compliance_records(created_at desc);
create index if not exists previous_companies_record_id_idx on public.previous_companies(compliance_record_id);
create index if not exists previous_companies_display_order_idx on public.previous_companies(compliance_record_id, display_order);
create index if not exists references_previous_company_id_idx on public.references(previous_company_id);

drop trigger if exists compliance_records_set_updated_at on public.compliance_records;
create trigger compliance_records_set_updated_at
before update on public.compliance_records
for each row
execute function public.set_updated_at();

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_app_meta_data ->> 'role', 'Marketing')
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role;

  return new;
end;
$$;

revoke all on function public.sync_user_profile() from public, anon, authenticated;

drop trigger if exists auth_user_sync_profile on auth.users;
create trigger auth_user_sync_profile
after insert or update on auth.users
for each row
execute function public.sync_user_profile();

alter table public.users enable row level security;
alter table public.compliance_records enable row level security;
alter table public.previous_companies enable row level security;
alter table public.references enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
to authenticated
using (
  (select auth.uid()) = id
  or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);

drop policy if exists "users_update_admin_only" on public.users;
create policy "users_update_admin_only"
on public.users
for update
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

drop policy if exists "records_select_owner_or_admin" on public.compliance_records;
create policy "records_select_owner_or_admin"
on public.compliance_records
for select
to authenticated
using (
  (select auth.uid()) = created_by
  or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);

drop policy if exists "records_insert_owner_or_admin" on public.compliance_records;
create policy "records_insert_owner_or_admin"
on public.compliance_records
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);

drop policy if exists "records_update_owner_draft_or_admin" on public.compliance_records;
create policy "records_update_owner_draft_or_admin"
on public.compliance_records
for update
to authenticated
using (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
  or (
    (select auth.uid()) = created_by
    and status in ('Draft', 'Rejected')
  )
)
with check (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
  or (
    (select auth.uid()) = created_by
    and status in ('Draft', 'Pending', 'Rejected')
    and approved_by is null
  )
);

drop policy if exists "records_delete_admin_only" on public.compliance_records;
create policy "records_delete_admin_only"
on public.compliance_records
for delete
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

drop policy if exists "companies_select_accessible_record" on public.previous_companies;
create policy "companies_select_accessible_record"
on public.previous_companies
for select
to authenticated
using (
  exists (
    select 1
    from public.compliance_records records
    where records.id = previous_companies.compliance_record_id
      and (
        records.created_by = (select auth.uid())
        or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
      )
  )
);

drop policy if exists "companies_insert_editable_record" on public.previous_companies;
create policy "companies_insert_editable_record"
on public.previous_companies
for insert
to authenticated
with check (
  exists (
    select 1
    from public.compliance_records records
    where records.id = previous_companies.compliance_record_id
      and (
        coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
        or (
          records.created_by = (select auth.uid())
          and records.status in ('Draft', 'Rejected')
        )
      )
  )
);

drop policy if exists "companies_update_editable_record" on public.previous_companies;
create policy "companies_update_editable_record"
on public.previous_companies
for update
to authenticated
using (
  exists (
    select 1
    from public.compliance_records records
    where records.id = previous_companies.compliance_record_id
      and (
        coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
        or (
          records.created_by = (select auth.uid())
          and records.status in ('Draft', 'Rejected')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.compliance_records records
    where records.id = previous_companies.compliance_record_id
      and (
        coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
        or (
          records.created_by = (select auth.uid())
          and records.status in ('Draft', 'Rejected')
        )
      )
  )
);

drop policy if exists "companies_delete_editable_record" on public.previous_companies;
create policy "companies_delete_editable_record"
on public.previous_companies
for delete
to authenticated
using (
  exists (
    select 1
    from public.compliance_records records
    where records.id = previous_companies.compliance_record_id
      and (
        coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
        or (
          records.created_by = (select auth.uid())
          and records.status in ('Draft', 'Rejected')
        )
      )
  )
);

drop policy if exists "references_select_accessible_record" on public.references;
create policy "references_select_accessible_record"
on public.references
for select
to authenticated
using (
  exists (
    select 1
    from public.previous_companies companies
    join public.compliance_records records on records.id = companies.compliance_record_id
    where companies.id = "references".previous_company_id
      and (
        records.created_by = (select auth.uid())
        or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
      )
  )
);

drop policy if exists "references_insert_admin_only" on public.references;
create policy "references_insert_admin_only"
on public.references
for insert
to authenticated
with check (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
  and (select auth.uid()) = created_by
);

drop policy if exists "references_update_admin_only" on public.references;
create policy "references_update_admin_only"
on public.references
for update
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

drop policy if exists "references_delete_admin_only" on public.references;
create policy "references_delete_admin_only"
on public.references
for delete
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table public.users to authenticated, service_role;
grant select, insert, update, delete on table public.compliance_records to authenticated, service_role;
grant select, insert, update, delete on table public.previous_companies to authenticated, service_role;
grant select, insert, update, delete on table public.references to authenticated, service_role;
