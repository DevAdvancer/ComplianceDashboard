import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null, pattern = "dd MMM yyyy") {
  if (!value) {
    return "N/A";
  }

  try {
    return format(new Date(value), pattern);
  } catch {
    return value;
  }
}

export function formatMonthYear(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  try {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}/.test(trimmed)) {
      const [year, month] = trimmed.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return format(date, "MMMM yyyy");
    }
    return format(new Date(value), "MMMM yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  return formatDate(value, "dd MMM yyyy, hh:mm a");
}

export function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function normalizeCandidateKey(values: {
  candidate_name: string;
  candidate_technology: string;
  vendor_name: string;
  end_client: string;
}) {
  return [
    values.candidate_name,
    values.candidate_technology,
    values.vendor_name,
    values.end_client,
  ]
    .map((value) => value.trim().toLowerCase().replace(/\s+/g, " "))
    .join("::");
}

export function serializeSearchParams(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

export function formatRecordCode(id?: string | null): string {
  if (!id) return "COMP-001";
  const num = (parseInt(id.replace(/-/g, "").slice(0, 6), 16) % 900) + 101;
  return `COMP-${String(num).padStart(3, "0")}`;
}
