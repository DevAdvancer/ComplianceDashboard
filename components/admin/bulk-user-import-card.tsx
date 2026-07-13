"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { bulkImportUsersAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  success: false,
  message: "",
};

export function BulkUserImportCard() {
  const [state, formAction, isPending] = useActionState(
    bulkImportUsersAction,
    initialState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
          <FileSpreadsheet className="size-5" />
        </div>
        <CardTitle>Bulk Add Users Through Excel</CardTitle>
        <CardDescription>
          Upload an `.xlsx`, `.xls`, or `.csv` file with `email`, `password`,
          `name`, and `role` columns. Existing emails are skipped automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-300">
          <div className="font-medium text-white">Template columns</div>
          <div className="mt-2 text-slate-400">
            `email` | `password` | `name` | `role`
          </div>
          <div className="mt-3">
            <Button asChild variant="secondary">
              <Link href="/api/admin/users/template">
                <Download className="size-4" />
                Download Excel Template
              </Link>
            </Button>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="users_file">Excel file</Label>
            <Input
              id="users_file"
              name="users_file"
              type="file"
              accept=".xlsx,.xls,.csv"
              required
            />
          </div>

          <Button type="submit" disabled={isPending}>
            <Upload className="size-4" />
            {isPending ? "Importing Users..." : "Import Users"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
