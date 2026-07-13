do $$
declare
  admin_id uuid;
  marketing_id uuid;
  approved_record_id uuid;
  pending_record_id uuid;
  gm_company_id uuid;
  turner_company_id uuid;
  ibm_company_id uuid;
begin
  select id into admin_id
  from public.users
  where role = 'Admin'
  order by created_at
  limit 1;

  select id into marketing_id
  from public.users
  where role = 'Marketing'
  order by created_at
  limit 1;

  if admin_id is null or marketing_id is null then
    return;
  end if;

  if exists (
    select 1
    from public.compliance_records
    where candidate_name in ('Ariana Cole', 'Noah Bennett')
  ) then
    return;
  end if;

  approved_record_id := gen_random_uuid();
  pending_record_id := gen_random_uuid();
  gm_company_id := gen_random_uuid();
  turner_company_id := gen_random_uuid();
  ibm_company_id := gen_random_uuid();

  insert into public.compliance_records (
    id,
    candidate_name,
    visa_status,
    candidate_technology,
    applied_role,
    location,
    contract_tenure,
    vendor_name,
    vendor_contact_name,
    vendor_phone,
    vendor_email,
    end_client,
    status,
    created_by,
    approved_by,
    submitted_at,
    approved_at
  )
  values
    (
      approved_record_id,
      'Ariana Cole',
      'H1B',
      'Data Engineering',
      'Senior Data Engineer',
      'Dallas, TX',
      '12 Months',
      'Northstar Talent',
      'Melissa Grant',
      '+1 214 555 0189',
      'melissa.grant@northstar.example',
      'General Motors',
      'Approved',
      marketing_id,
      admin_id,
      now() - interval '5 days',
      now() - interval '2 days'
    ),
    (
      pending_record_id,
      'Noah Bennett',
      'Citizen',
      'Cloud Infrastructure',
      'Platform Engineer',
      'Chicago, IL',
      '6 Months',
      'Vertex Staffing',
      'Samuel Ortiz',
      '+1 312 555 0144',
      'samuel.ortiz@vertex.example',
      'IBM',
      'Pending',
      marketing_id,
      null,
      now() - interval '1 day',
      null
    );

  insert into public.previous_companies (
    id,
    compliance_record_id,
    company_name,
    job_title,
    employment_start,
    employment_end,
    display_order
  )
  values
    (
      gm_company_id,
      approved_record_id,
      'General Motors',
      'Safety Manager',
      '2021-03-01',
      '2023-07-01',
      0
    ),
    (
      turner_company_id,
      approved_record_id,
      'Turner Construction',
      'Safety Manager',
      '2018-12-01',
      '2021-02-01',
      1
    ),
    (
      ibm_company_id,
      pending_record_id,
      'IBM',
      'Cloud Engineer',
      '2022-02-01',
      '2025-05-01',
      0
    );

  insert into public.references (
    previous_company_id,
    reference_name,
    designation,
    email,
    phone,
    notes,
    created_by
  )
  values
    (
      gm_company_id,
      'Diana Brooks',
      'Program Director',
      'diana.brooks@gm.example',
      '+1 313 555 0190',
      'Confirmed leadership, compliance ownership, and positive exit.',
      admin_id
    ),
    (
      turner_company_id,
      'Chris Reynolds',
      'Project Executive',
      'chris.reynolds@turner.example',
      '+1 646 555 0102',
      'Validated tenure and role scope across multiple client sites.',
      admin_id
    );
end $$;
