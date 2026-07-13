import type { RecordStatus } from "@/lib/types/app";

export function canMarketingEditRecord(status: RecordStatus) {
  void status;
  return false;
}

export function canAdminEditRecord(status: RecordStatus) {
  void status;
  return true;
}

export function canAdminReviewRecord(status: RecordStatus) {
  return status === "Pending";
}

export function canAdminArchiveRecord(status: RecordStatus) {
  return status === "Approved" || status === "Rejected";
}

