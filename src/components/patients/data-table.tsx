"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type OnChangeFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TH =
  "h-auto px-4.5 py-2.75 text-[11.5px] font-bold tracking-[0.03em] text-text-muted uppercase";
const TD = "px-4.5 py-3.25";

const COL_WIDTH: Record<string, string> = {
  phoneNumber: "w-[150px]",
  dob: "w-[150px]",
  age: "w-[72px]",
  actions: "w-[64px]",
};

/**
 * Generic, server-driven data table: TanStack in manual mode (no client
 * sort/paginate/filter), rendered with shadcn Table primitives styled to the
 * Aisel design. Sorting clicks are lifted via onSortingChange.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  columnVisibility,
  onRowClick,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  columnVisibility: VisibilityState;
  onRowClick?: (row: TData) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    enableSortingRemoval: false,
  });

  return (
    <Table className="min-w-140">
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow
            key={hg.id}
            className="border-b border-border bg-surface-2 hover:bg-surface-2"
          >
            {hg.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();
              const align =
                (header.column.columnDef.meta as { align?: string } | undefined)
                  ?.align === "right"
                  ? "text-right"
                  : "text-left";
              return (
                <TableHead
                  key={header.id}
                  className={`${TH} ${align} ${COL_WIDTH[header.column.id] ?? ""}`}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${String(header.column.id)}`}
                      className="inline-flex items-center gap-1.25 transition-colors hover:text-text"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-[9px] text-primary">
                        {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : ""}
                      </span>
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => onRowClick?.(row.original)}
            className="cursor-pointer border-b border-border hover:bg-row-hover"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className={TD}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
