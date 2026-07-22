-- Enable Row Level Security
alter table public.resume_qc enable row level security;
alter table public.resume_qc_experiences enable row level security;
alter table public.resume_qc_opt_employers enable row level security;
alter table public.resume_qc_stem_opt_employers enable row level security;

-- Create policies for Admin access on resume_qc
create policy "Admin all operations on resume_qc"
on public.resume_qc
for all
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

-- Create policies for Admin access on resume_qc_experiences
create policy "Admin all operations on resume_qc_experiences"
on public.resume_qc_experiences
for all
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

-- Create policies for Admin access on resume_qc_opt_employers
create policy "Admin all operations on resume_qc_opt_employers"
on public.resume_qc_opt_employers
for all
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');

-- Create policies for Admin access on resume_qc_stem_opt_employers
create policy "Admin all operations on resume_qc_stem_opt_employers"
on public.resume_qc_stem_opt_employers
for all
to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin')
with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), 'Marketing') = 'Admin');
