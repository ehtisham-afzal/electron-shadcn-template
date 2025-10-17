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

export interface InvoiceItem {
  id: string
  itemCode: string
  deliveryDate: Date | null
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceTableMeta {
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void
}

export const invoiceItemsColumns: ColumnDef<InvoiceItem>[] = [
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
    accessorKey: 'itemCode',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Item Code <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as InvoiceTableMeta | undefined)?.updateItem
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
      className: 'min-w-[200px]',
    },
  },
  {
    accessorKey: 'deliveryDate',
    header: () => (
      <div className='text-muted-foreground text-xs font-medium'>
        Delivery Date <span className='text-destructive'>*</span>
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as InvoiceTableMeta | undefined)?.updateItem
      const date = row.original.deliveryDate
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
              {date ? format(date, 'dd-MM-yyyy') : <span>Delivery Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date || undefined}
              onSelect={(newDate) => updateItem?.(row.original.id, 'deliveryDate', newDate || null)}
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
      const updateItem = (table.options.meta as InvoiceTableMeta | undefined)?.updateItem
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
    accessorKey: 'rate',
    header: () => (
      <div className='text-muted-foreground text-right text-xs font-medium'>
        Rate (INR)
      </div>
    ),
    cell: ({ row, table }) => {
      const updateItem = (table.options.meta as InvoiceTableMeta | undefined)?.updateItem
      
      return (
        <Input
          type='number'
          value={row.original.rate || ''}
          onChange={(e) => {
            const value = Math.max(0, parseFloat(e.target.value) || 0)
            updateItem?.(row.original.id, 'rate', value)
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
    accessorKey: 'amount',
    header: () => (
      <div className='text-muted-foreground text-right text-xs font-medium'>
        Amount (INR)
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.original.amount
      return (
        <div className='pr-4 text-right text-sm font-medium'>
          ₹ {amount.toLocaleString('en-IN', {
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
