import { NextResponse } from "next/server";

import { getOptionalAuthContext } from "@/lib/auth/session";
import { getComplianceRecords } from "@/lib/db/queries";
import type { RecordStatus } from "@/lib/types/app";

export async function GET(request: Request) {
  const auth = await getOptionalAuthContext();

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const records = await getComplianceRecords({
    role: auth.role,
    userId: auth.user.id,
    query,
    status: (searchParams.get("status") as RecordStatus | null) ?? undefined,
  });

  return NextResponse.json(records);
}
