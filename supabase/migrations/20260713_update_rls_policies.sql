-- Migration: Update Row Level Security (RLS) policies for Marketing record submissions and Admin references review
-- Date: 2026-07-13

-- 1. Update compliance_records UPDATE policy to allow Marketing owners to transition records cleanly when submitting or editing drafts
drop policy if exists "records_update_owner_draft_or_admin" on public.compliance_records;
create policy "records_update_owner_draft_or_admin"
on public.compliance_records
for update
to authenticated
using (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
  or (
    (select auth.uid()) = created_by
    and status in ('Draft', 'Pending', 'Rejected')
    and approved_by is null
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

-- 2. Update previous_companies INSERT/UPDATE/DELETE policies to allow Marketing owners when submitting/saving their records
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
          and records.status in ('Draft', 'Pending', 'Rejected')
          and records.approved_by is null
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
          and records.status in ('Draft', 'Pending', 'Rejected')
          and records.approved_by is null
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
          and records.status in ('Draft', 'Pending', 'Rejected')
          and records.approved_by is null
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
          and records.status in ('Draft', 'Pending', 'Rejected')
          and records.approved_by is null
        )
      )
  )
);

-- 3. Ensure Admin policies on references table allow full insert/update/delete during review
drop policy if exists "references_insert_admin_only" on public.references;
create policy "references_insert_admin_only"
on public.references
for insert
to authenticated
with check (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);

drop policy if exists "references_update_admin_only" on public.references;
create policy "references_update_admin_only"
on public.references
for update
to authenticated
using (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
)
with check (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);

drop policy if exists "references_delete_admin_only" on public.references;
create policy "references_delete_admin_only"
on public.references
for delete
to authenticated
using (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin'
);
