import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { getOptionalAuthContext } from "@/lib/auth/session";

export async function GET() {
  const auth = await getOptionalAuthContext();

  if (!auth || auth.role !== "Admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet([
    {
      email: "new.user@company.com",
      password: "TempPass123",
      name: "New User",
      role: "Marketing",
    },
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, "users");

  return new NextResponse(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="cms-user-import-template.xlsx"',
      },
    },
  );
}
