import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

export interface PurchaseItem {
  id: string
  itemName: string
  itemCode: string
  category: string
  supplier: string
  purchaseDate: Date | null
  expiryDate: Date | null
  quantity: number
  unitPrice: number
  total: number
}

export interface PurchaseTableMeta {
  updateItem: (id: string, field: keyof PurchaseItem, value: any) => void
}

export const purchaseItemsColumns: ColumnDef<PurchaseItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-12',
    },
  },
  {
    id: 'no',
    header: () => <div className='text-muted-foreground text-xs font-medium'>No.</div>,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      const rowIndex = row.index
      return (
        <div className='text-muted-foreground text-sm'>
          {pageIndex * pageSize + rowIndex + 1}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-16',
    },
  },
  {
    accessorKey: 'itemName',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Item Name <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      const hasError = !row.original.itemName.trim()
      
      return (
        <Input
          value={row.original.itemName}
          onChange={(e) => updateItem?.(row.original.id, 'itemName', e.target.value)}
          placeholder='Item Name'
          className={cn(
            'h-9 border-0 shadow-none focus-visible:ring-1',
            hasError && 'border border-destructive/50'
          )}
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[180px]',
    },
  },
  {
    accessorKey: 'itemCode',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Item Code <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      const hasError = !row.original.itemCode.trim()
      
      return (
        <Input
          value={row.original.itemCode}
          onChange={(e) => updateItem?.(row.original.id, 'itemCode', e.target.value)}
          placeholder='Item Code'
          className={cn(
            'h-9 border-0 shadow-none focus-visible:ring-1',
            hasError && 'border border-destructive/50'
          )}
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[150px]',
    },
  },
  {
    accessorKey: 'category',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>Category</div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      
      return (
        <Input
          value={row.original.category}
          onChange={(e) => updateItem?.(row.original.id, 'category', e.target.value)}
          placeholder='Category'
          className='h-9 border-0 shadow-none focus-visible:ring-1'
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[130px]',
    },
  },
  {
    accessorKey: 'supplier',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>Supplier</div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      
      return (
        <Input
          value={row.original.supplier}
          onChange={(e) => updateItem?.(row.original.id, 'supplier', e.target.value)}
          placeholder='Supplier'
          className='h-9 border-0 shadow-none focus-visible:ring-1'
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[150px]',
    },
  },
  {
    accessorKey: 'purchaseDate',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Purchase Date <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      const date = row.original.purchaseDate
      const hasError = !date
      
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'h-9 w-full justify-start border-0 text-left font-normal shadow-none hover:bg-accent focus-visible:ring-1',
                !date && 'text-muted-foreground',
                hasError && 'border border-destructive/50'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date ? format(date, 'dd-MM-yyyy') : <span>Purchase Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date || undefined}
              onSelect={(newDate) => updateItem?.(row.original.id, 'purchaseDate', newDate || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[180px]',
    },
  },
  {
    accessorKey: 'expiryDate',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>Expiry Date</div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      const date = row.original.expiryDate
      
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'h-9 w-full justify-start border-0 text-left font-normal shadow-none hover:bg-accent focus-visible:ring-1',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date ? format(date, 'dd-MM-yyyy') : <span>Expiry Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date || undefined}
              onSelect={(newDate) => updateItem?.(row.original.id, 'expiryDate', newDate || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    },
    enableSorting: false,
    meta: {
      className: 'min-w-[180px]',
    },
  },
  {
    accessorKey: 'quantity',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Quantity <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      const hasError = row.original.quantity <= 0
      
      return (
        <Input
          type='number'
          value={row.original.quantity || ''}
          onChange={(e) => {
            const value = Math.max(0, parseInt(e.target.value) || 0)
            updateItem?.(row.original.id, 'quantity', value)
          }}
          placeholder='0'
          className={cn(
            'h-9 border-0 text-right shadow-none focus-visible:ring-1',
            hasError && 'border border-destructive/50'
          )}
          min='0'
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'w-32',
    },
  },
  {
    accessorKey: 'unitPrice',
    header: () => (
      <div className='text-muted-foreground text-right text-xs font-medium'>
        Unit Price (INR)
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as PurchaseTableMeta | undefined)?.updateItem
      
      return (
        <Input
          type='number'
          value={row.original.unitPrice || ''}
          onChange={(e) => {
            const value = Math.max(0, parseFloat(e.target.value) || 0)
            updateItem?.(row.original.id, 'unitPrice', value)
          }}
          placeholder='0.00'
          className='h-9 border-0 text-right shadow-none focus-visible:ring-1'
          min='0'
          step='0.01'
        />
      )
    },
    enableSorting: false,
    meta: {
      className: 'w-40',
    },
  },
  {
    accessorKey: 'total',
    header: () => (
      <div className='text-muted-foreground text-right text-xs font-medium'>
        Total (INR)
      </div>
    ),
    cell: ({ row }) => {
      const total = row.original.total
      return (
        <div className='pr-4 text-right text-sm font-medium'>
          ₹ {total.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
    enableSorting: false,
    meta: {
      className: 'w-40',
    },
  },
  {
    id: 'actions',
    header: () => <div className='w-12'></div>,
    cell: () => (
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
      >
        <Settings2 className='h-4 w-4' />
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-12',
    },
  },
]
