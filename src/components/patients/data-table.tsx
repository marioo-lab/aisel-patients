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

const thStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: ".03em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  padding: "11px 18px",
  height: "auto",
};

const tdStyle: React.CSSProperties = { padding: "13px 18px" };

const COL_WIDTH: Record<string, number> = {
  phoneNumber: 150,
  dob: 150,
  age: 72,
  actions: 64,
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
    <Table style={{ minWidth: 560 }}>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow
            key={hg.id}
            className="border-b border-border hover:bg-surface-2 bg-surface-2"
          >
            {hg.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();
              const align =
                (header.column.columnDef.meta as { align?: string } | undefined)?.align ??
                "left";
              const width = COL_WIDTH[header.column.id];
              return (
                <TableHead
                  key={header.id}
                  style={{ ...thStyle, width, textAlign: align as "left" | "right" }}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="aisel-sort"
                      aria-label={`Sort by ${String(header.column.id)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        font: "inherit",
                        letterSpacing: "inherit",
                        textTransform: "inherit",
                        color: "inherit",
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span style={{ color: "var(--primary)", fontSize: 9 }}>
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
              <TableCell key={cell.id} style={tdStyle}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
