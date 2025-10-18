import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesPage
})

type Category = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

function CategoriesPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await window.api.categories.list()
      if (!result.success) throw new Error(result.error || 'Failed to fetch categories')
      return result.data || []
    },
    enabled: typeof window !== 'undefined' && !!window.api?.categories
  })

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      if (!window.api?.categories) throw new Error('API not available')
      if (selectedCategory) {
        return await window.api.categories.update(selectedCategory.id, data)
      }
      return await window.api.categories.create(data)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(selectedCategory ? 'Category updated' : 'Category created')
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        handleCloseForm()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!window.api?.categories) throw new Error('API not available')
      return await window.api.categories.delete(id)
    },
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      setName(category.name)
      setDescription(category.description || '')
    } else {
      setSelectedCategory(null)
      setName('')
      setDescription('')
    }
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedCategory(null)
    setName('')
    setDescription('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ name, description })
  }

  // Show message if API not available (browser dev mode)
  if (typeof window === 'undefined' || !window.api?.categories) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Tag className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Electron API Not Available</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            This feature requires the Electron desktop app. Please run the full Electron build.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Tag className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 overflow-auto">
      <div className="container mx-auto space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1 text-sm">Organize your products</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesData?.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(category)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory ? 'Update category details' : 'Create a new product category'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Electronics, Clothing, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {selectedCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
