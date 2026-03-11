import React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ChevronDown, ChevronRight, ListFilter, Search, ChevronLeft, X, RefreshCw } from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';

interface ExpandableTableProps {
  data: any[];
  columns: any[];
  renderExpanded?: (row: any) => React.ReactNode;
  showSearchInput?: boolean;
  showRefresh?: boolean;
  inputPlaceholder?: string;
  onRefresh?: () => void;
}

export default function ExpandableTableList({
  data,
  columns,
  renderExpanded,
  showSearchInput = false,
  showRefresh = false,
  inputPlaceholder = 'Search...',
  onRefresh,
}: ExpandableTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      globalFilter,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,

    globalFilterFn: 'includesString',

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    // ⭐ THIS IS REQUIRED
    getRowCanExpand: () => true,
  });
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      {/* TOOLBAR */}
      {(showSearchInput || showRefresh) && (
        <div className="flex w-full items-center justify-between">
          {/* LEFT SIDE (keep empty or add filters later) */}
          <div></div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {showSearchInput && (
              <Input
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                placeholder={inputPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-72"
              />
            )}

            {showRefresh && (
              <Button onClick={() => (globalFilter ? setGlobalFilter('') : onRefresh())} className="flex items-center gap-1">
                {globalFilter ? (
                  <>
                    <X className="h-4 w-4" />
                    Clear
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead className="bg-blue-600 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-10"></th>

                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* BODY */}
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                {/* MAIN ROW */}
                <tr className="border-b hover:bg-blue-50">
                  <td className="px-3 text-center">
                    {row.getCanExpand() && (
                      <button onClick={row.getToggleExpandedHandler()} className="p-1 rounded hover:bg-gray-200">
                        {row.getIsExpanded() ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    )}
                  </td>

                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>

                {/* EXPANDED ROW */}
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length + 1} className="bg-gray-50 p-4">
                      {renderExpanded?.(row.original)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-xs">
        <div>
          Showing {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}
        </div>

        <div className="flex gap-2">
          <Button size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft /> Previous
          </Button>

          <Button size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
