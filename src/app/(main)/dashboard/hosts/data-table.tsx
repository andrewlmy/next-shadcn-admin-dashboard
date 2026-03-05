/* eslint-disable */
"use client";

import * as React from "react";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconSelector,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

export const schema = z.object({
  id: z.number(),
  sn: z.string(),
  ip: z.string(),
  publicIp: z.string(),
  cpuCore: z.number(),
  memory: z.number(),
  diskVolume: z.number(),
  header: z.string(),
  status: z.string(),
  updatedAt: z.date().nullable().optional(),
  idc: z.string().optional(),
  k8sCluster: z.string().optional(),
  os: z.string().optional(),
  kernel: z.string().optional(),
  remarks: z.string().optional(),
  tags: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  type: z.string().optional(),
  target: z.string().optional(),
  limit: z.string().optional(),
  reviewer: z.string().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,

  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { onRemarksSaved?: (hostId: number, remarks: string) => void };
      return <TableCellViewer item={row.original} onRemarksSaved={meta?.onRemarksSaved} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "ip",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          IP
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.ip}
      </Badge>
    ),
  },
  {
    accessorKey: "sn",
    header: "SN",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Done" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.sn}
      </Badge>
    ),
  },
  {
    accessorKey: "publicIp",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          Public Ip
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.publicIp}
      </Badge>
    ),
  },
  {
    accessorKey: "idc",
    header: ({ table }) => {
      const meta = table.options.meta as {
        idcFilter?: string;
        setIdcFilter?: (v: string) => void;
        uniqueIdcs?: string[];
      };
      if (!meta?.setIdcFilter || !meta?.uniqueIdcs) return "IDC";
      return (
        <div className="flex flex-row items-center gap-2">
          <span className="shrink-0">idc</span>
          <Select value={meta.idcFilter ?? "all"} onValueChange={meta.setIdcFilter}>
            <SelectTrigger className="h-7 w-[120px]" size="sm">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              {meta.uniqueIdcs.map((idc) => (
                <SelectItem key={idc} value={idc}>
                  {idc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "all") return true;
      const idc = row.original.idc ?? "";
      if (filterValue === "(empty)") return !idc;
      return idc === filterValue;
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.idc ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "k8sCluster",
    header: ({ table }) => {
      const meta = table.options.meta as {
        clusterFilter?: string;
        setClusterFilter?: (v: string) => void;
        uniqueClusters?: string[];
      };
      if (!meta?.setClusterFilter || !meta?.uniqueClusters) return "Cluster";
      return (
        <div className="flex flex-row items-center gap-2">
          <span className="shrink-0">Cluster</span>
          <Select value={meta.clusterFilter ?? "all"} onValueChange={meta.setClusterFilter}>
            <SelectTrigger className="h-7 w-[120px]" size="sm">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">all</SelectItem>
              {meta.uniqueClusters.map((cluster) => (
                <SelectItem key={cluster} value={cluster}>
                  {cluster}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "all") return true;
      const cluster = row.original.k8sCluster ?? "";
      if (filterValue === "(empty)") return !cluster;
      return cluster === filterValue;
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.k8sCluster ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          Status
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.status === "active"
            ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
            : "text-muted-foreground px-1.5"
        }
      >
        {row.original.status === "active" ? (
          <>
            <IconCircleCheckFilled className="mr-1 size-3.5 fill-green-500 dark:fill-green-400" />
            {row.original.status}
          </>
        ) : (
          <>
            <IconLoader className="mr-1 size-3.5" />
            {row.original.status}
          </>
        )}
      </Badge>
    ),
  },

  {
    accessorKey: "os",
    header: ({ table }) => {
      const meta = table.options.meta as {
        osFilter?: string;
        setOsFilter?: (v: string) => void;
        uniqueOses?: string[];
      };
      if (!meta?.setOsFilter || !meta?.uniqueOses) return "OS";
      return (
        <div className="flex flex-row items-center gap-2">
          <span className="shrink-0">OS</span>
          <Select value={meta.osFilter ?? "all"} onValueChange={meta.setOsFilter}>
            <SelectTrigger className="h-7 w-[120px]" size="sm">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">all</SelectItem>
              {meta.uniqueOses.map((os) => (
                <SelectItem key={os} value={os}>
                  {os}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "all") return true;
      const os = row.original.os ?? "";
      if (filterValue === "(empty)") return !os;
      return os === filterValue;
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.os ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "kernel",
    header: ({ table }) => {
      const meta = table.options.meta as {
        kernelFilter?: string;
        setKernelFilter?: (v: string) => void;
        uniqueKernels?: string[];
      };
      if (!meta?.setKernelFilter || !meta?.uniqueKernels) return "Kernel";
      return (
        <div className="flex flex-row items-center gap-2">
          <span className="shrink-0">Kernel</span>
          <Select value={meta.kernelFilter ?? "all"} onValueChange={meta.setKernelFilter}>
            <SelectTrigger className="h-7 w-[120px]" size="sm">
              <SelectValue placeholder="all" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">all</SelectItem>
              {meta.uniqueKernels.map((kernel) => (
                <SelectItem key={kernel} value={kernel}>
                  {kernel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "all") return true;
      const kernel = row.original.kernel ?? "";
      if (filterValue === "(empty)") return !kernel;
      return kernel === filterValue;
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.kernel ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "cpuCore",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          Cpu
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.cpuCore}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "memory",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          Memory
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.memory} GB
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "diskVolume",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting()}
        >
          Disk
          {sorted === "asc" ? (
            <IconArrowUp className="ml-1.5 size-3.5" />
          ) : sorted === "desc" ? (
            <IconArrowDown className="ml-1.5 size-3.5" />
          ) : (
            <IconSelector className="ml-1.5 size-3.5 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.diskVolume} GB
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="min-w-[12ch] max-w-[24ch] truncate" title={row.original.remarks ?? ""}>
        <Badge variant="outline" className="text-muted-foreground px-1.5 font-normal">
          {row.original.remarks ?? "—"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex min-w-[10ch] max-w-[20ch] flex-wrap gap-1">
        {Array.isArray(row.original.tags) && row.original.tags.length > 0 ? (
          row.original.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-muted-foreground px-1.5">
              {tag}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            —
          </Badge>
        )}
      </div>
    ),
  },



  //   {
  //   accessorKey: "cluster",
  //   header: "cluster",
  //   cell: ({ row }) => (
  //     <div className="w-32">
  //       <Badge variant="outline" className="text-muted-foreground px-1.5">
  //         {row.original.k8sCluster} 
  //       </Badge>
  //     </div>
  //   ),
  // },




];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
  const [data, setData] = React.useState(() => initialData);
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ sn: false });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [idcFilter, setIdcFilter] = React.useState<string>("all");
  const [clusterFilter, setClusterFilter] = React.useState<string>("all");
  const [osFilter, setOsFilter] = React.useState<string>("all");
  const [kernelFilter, setKernelFilter] = React.useState<string>("all");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const sortableId = React.useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  const uniqueIdcs = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const v = row.idc?.trim() ?? "";
      set.add(v || "(empty)");
    });
    return Array.from(set).sort((a, b) =>
      a === "(empty)" ? 1 : b === "(empty)" ? -1 : a.localeCompare(b)
    );
  }, [data]);

  const uniqueClusters = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const v = row.k8sCluster?.trim() ?? "";
      set.add(v || "(empty)");
    });
    return Array.from(set).sort((a, b) =>
      a === "(empty)" ? 1 : b === "(empty)" ? -1 : a.localeCompare(b)
    );
  }, [data]);

  const uniqueOses = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const v = row.os?.trim() ?? "";
      set.add(v || "(empty)");
    });
    return Array.from(set).sort((a, b) =>
      a === "(empty)" ? 1 : b === "(empty)" ? -1 : a.localeCompare(b)
    );
  }, [data]);

  const uniqueKernels = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const v = row.kernel?.trim() ?? "";
      set.add(v || "(empty)");
    });
    return Array.from(set).sort((a, b) =>
      a === "(empty)" ? 1 : b === "(empty)" ? -1 : a.localeCompare(b)
    );
  }, [data]);

  React.useEffect(() => {
    setColumnFilters((prev) => {
      let rest = prev.filter(
        (f) => f.id !== "idc" && f.id !== "k8sCluster" && f.id !== "os" && f.id !== "kernel"
      );
      if (idcFilter !== "all") rest = [...rest, { id: "idc", value: idcFilter }];
      if (clusterFilter !== "all") rest = [...rest, { id: "k8sCluster", value: clusterFilter }];
      if (osFilter !== "all") rest = [...rest, { id: "os", value: osFilter }];
      if (kernelFilter !== "all") rest = [...rest, { id: "kernel", value: kernelFilter }];
      return rest;
    });
  }, [idcFilter, clusterFilter, osFilter, kernelFilter]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta: {
      idcFilter,
      setIdcFilter,
      uniqueIdcs,
      clusterFilter,
      setClusterFilter,
      uniqueClusters,
      osFilter,
      setOsFilter,
      uniqueOses,
      kernelFilter,
      setKernelFilter,
      uniqueKernels,
      onRemarksSaved: (hostId: number, remarks: string) => {
        setData((prev) =>
          prev.map((r) => (r.id === hostId ? { ...r, remarks: remarks || undefined } : r))
        );
      },
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-end px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button> */}
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}

function TableCellViewer({ item, onRemarksSaved }: { item: z.infer<typeof schema>; onRemarksSaved?: (hostId: number, remarks: string) => void }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [remarks, setRemarks] = React.useState(item.remarks ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setRemarks(item.remarks ?? "");
  }, [item.id, item.remarks]);

  async function handleSaveRemarks() {
    setSaving(true);
    try {
      const res = await fetch(`/api/hosts/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onRemarksSaved?.(item.id, remarks);
      router.refresh();
    } catch {
      toast.error("Failed to save remarks");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Host {item.id}</DrawerTitle>
          <DrawerDescription>
            {item.ip}
            {item.idc ? ` · ${item.idc}` : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Id" value={item.id} />
            <InfoRow label="IP" value={item.ip} />
            <InfoRow label="Public IP" value={item.publicIp || null} />
            <InfoRow label="SN" value={item.sn || null} />
            <InfoRow label="IDC" value={item.idc || null} />
            <InfoRow label="Cluster" value={item.k8sCluster || null} />
            <InfoRow label="Status" value={item.status} />
            <InfoRow label="OS" value={item.os || null} />
            <InfoRow label="Kernel" value={item.kernel || null} />
            <InfoRow label="CPU Cores" value={item.cpuCore} />
            <InfoRow label="Memory (GB)" value={item.memory} />
            <InfoRow label="Storage (GB)" value={item.diskVolume} />
            <InfoRow
              label="Updated At"
              value={item.updatedAt ? new Date(item.updatedAt).toLocaleString() : null}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks..."
              className="min-h-24 resize-y"
            />
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {item.services && item.services.length > 0 && (
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground text-xs">Services</Label>
              <div className="flex flex-wrap gap-1">
                {item.services.map((svc) => (
                  <Badge key={svc} variant="outline" className="text-xs">
                    {svc}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button onClick={handleSaveRemarks} disabled={saving}>
            {saving ? "Saving..." : "Save Remarks"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
