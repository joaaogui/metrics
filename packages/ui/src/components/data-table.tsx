"use client"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Input } from "./input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },
  })

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  })

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let index = 0; index < headers.length; index++) {
      const header = headers[index]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  return (
    <div className="w-full space-y-4">
      <style dangerouslySetInnerHTML={{ __html: `
        [data-slot="table-cell"] img {
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          min-height: 48px !important;
          max-width: 48px !important;
          max-height: 48px !important;
          object-fit: cover !important;
          display: block !important;
        }
      ` }} />
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={table.getIsAllColumnsVisible()}
                onChange={table.getToggleAllColumnsVisibilityHandler()}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Toggle All</span>
            </label>
          </div>
        </div>
      </div>

      <details className="rounded-md border p-2">
        <summary className="cursor-pointer text-sm font-medium">
          Column Visibility ({table.getVisibleFlatColumns().length} visible)
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {table.getAllLeafColumns().map((column) => {
            return (
              <label key={column.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </span>
              </label>
            )
          })}
        </div>
      </details>

      <div
        ref={tableContainerRef}
        className="max-h-[calc(100vh-300px)] overflow-auto rounded-md border"
        style={{ ...columnSizeVars }}
      >
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `calc(var(--header-${header.id}-size) * 1px)`,
                    }}
                    className={`${
                      header.column.getCanSort() ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="text-xs">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        </>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  className="overflow-hidden"
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                    height: "60px",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="h-[60px] overflow-hidden !p-0"
                      style={{
                        width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                        maxWidth: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                      }}
                    >
                      <div className="flex items-center h-full w-full px-2 min-w-0 overflow-hidden">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) total
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  )
}
