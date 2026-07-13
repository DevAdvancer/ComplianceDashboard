import { describe, expect, it } from "vitest";

import {
  buildManagedUserInputFromRow,
  normalizeUserRole,
} from "@/lib/admin/user-provisioning";
import {
  canAdminArchiveRecord,
  canAdminReviewRecord,
  canMarketingEditRecord,
} from "@/lib/workflows/records";

describe("record workflow helpers", () => {
  it("limits Marketing editing to draft and rejected records", () => {
    expect(canMarketingEditRecord("Draft")).toBe(true);
    expect(canMarketingEditRecord("Rejected")).toBe(true);
    expect(canMarketingEditRecord("Pending")).toBe(false);
    expect(canMarketingEditRecord("Approved")).toBe(false);
  });

  it("limits Admin review to pending records", () => {
    expect(canAdminReviewRecord("Pending")).toBe(true);
    expect(canAdminReviewRecord("Approved")).toBe(false);
    expect(canAdminReviewRecord("Rejected")).toBe(false);
  });

  it("allows archiving only finalized records", () => {
    expect(canAdminArchiveRecord("Approved")).toBe(true);
    expect(canAdminArchiveRecord("Rejected")).toBe(true);
    expect(canAdminArchiveRecord("Pending")).toBe(false);
    expect(canAdminArchiveRecord("Archived")).toBe(false);
  });
});

describe("user provisioning helpers", () => {
  it("normalizes supported roles and defaults blanks to Marketing", () => {
    expect(normalizeUserRole("admin")).toBe("Admin");
    expect(normalizeUserRole(" Marketing ")).toBe("Marketing");
    expect(normalizeUserRole("")).toBe("Marketing");
  });

  it("builds a valid managed user from an import row", () => {
    expect(
      buildManagedUserInputFromRow(
        {
          email: "new.user@example.com",
          password: "TempPass123",
          name: "",
          role: "Marketing",
        },
        2,
      ),
    ).toEqual({
      email: "new.user@example.com",
      password: "TempPass123",
      name: "new.user",
      role: "Marketing",
    });
  });

  it("rejects unsupported roles during import", () => {
    expect(() =>
      buildManagedUserInputFromRow(
        {
          email: "new.user@example.com",
          password: "TempPass123",
          name: "New User",
          role: "Reviewer",
        },
        4,
      ),
    ).toThrow("Row 4: role must be Admin or Marketing.");
  });
});
