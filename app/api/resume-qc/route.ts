import { NextResponse } from "next/server";

import { getOptionalAuthContext } from "@/lib/auth/session";
import { getResumeQcRecords } from "@/lib/db/qc-queries";

export async function GET(request: Request) {
  const auth = await getOptionalAuthContext();

  if (!auth || auth.role !== "Admin") {
    return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const candidateName = searchParams.get("candidateName") ?? undefined;
  const qcListName = searchParams.get("qcListName") ?? undefined;

  const records = await getResumeQcRecords({
    query,
    candidateName,
    qcListName,
  });

  return NextResponse.json(records);
}
