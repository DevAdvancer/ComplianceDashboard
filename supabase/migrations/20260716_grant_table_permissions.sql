-- Grant explicit permissions for authenticated and service_role to access tables created in recent migrations

-- For employer_details (created in 20260713_add_employer_details)
grant select, insert, update, delete on table public.employer_details to authenticated, service_role;

-- For resume_qc and child tables (created in 20260714_add_resume_qc)
grant select, insert, update, delete on table public.resume_qc to authenticated, service_role;
grant select, insert, update, delete on table public.resume_qc_experiences to authenticated, service_role;
grant select, insert, update, delete on table public.resume_qc_opt_employers to authenticated, service_role;
grant select, insert, update, delete on table public.resume_qc_stem_opt_employers to authenticated, service_role;
