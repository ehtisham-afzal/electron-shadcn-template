import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/suppliers/')({
  component: SuppliersPage
})

type Supplier = {
  id: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  isActive: boolean
}

function SuppliersPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  })

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const result = await window.api.suppliers.list()
      if (!result.success) throw new Error(result.error || 'Failed to fetch suppliers')
      return result.data || []
    },
    enabled: typeof window !== 'undefined' && !!window.api?.suppliers
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!window.api?.suppliers) throw new Error('API not available')
      if (selectedSupplier) {
        return await window.api.suppliers.update(selectedSupplier.id, data)
      }
      return await window.api.suppliers.create(data)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(selectedSupplier ? 'Supplier updated' : 'Supplier created')
        queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        handleCloseForm()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!window.api?.suppliers) throw new Error('API not available')
      return await window.api.suppliers.delete(id)
    },
    onSuccess: () => {
      toast.success('Supplier deleted')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  const handleOpenForm = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier)
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || ''
      })
    } else {
      setSelectedSupplier(null)
      setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' })
    }
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSupplier(null)
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  // Show message if API not available (browser dev mode)
  if (typeof window === 'undefined' || !window.api?.suppliers) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
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
        <Building2 className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 overflow-auto">
      <div className="container mx-auto space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your suppliers</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliersData?.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {supplier.contactPerson && (
                  <CardDescription>{supplier.contactPerson}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground space-y-1 text-sm">
                  {supplier.phone && <div>📞 {supplier.phone}</div>}
                  {supplier.email && <div>✉️ {supplier.email}</div>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(supplier)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(supplier.id)}
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
                {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
              <DialogDescription>
                {selectedSupplier ? 'Update supplier information' : 'Add a new supplier to your system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {selectedSupplier ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
