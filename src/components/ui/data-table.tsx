import React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter, Search, ChevronRight, ChevronLeft, X, RefreshCw } from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';

interface TableListProps {
  data: any[];
  columns: any[];
  isInputEnd?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  inputPlaceholder?: string;
  rightElements?: React.ReactNode;
  showSearchInput?: boolean;
  onRefresh?: () => void;
  onRowClick?: (rowData: any) => void;
  rowClassName?: (row: any) => string; // ✅ New prop
}

export default function TableList({
  data,
  columns,
  isInputEnd = false,
  showFilter = false,
  showRefresh = false,
  showSearchInput = false,
  rightElements,
  inputPlaceholder = 'Search...',
  onRowClick,
  rowClassName,
  onRefresh,
}: TableListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const table = useReactTable({
    data,
    columns,
    enableSorting: true,
    enableColumnFilters: true,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const hasCheckboxColumn = columns.some((column) => column.id === 'select');
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
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
    <div className="w-full font-sans space-y-4">
      {/* Search + Actions */}
      {(showSearchInput || showFilter || rightElements || showRefresh) && (
        <div className="flex flex-col sm:flex-row w-full mb-4 sm:justify-between sm:items-end gap-2">
          <div className="flex gap-2 items-center relative">
            {showFilter && (
              <div className="relative group">
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                  <ListFilter className="w-4 h-4" />
                  Columns
                </Button>
                <div className="absolute z-10 hidden group-hover:block top-full right-0 mt-1 w-48 bg-white border rounded-md shadow-lg text-xs">
                  <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                    {table.getAllLeafColumns().map((column) => {
                      if (column.getCanHide()) {
                        return (
                          <div key={column.id} className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 cursor-pointer">
                            <Checkbox id={`column-toggle-${column.id}`} checked={column.getIsVisible()} onCheckedChange={() => column.toggleVisibility()} />
                            <label htmlFor={`column-toggle-${column.id}`} className="text-sm text-gray-800 cursor-pointer">
                              {column.columnDef.header as string}
                            </label>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}
            {rightElements}
          </div>
          {showSearchInput && (
            <div className='flex gap-2'>
              <Input
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                placeholder={inputPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full placeholder:text-gray-400 sm:w-72"
              />
              {showRefresh && (
                <Button onClick={() => (globalFilter ? setGlobalFilter('') : onRefresh())} className="flex items-center gap-1">
                  {globalFilter ? (
                    <>
                      <X className="h-4 w-4" />
                      <span>Clear</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-blue-200 shadow-lg">
        <table className="min-w-full text-sm text-left text-gray-800 font-sans">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center whitespace-nowrap cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center justify-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {/* {header.column.getCanSort() && (
                          <>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-4 w-4" strokeWidth={3} />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-4 w-4" strokeWidth={3} />
                            ) : (
                              <ArrowUpDown className="h-4 w-4" strokeWidth={3} />
                            )}
                          </>
                        )} */}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer border-b border-blue-100 ${
                    rowClassName?.(row) || ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500 italic border-t border-blue-100">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
