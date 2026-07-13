import { NextResponse } from "next/server";

import { getOptionalAuthContext } from "@/lib/auth/session";
import { getComplianceRecordById } from "@/lib/db/queries";
import { createCsvBuffer } from "@/lib/exports/report";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getOptionalAuthContext();

  if (!auth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const record = await getComplianceRecordById(id);

  if (!record || (auth.role === "Marketing" && record.created_by !== auth.user.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(createCsvBuffer(record), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${record.candidate_name.replace(/\s+/g, "-").toLowerCase()}-report.csv"`,
    },
  });
}
