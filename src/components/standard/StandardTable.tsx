
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface StandardTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    };
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  pagination?: {
    pageSize: number;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalPages: number;
  };
  className?: string;
  onRowClick?: (item: T) => void;
}

export function StandardTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false,
  emptyState,
  searchable = false,
  searchPlaceholder = "Zoeken...",
  sortable = false,
  pagination,
  className,
  onRowClick
}: StandardTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | string; direction: 'asc' | 'desc' } | null>(null);

  // Handle sorting
  const handleSort = (key: keyof T | string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Filter data based on search query
  const filteredData = searchQuery && searchable
    ? data.filter(item => {
        return columns.some(column => {
          const key = column.accessorKey as string;
          const value = key.includes('.')
            ? key.split('.').reduce((obj, path) => obj && obj[path], item)
            : item[key];
          
          return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      })
    : data;

  // Sort data if sortConfig is set
  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const key = sortConfig.key as string;
        
        let aValue = key.includes('.')
          ? key.split('.').reduce((obj, path) => obj && obj[path], a)
          : a[key];
          
        let bValue = key.includes('.')
          ? key.split('.').reduce((obj, path) => obj && obj[path], b)
          : b[key];

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue, 'nl')
            : bValue.localeCompare(aValue, 'nl');
        }
        
        // Handle number comparison
        if (sortConfig.direction === 'asc') {
          return (aValue > bValue) ? 1 : -1;
        } else {
          return (aValue < bValue) ? 1 : -1;
        }
      })
    : filteredData;

  // Get cell value
  const getCellValue = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item);
    }
    
    const key = column.accessorKey as string;
    const value = key.includes('.')
      ? key.split('.').reduce((obj, path) => obj && obj[path], item)
      : item[key];
      
    return value;
  };

  if (loading) {
    return (
      <div className={cn("w-full animate-pulse", className)}>
        <div className="flex items-center justify-between mb-4">
          {searchable && (
            <div className="h-10 bg-gray-200 rounded w-64"></div>
          )}
        </div>
        <div className="border rounded-md">
          <div className="h-12 bg-gray-100 border-b"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b last:border-0">
              <div className="grid grid-cols-4 gap-4 h-full px-4 py-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if ((!data || data.length === 0) && emptyState) {
    return (
      <div className={className}>
        {searchable && (
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {searchable && (
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8 w-full text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={cn(
                      column.sortable && sortable ? 'cursor-pointer select-none' : '',
                      'text-xs sm:text-sm whitespace-nowrap',
                      column.className
                    )}
                    onClick={() => column.sortable && sortable && handleSort(column.accessorKey)}
                  >
                    <div className="flex items-center">
                      <span className="truncate">{column.header}</span>
                      {sortable && column.sortable && sortConfig && sortConfig.key === column.accessorKey && (
                        <span className="ml-1 flex-shrink-0">
                          {sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-16 sm:h-24 text-center text-sm sm:text-base">
                    Geen resultaten gevonden.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((item, rowIndex) => (
                  <TableRow 
                    key={rowIndex}
                    className={cn(
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : '',
                      'text-xs sm:text-sm'
                    )}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={cn('whitespace-nowrap', column.className)}>
                        <div className="truncate max-w-[120px] sm:max-w-none">
                          {getCellValue(item, column)}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
          <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            Pagina {pagination.currentPage} van {pagination.totalPages}
          </div>
          <div className="flex space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Vorige
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Volgende
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StandardTable;
