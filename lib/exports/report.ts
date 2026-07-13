import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

import type { ComplianceRecordWithRelations } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

type FlatRow = Record<string, string>;

export function flattenReport(record: ComplianceRecordWithRelations) {
  const base = {
    Candidate: record.candidate_name,
    Technology: record.candidate_technology,
    Visa: record.visa_status,
    Role: record.applied_role,
    Location: record.location,
    Contract: record.contract_tenure,
    Vendor: record.vendor_name,
    VendorContact: record.vendor_contact_name,
    VendorPhone: record.vendor_phone,
    VendorEmail: record.vendor_email,
    Client: record.end_client,
    Status: record.status,
  };

  const rows: FlatRow[] = [];

  record.previous_companies.forEach((company) => {
    if (company.references.length === 0) {
      rows.push({
        ...base,
        PreviousCompany: company.company_name,
        JobTitle: company.job_title,
        EmploymentStart: formatDate(company.employment_start),
        EmploymentEnd: formatDate(company.employment_end),
        ReferenceName: "",
        ReferenceDesignation: "",
        ReferenceEmail: "",
        ReferencePhone: "",
        ReferenceNotes: "",
      });
      return;
    }

    company.references.forEach((reference) => {
      rows.push({
        ...base,
        PreviousCompany: company.company_name,
        JobTitle: company.job_title,
        EmploymentStart: formatDate(company.employment_start),
        EmploymentEnd: formatDate(company.employment_end),
        ReferenceName: reference.reference_name,
        ReferenceDesignation: reference.designation,
        ReferenceEmail: reference.email ?? "",
        ReferencePhone: reference.phone ?? "",
        ReferenceNotes: reference.notes ?? "",
      });
    });
  });

  return rows;
}

export function createCsvBuffer(record: ComplianceRecordWithRelations) {
  const rows = flattenReport(record);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function createExcelBuffer(record: ComplianceRecordWithRelations) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(flattenReport(record));
  XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Report");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function createPdfBuffer(record: ComplianceRecordWithRelations) {
  const pdf = new jsPDF();
  let cursorY = 18;

  pdf.setFontSize(18);
  pdf.text(`Compliance Report - ${record.candidate_name}`, 14, cursorY);
  cursorY += 10;

  pdf.setFontSize(11);
  [
    `Technology: ${record.candidate_technology}`,
    `Visa: ${record.visa_status}`,
    `Role: ${record.applied_role}`,
    `Location: ${record.location}`,
    `Client: ${record.end_client}`,
    `Vendor: ${record.vendor_name}`,
    `Status: ${record.status}`,
  ].forEach((line) => {
    pdf.text(line, 14, cursorY);
    cursorY += 7;
  });

  cursorY += 4;
  flattenReport(record).forEach((row, index) => {
    if (cursorY > 275) {
      pdf.addPage();
      cursorY = 18;
    }

    pdf.text(
      `${index + 1}. ${row.PreviousCompany} | ${row.ReferenceName || "No reference"} | ${row.ReferencePhone || row.ReferenceEmail || "No contact"}`,
      14,
      cursorY,
    );
    cursorY += 7;
  });

  return Buffer.from(pdf.output("arraybuffer"));
}
