"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type PangaeaEnv = {
  id: number;
  name: string;
  host_count: number;
  owner: string;
  config_branch: string;
  status: number;
};

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Inactive", variant: "secondary" },
  1: { label: "Active", variant: "default" },
  2: { label: "Maintenance", variant: "outline" },
};

export function DataTable({ data }: { data: PangaeaEnv[] }) {
  const router = useRouter();
  
  const columns: ColumnDef<PangaeaEnv>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "host_count",
      header: "Host Count",
      cell: ({ row }) => <div>{row.getValue("host_count")}</div>,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => <div>{row.getValue("owner")}</div>,
    },
    {
      accessorKey: "config_branch",
      header: "Config Branch",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("config_branch")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        const statusInfo = statusMap[status] || { label: `Status ${status}`, variant: "secondary" as const };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const env = row.original;
        const handleDelete = async () => {
          if (!confirm(`Delete environment "${env.name}"? This cannot be undone.`)) return;
          try {
            const res = await fetch(`/api/pangaea-envs/${encodeURIComponent(env.name)}`, { method: "DELETE" });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error((err as { error?: string }).error || res.statusText);
            }
            router.refresh();
          } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to delete environment");
          }
        };
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push(`/dashboard/pangaea_envs/${encodeURIComponent(env.name)}`);
              }}
            >
              View
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
    
        <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          ««
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          «
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          »
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          »»
        </Button>
        </div>
      </div>
    </div>
  );
}
