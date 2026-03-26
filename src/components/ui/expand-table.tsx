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
  rightElements?: React.ReactNode;
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
  rightElements,
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
  const hasCheckboxColumn = columns.some((column) => column.id === 'select');
  const totalPages = table.getPageCount();
  const currentRangeStart = pageIndex * pageSize + 1;
  const currentRangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  const getPaginationButtons = () => {
    const maxVisible = 5;
    const pages = [];

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(0, pageIndex - 2);
      const end = Math.min(totalPages - 1, pageIndex + 2);

      if (start > 0) pages.push(0);
      if (start > 1) pages.push('ellipsis-start');

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages - 2) pages.push('ellipsis-end');
      if (end < totalPages - 1) pages.push(totalPages - 1);
    }

    return pages;
  };

  const paginationButtons = getPaginationButtons();

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      {/* TOOLBAR */}
      {(showSearchInput || showRefresh || rightElements) && (
        <div className="flex w-full items-center justify-between">
          {/* LEFT SIDE (keep empty or add filters later) */}
          <div>{rightElements}</div>

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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  {/* MAIN ROW */}
                  <tr className="border-b hover:bg-blue-50">
                    <td className="px-3 text-center">
                      {row.getCanExpand() && (
                        <button onClick={row.getToggleExpandedHandler()} title='View Assigned Employees' className="p-1 rounded hover:bg-gray-200">
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
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs mt-4 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger className="h-8 w-[72px] border border-blue-200 text-xs rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {[5, 10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-muted-foreground">
            {hasCheckboxColumn
              ? `${table.getSelectedRowModel().flatRows.length} of ${totalRows} row(s) selected.`
              : `Showing ${currentRangeStart}-${currentRangeEnd} of ${totalRows}`}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
            Previous
          </Button>

          {paginationButtons.map((btn, idx) =>
            typeof btn === 'string' ? (
              <span key={idx} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button key={btn} variant={btn === pageIndex ? 'default' : 'secondary'} size="sm" onClick={() => table.setPageIndex(btn)}>
                {btn + 1}
              </Button>
            )
          )}

          <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
