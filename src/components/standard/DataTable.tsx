import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  render?: (item: T) => React.ReactNode;
}

export interface Action {
  label: string;
  action: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ComponentType<any>;
}

interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  actions?: Action[];
  onAction?: (action: string, itemId: string, itemData?: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const DataTable = <T extends { id: string | number }>({ 
  columns, 
  data, 
  actions, 
  onAction,
  emptyMessage = "Geen gegevens gevonden",
  loading = false
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Laden...</span>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
          {actions && actions.length > 0 && <TableHead><span className="sr-only">Actions</span></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {column.render 
                  ? column.render(item)
                  : column.accessor
                    ? typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : (item[column.accessor as keyof T] as React.ReactNode)
                    : (item[column.key as keyof T] as React.ReactNode)}
              </TableCell>
            ))}
            {actions && actions.length > 0 && (
              <TableCell>
                <div className="flex space-x-2">
                  {actions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={action.action}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => onAction?.(action.action, String(item.id), item)}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { DataTable };
export default DataTable;