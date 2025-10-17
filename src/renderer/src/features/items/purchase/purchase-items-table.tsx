import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Download, Upload } from 'lucide-react'
import type { PurchaseItem, PurchaseTableMeta } from './purchase-items-columns'

interface PurchaseItemsTableProps {
  data: PurchaseItem[]
  columns: ColumnDef<PurchaseItem, any>[]
  updateItem: (id: string, field: keyof PurchaseItem, value: any) => void
  onAddRow: () => void
  onAddMultipleRows: () => void
  onDeleteSelected: (ids: string[]) => void
  onDownload?: () => void
  onUpload?: () => void
}

export function PurchaseItemsTable({
  data,
  columns,
  updateItem,
  onAddRow,
  onAddMultipleRows,
  onDeleteSelected,
  onDownload,
  onUpload,
}: PurchaseItemsTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable<PurchaseItem>({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      updateItem,
    } as PurchaseTableMeta,
  })

  // Reset selection when data changes
  useEffect(() => {
    setRowSelection({})
  }, [data.length])

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  const handleDeleteSelected = () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    onDeleteSelected(selectedIds)
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-muted/50 group/row hover:bg-muted/50'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'h-10 bg-muted/50',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background p-2 group-hover/row:bg-muted/30 group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
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
                  className='h-24 text-center'
                >
                  No items added yet. Click "Add Row" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onAddRow}
            className='gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Row
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onAddMultipleRows}
            className='gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Multiple
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          {onDownload && (
            <Button
              variant='outline'
              size='sm'
              onClick={onDownload}
              className='gap-2'
            >
              <Download className='h-4 w-4' />
              Download
            </Button>
          )}
          {onUpload && (
            <Button
              variant='outline'
              size='sm'
              onClick={onUpload}
              className='gap-2'
            >
              <Upload className='h-4 w-4' />
              Upload
            </Button>
          )}
          
          {hasSelection && (
            <>
              <span className='text-muted-foreground text-sm'>
                {selectedRows.length} row(s) selected
              </span>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleDeleteSelected}
                className='gap-2'
              >
                <Trash2 className='h-4 w-4' />
                Delete Selected
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
