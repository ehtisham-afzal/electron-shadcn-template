import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { ProductsTable } from '@/features/products/products-table'
import { productsColumns, Product } from '@/features/products/products-columns'
import { ProductFormDialog } from '@/features/products/product-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'

export const Route = createFileRoute('/_authenticated/products/')({
  component: ProductsPage
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const result = await window.api.products.list()
      if (!result.success) throw new Error(result.error || 'Failed to fetch products')
      return result.data || []
    },
    enabled: typeof window !== 'undefined' && !!window.api?.products
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await window.api.categories.list({ isActive: true })
      if (!result.success) throw new Error(result.error || 'Failed to fetch categories')
      return result.data || []
    },
    enabled: typeof window !== 'undefined' && !!window.api?.categories
  })

  // Fetch suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const result = await window.api.suppliers.list({ isActive: true })
      if (!result.success) throw new Error(result.error || 'Failed to fetch suppliers')
      return result.data || []
    },
    enabled: typeof window !== 'undefined' && !!window.api?.suppliers
  })

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!window.api?.products) throw new Error('API not available')
      if (selectedProduct) {
        return await window.api.products.update(selectedProduct.id, data)
      }
      return await window.api.products.create(data)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(selectedProduct ? 'Product updated' : 'Product created')
        queryClient.invalidateQueries({ queryKey: ['products'] })
        setIsFormOpen(false)
        setSelectedProduct(null)
      } else {
        toast.error(result.error || 'Operation failed')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!window.api?.products) throw new Error('API not available')
      return await window.api.products.delete(id)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Product deleted')
        queryClient.invalidateQueries({ queryKey: ['products'] })
      } else {
        toast.error(result.error || 'Delete failed')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const handleAddNew = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id)
      setProductToDelete(null)
    }
  }

  const handleDeleteSelected = async (ids: string[]) => {
    for (const id of ids) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleViewStock = (product: Product) => {
    toast.info('Stock history coming soon', {
      description: `View stock movements for ${product.name}`
    })
  }

  const columns = productsColumns(handleEdit, handleDelete, handleViewStock)

  // Show message if API not available (browser dev mode)
  if (typeof window === 'undefined' || !window.api?.products) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Electron API Not Available</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            This feature requires the Electron desktop app. Please run the full Electron build or check that the preload script is configured correctly.
          </p>
        </div>
      </div>
    )
  }

  if (isLoadingProducts) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 overflow-auto">
      <div className="container mx-auto space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your product inventory
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Table */}
        <ProductsTable
          columns={columns}
          data={productsData || []}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* Form Dialog */}
        <ProductFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          product={selectedProduct}
          onSubmit={async (data) => {
            await saveMutation.mutateAsync(data)
          }}
          categories={categoriesData || []}
          suppliers={suppliersData || []}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!productToDelete}
          onOpenChange={(open) => !open && setProductToDelete(null)}
          handleConfirm={confirmDelete}
          title="Delete Product"
          desc={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          destructive
        />
      </div>
    </div>
  )
}
