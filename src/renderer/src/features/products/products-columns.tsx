import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, Package } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  costPrice: number | null
  taxRate: number
  stockQty: number
  lowStockThreshold: number
  unit: string | null
  barcode: string | null
  categoryId: string | null
  supplierId: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const productsColumns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  onViewStock: (product: Product) => void
): ColumnDef<Product>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('sku')}</div>
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.imageUrl ? (
          <img
            src={row.original.imageUrl}
            alt={row.original.name}
            className="h-8 w-8 rounded object-cover"
          />
        ) : (
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          {row.original.description && (
            <div className="text-muted-foreground text-xs">{row.original.description}</div>
          )}
        </div>
      </div>
    )
  },
  {
    accessorKey: 'stockQty',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.getValue('stockQty') as number
      const threshold = row.original.lowStockThreshold
      const isLowStock = stock <= threshold
      const isOutOfStock = stock === 0

      return (
        <div className="flex items-center gap-2">
          <span className={isOutOfStock ? 'text-destructive font-medium' : ''}>
            {stock} {row.original.unit || 'pcs'}
          </span>
          {isLowStock && !isOutOfStock && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              Low
            </Badge>
          )}
          {isOutOfStock && <Badge variant="destructive">Out</Badge>}
        </div>
      )
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(price)
      return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: 'costPrice',
    header: 'Cost',
    cell: ({ row }) => {
      const cost = row.original.costPrice
      if (!cost) return <span className="text-muted-foreground">-</span>
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(cost)
      return <div className="text-sm">{formatted}</div>
    }
  },
  {
    accessorKey: 'taxRate',
    header: 'Tax',
    cell: ({ row }) => <div className="text-sm">{row.getValue('taxRate')}%</div>
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewStock(product)}>
              <Package className="mr-2 h-4 w-4" />
              View Stock History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
