import { describe, expect, it } from "vitest";

import { complianceRecordSchema, reviewReferenceSchema } from "@/lib/validations/compliance";

describe("complianceRecordSchema", () => {
  it("accepts a valid compliance request payload", () => {
    const parsed = complianceRecordSchema.safeParse({
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
      previous_companies: [
        {
          company_name: "General Motors",
          job_title: "Safety Manager",
          employment_start: "2021-03-01",
          employment_end: "2023-07-01",
          display_order: 0,
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email and missing companies", () => {
    const parsed = complianceRecordSchema.safeParse({
      candidate_name: "Ariana Cole",
      visa_status: "H1B",
      candidate_technology: "Data Engineering",
      applied_role: "Senior Data Engineer",
      location: "Dallas, TX",
      contract_tenure: "12 Months",
      vendor_name: "Northstar Talent",
      vendor_contact_name: "Melissa Grant",
      vendor_phone: "+1 214 555 0189",
      vendor_email: "not-an-email",
      end_client: "General Motors",
      previous_companies: [],
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.some((issue) => issue.path.includes("vendor_email"))).toBe(true);
    expect(parsed.error?.issues.some((issue) => issue.path.includes("previous_companies"))).toBe(true);
  });
});

describe("reviewReferenceSchema", () => {
  it("accepts approval review payloads without a rejection reason", () => {
    const parsed = reviewReferenceSchema.safeParse({
      record_id: "83a52349-b622-4419-8c96-7242714b1f79",
      decision: "approve",
      references: [],
    });

    expect(parsed.success).toBe(true);
  });
});
