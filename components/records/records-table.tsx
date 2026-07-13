"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Archive,
  Download,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { archiveComplianceRecordAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/records/status-badge";
import type { UserRole } from "@/lib/types/app";
import type { ComplianceRecordWithRelations } from "@/lib/types/database";
import { formatDate, formatRecordCode } from "@/lib/utils";
import {
  canAdminArchiveRecord,
  canAdminReviewRecord,
  canMarketingEditRecord,
} from "@/lib/workflows/records";

type RowData = ComplianceRecordWithRelations;

function escapeCsvValue(value: string | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadRecordsCsv(rows: RowData[]) {
  const headers = [
    "Candidate Name",
    "Technology",
    "Visa",
    "Applied Role",
    "Client",
    "Vendor",
    "Status",
    "Created By",
    "Created Date",
  ];

  const csv = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      [
        row.candidate_name,
        row.candidate_technology,
        row.visa_status,
        row.applied_role,
        row.end_client,
        row.vendor_name,
        row.status,
        row.creator?.name ?? row.creator?.email ?? "Unknown",
        formatDate(row.created_at),
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `compliance-records-${dateStamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function RecordActionsMenu({ row, role }: { row: RowData; role: UserRole }) {
  const [isArchiving, startTransition] = useTransition();
  const canMarketingEdit =
    role === "Marketing" && canMarketingEditRecord(row.status);
  const canAdminReview = role === "Admin" && canAdminReviewRecord(row.status);
  const canAdminArchive = role === "Admin" && canAdminArchiveRecord(row.status);

  const handleArchive = () => {
    startTransition(async () => {
      const response = await archiveComplianceRecordAction(row.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" disabled={isArchiving}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/records/${row.id}/report`}>View report</Link>
        </DropdownMenuItem>
        {role === "Admin" ? (
          <DropdownMenuItem asChild>
            <Link href={`/records/${row.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit All Details
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canAdminArchive ? (
          <DropdownMenuItem
            className="text-amber-200"
            onSelect={(event) => {
              event.preventDefault();
              handleArchive();
            }}>
            <Archive className="mr-2 size-4" />
            {isArchiving ? "Archiving..." : "Archive Record"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RecordCardActions({ row, role }: { row: RowData; role: UserRole }) {
  const [isArchiving, startTransition] = useTransition();
  const canAdminArchive = role === "Admin" && canAdminArchiveRecord(row.status);

  const handleArchive = () => {
    startTransition(async () => {
      const response = await archiveComplianceRecordAction(row.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    });
  };

  return (
    <div className="flex gap-2">
      <Button asChild className="flex-1">
        <Link href={`/records/${row.id}/report`}>View</Link>
      </Button>
      {role === "Admin" ? (
        <Button asChild variant="secondary" className="flex-1">
          <Link href={`/records/${row.id}/edit`}>Edit</Link>
        </Button>
      ) : null}
      {canAdminArchive ? (
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={isArchiving}
          onClick={handleArchive}>
          {isArchiving ? "Archiving..." : "Archive"}
        </Button>
      ) : null}
    </div>
  );
}

export function RecordsTable({
  data,
  role,
}: {
  data: RowData[];
  role: UserRole;
}) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: "record_code",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-violet-300">
            {formatRecordCode(row.original.id)}
          </span>
        ),
      },
      { accessorKey: "candidate_name", header: "Candidate Name" },
      { accessorKey: "candidate_technology", header: "Technology" },
      { accessorKey: "visa_status", header: "Visa" },
      { accessorKey: "applied_role", header: "Role" },
      { accessorKey: "end_client", header: "Client" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => row.original.creator?.name ?? "Unknown",
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <RecordActionsMenu row={row.original} role={role} />,
      },
    ],
    [role],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _, filterValue) =>
      [
        row.original.candidate_name,
        row.original.candidate_technology,
        row.original.visa_status,
        row.original.applied_role,
        row.original.end_client,
        row.original.vendor_name,
        row.original.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
  });

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);

    if (rows.length === 0) {
      toast.error("No records match the current filters.");
      return;
    }

    downloadRecordsCsv(rows);
    toast.success(`Exported ${rows.length} records to CSV.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search by candidate, client, visa, vendor, technology, or status"
          className="md:max-w-xl"
        />
        <Button type="button" variant="secondary" onClick={handleExport}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <Card className="hidden overflow-hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-950/90 backdrop-blur-xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell
                        ? flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        : String(cell.getValue() ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs font-semibold text-violet-300 mb-0.5">
                    {formatRecordCode(row.original.id)}
                  </div>
                  <div className="font-medium text-white">
                    {row.original.candidate_name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {row.original.candidate_technology} ·{" "}
                    {row.original.applied_role}
                  </div>
                </div>
                <StatusBadge status={row.original.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                <div>Client: {row.original.end_client}</div>
                <div>Visa: {row.original.visa_status}</div>
                <div>Created By: {row.original.creator?.name ?? "Unknown"}</div>
                <div>Date: {formatDate(row.original.created_at)}</div>
              </div>
              <RecordCardActions row={row.original} role={role} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
