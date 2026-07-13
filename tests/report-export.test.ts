import { describe, expect, it } from "vitest";

import { createCsvBuffer, flattenReport } from "@/lib/exports/report";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";

const sampleRecord: ComplianceRecordWithRelations = {
  id: "record-1",
  candidate_name: "Ariana Cole",
  visa_status: "H1B",
  candidate_technology: "Data Engineering",
  applied_role: "Senior Data Engineer",
  location: "Dallas, TX",
  contract_tenure: "12 Months",
  vendor_name: "Northstar Talent",
  vendor_contact_name: "Melissa Grant",
  vendor_phone: "+1 214 555 0189",
  vendor_email: "melissa@northstar.example",
  end_client: "General Motors",
  status: "Approved",
  created_by: "user-1",
  approved_by: "user-2",
  rejection_reason: null,
  submitted_at: "2026-07-01T00:00:00.000Z",
  approved_at: "2026-07-03T00:00:00.000Z",
  archived_at: null,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-03T00:00:00.000Z",
  creator: null,
  approver: null,
  previous_companies: [
    {
      id: "company-1",
      compliance_record_id: "record-1",
      company_name: "General Motors",
      job_title: "Safety Manager",
      employment_start: "2021-03-01",
      employment_end: "2023-07-01",
      display_order: 0,
      created_at: "2026-07-01T00:00:00.000Z",
      references: [
        {
          id: "ref-1",
          previous_company_id: "company-1",
          reference_name: "Diana Brooks",
          designation: "Program Director",
          email: "diana@gm.example",
          phone: "+1 313 555 0190",
          notes: "Positive reference",
          created_by: "user-2",
          created_at: "2026-07-03T00:00:00.000Z",
        },
      ],
    },
  ],
};

describe("report export helpers", () => {
  it("flattens nested report data into export rows", () => {
    const rows = flattenReport(sampleRecord);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.Candidate).toBe("Ariana Cole");
    expect(rows[0]?.PreviousCompany).toBe("General Motors");
    expect(rows[0]?.ReferenceName).toBe("Diana Brooks");
  });

  it("creates a csv payload that includes report headers", () => {
    const csv = createCsvBuffer(sampleRecord);

    expect(csv).toContain("Candidate,Technology,Visa");
    expect(csv).toContain("Ariana Cole");
    expect(csv).toContain("Diana Brooks");
  });
});
