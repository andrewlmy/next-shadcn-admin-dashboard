"use client";

import { useState } from "react";
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

type Service = {
  id: number;
  name: string;
  status: string;
  port: string;
  projectId: number;
  enablePressureTest: boolean;
  enableContrastTest: number;
  createdAt: Date;
  updatedAt: Date;
};

const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: "Service Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "enabled" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "port",
    header: "Port",
    cell: ({ row }) => <div>{row.getValue("port")}</div>,
  },
  {
    accessorKey: "projectId",
    header: "Project ID",
    cell: ({ row }) => <div>{row.getValue("projectId")}</div>,
  },
  {
    accessorKey: "enablePressureTest",
    header: "Pressure Test",
    cell: ({ row }) => {
      const enabled = row.getValue("enablePressureTest") as boolean;
      return (
        <Badge variant={enabled ? "default" : "outline"}>
          {enabled ? "Enabled" : "Disabled"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "enableContrastTest",
    header: "Contrast Test",
    cell: ({ row }) => {
      const enabled = row.getValue("enableContrastTest") as number;
      return (
        <Badge variant={enabled ? "default" : "outline"}>
          {enabled ? "Enabled" : "Disabled"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
];

export function DataTable({ data }: { data: Service[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25, // Changed from default 10 to 50
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
          placeholder="Filter services..."
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