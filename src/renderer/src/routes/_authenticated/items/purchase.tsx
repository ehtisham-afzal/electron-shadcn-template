import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Percent, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from '@/components/ui/field'
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PurchaseItemsTable } from '@/features/items/purchase/purchase-items-table'
import {
  purchaseItemsColumns,
  type PurchaseItem,
} from '@/features/items/purchase/purchase-items-columns'
import { AddMultipleRowsDialog } from '@/features/items/purchase/add-multiple-rows-dialog'

export const Route = createFileRoute('/_authenticated/items/purchase')({
  component: PurchasePage,
})

interface ValidationErrors {
  supplierName?: string
  items?: string
}

function PurchasePage() {
  // Local state
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('PO-001')
  const [supplierName, setSupplierName] = useState('')
  const [supplierContact, setSupplierContact] = useState('')
  const [supplierEmail, setSupplierEmail] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: crypto.randomUUID(),
      itemName: '',
      itemCode: '',
      category: '',
      supplier: '',
      purchaseDate: null,
      expiryDate: null,
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ])
  const [discount, setDiscount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [tax, setTax] = useState(0)
  const [taxType, setTaxType] = useState('None')
  const [shippingCost, setShippingCost] = useState(0)
  const [paid, setPaid] = useState(0)
  const [fullyPaid, setFullyPaid] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showAddMultipleDialog, setShowAddMultipleDialog] = useState(false)

  // Computed values
  const subTotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subTotal - discount + tax + shippingCost
  const balance = Math.max(0, total - paid)

  // Update discount when percentage changes
  useEffect(() => {
    if (discountPercent > 0) {
      setDiscount((subTotal * discountPercent) / 100)
    }
  }, [discountPercent, subTotal])

  // Update paid when fully paid is toggled
  useEffect(() => {
    if (fullyPaid) {
      setPaid(total)
    }
  }, [fullyPaid, total])

  // Helper functions
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Auto-calculate total when quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })
    )
  }

  const deleteItems = (ids: string[]) => {
    if (items.length - ids.length < 1) {
      toast.error('Cannot delete', {
        description: 'Purchase order must have at least one item',
      })
      return
    }
    setItems((prevItems) => prevItems.filter((item) => !ids.includes(item.id)))
    toast.success(`${ids.length} item(s) removed`)
  }

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: crypto.randomUUID(),
      itemName: '',
      itemCode: '',
      category: '',
      supplier: supplierName,
      purchaseDate: null,
      expiryDate: null,
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const addMultipleItems = (count: number) => {
    const newItems: PurchaseItem[] = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      itemName: '',
      itemCode: '',
      category: '',
      supplier: supplierName,
      purchaseDate: null,
      expiryDate: null,
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }))
    setItems([...items, ...newItems])
    toast.success(`${count} rows added`)
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'Item Name',
      'Item Code',
      'Category',
      'Supplier',
      'Purchase Date',
      'Expiry Date',
      'Quantity',
      'Unit Price (INR)',
    ]
    const csvContent = [
      headers.join(','),
      'iPhone 13 Pro,IP13PRO-256,Electronics,Apple Inc,17-10-2025,17-10-2026,10,89999.00',
      'Samsung Galaxy S21,SGS21-128,Electronics,Samsung,17-10-2025,17-10-2026,5,69999.00',
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase-items-template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Template downloaded')
  }

  const handleUploadItems = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())

        const dataLines = lines.slice(1)

        const uploadedItems: PurchaseItem[] = dataLines.map((line) => {
          const [itemName, itemCode, category, supplier, purchaseDateStr, expiryDateStr, quantity, unitPrice] =
            line.split(',')

          // Parse purchase date
          let purchaseDate: Date | null = null
          if (purchaseDateStr) {
            const [day, month, year] = purchaseDateStr.trim().split('-')
            if (day && month && year) {
              purchaseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }
          }

          // Parse expiry date
          let expiryDate: Date | null = null
          if (expiryDateStr) {
            const [day, month, year] = expiryDateStr.trim().split('-')
            if (day && month && year) {
              expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }
          }

          const qty = Math.max(0, parseInt(quantity) || 1)
          const price = Math.max(0, parseFloat(unitPrice) || 0)

          return {
            id: crypto.randomUUID(),
            itemName: itemName?.trim() || '',
            itemCode: itemCode?.trim() || '',
            category: category?.trim() || '',
            supplier: supplier?.trim() || supplierName,
            purchaseDate,
            expiryDate,
            quantity: qty,
            unitPrice: price,
            total: qty * price,
          }
        })

        if (uploadedItems.length > 0) {
          setItems(uploadedItems)
          toast.success(`${uploadedItems.length} items imported`)
        } else {
          toast.error('No valid items found in the file')
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required'
    }

    if (!items.some((i) => i.itemName.trim() && i.itemCode.trim())) {
      newErrors.items = 'At least one item with name and code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetPurchaseOrder = () => {
    setSupplierName('')
    setSupplierContact('')
    setSupplierEmail('')
    setItems([
      {
        id: crypto.randomUUID(),
        itemName: '',
        itemCode: '',
        category: '',
        supplier: '',
        purchaseDate: null,
        expiryDate: null,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ])
    setDiscount(0)
    setDiscountPercent(0)
    setTax(0)
    setTaxType('None')
    setShippingCost(0)
    setPaid(0)
    setFullyPaid(false)
    setErrors({})
    toast.success('Purchase order reset')
  }

  const handleSaveAndNew = () => {
    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors before saving',
      })
      return
    }

    toast.success('Purchase order saved', {
      description: `Purchase Order #${purchaseOrderNumber} saved successfully`,
    })

    const currentNum = parseInt(purchaseOrderNumber.split('-')[1])
    setPurchaseOrderNumber(`PO-${String(currentNum + 1).padStart(3, '0')}`)

    resetPurchaseOrder()
  }

  const handleDiscountChange = (value: number) => {
    setDiscount(value)
    setDiscountPercent(0)
  }

  const handleDiscountPercentChange = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value))
    setDiscountPercent(clamped)
  }

  return (
    <div className='h-full flex-1 overflow-auto'>
      <div className='container mx-auto max-w-7xl space-y-4 p-6'>
        {/* Header */}
        <header className='flex items-center justify-between pb-4'>
          <div>
            <h1 className='text-3xl font-semibold tracking-tight'>New Purchase Order</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              Purchase Order #{purchaseOrderNumber}
            </p>
          </div>
        </header>

        {/* Supplier Information */}
        <Item variant='muted'>
          <ItemContent className='w-full'>
            <ItemTitle>Supplier Information</ItemTitle>
            <ItemDescription>Enter the supplier details</ItemDescription>

            <FieldGroup className='mt-4'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <Field>
                  <FieldLabel htmlFor='supplier-name'>
                    Supplier Name <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    id='supplier-name'
                    placeholder='ABC Suppliers Ltd.'
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className={cn(errors.supplierName && 'border-destructive')}
                  />
                  <FieldError>{errors.supplierName}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor='supplier-contact'>Contact Number</FieldLabel>
                  <div className='flex'>
                    <span className='bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm'>
                      +92
                    </span>
                    <Input
                      id='supplier-contact'
                      placeholder='3001234567'
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      className='rounded-l-none'
                      maxLength={10}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor='supplier-email'>Email Address</FieldLabel>
                  <Input
                    id='supplier-email'
                    type='email'
                    placeholder='supplier@example.com'
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          </ItemContent>
        </Item>

        {/* Items Section */}
        <Item variant='muted' className='flex flex-col'>
          <ItemContent className='w-full'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <ItemTitle>Purchase Items</ItemTitle>
                <ItemDescription>Add items to your purchase order</ItemDescription>
              </div>
            </div>

            {errors.items && <FieldError className='mb-2'>{errors.items}</FieldError>}

            <PurchaseItemsTable
              data={items}
              columns={purchaseItemsColumns}
              updateItem={updateItem}
              onAddRow={addItem}
              onAddMultipleRows={() => setShowAddMultipleDialog(true)}
              onDeleteSelected={deleteItems}
              onDownload={handleDownloadTemplate}
              onUpload={handleUploadItems}
            />
          </ItemContent>
        </Item>

        {/* Summary */}
        <Item variant='muted'>
          <ItemContent className='w-full'>
            <ItemTitle>Order Summary</ItemTitle>
            <ItemDescription>Discounts, taxes, shipping and payment details</ItemDescription>

            <FieldGroup className='mt-4'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <Field>
                  <FieldLabel>Discount</FieldLabel>
                  <div className='flex gap-2'>
                    <InputGroup>
                      <InputGroupInput
                        type='number'
                        value={discount}
                        onChange={(e) =>
                          handleDiscountChange(Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        placeholder='0.00'
                        className='text-right'
                      />
                      <InputGroupAddon>
                        <Coins />
                      </InputGroupAddon>
                    </InputGroup>

                    <InputGroup className='w-fit'>
                      <InputGroupInput
                        type='number'
                        value={discountPercent}
                        onChange={(e) =>
                          handleDiscountPercentChange(parseFloat(e.target.value) || 0)
                        }
                        placeholder='%'
                        className='text-right'
                        min='0'
                        max='100'
                        step='1'
                      />
                      <InputGroupAddon align='inline-end'>
                        <Percent />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <FieldDescription>Enter amount or percentage</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Tax</FieldLabel>
                  <ButtonGroup className='w-full'>
                    <ButtonGroup className='flex-1'>
                      <Select value={taxType} onValueChange={setTaxType}>
                        <SelectTrigger className='font-mono'>{taxType}</SelectTrigger>
                        <SelectContent className='min-w-32'>
                          {['None', 'GST', 'VAT', 'Sales Tax'].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type='number'
                        value={tax}
                        onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder='0.00'
                        className='w-full text-right'
                        min='0'
                        step='0.01'
                      />
                    </ButtonGroup>
                  </ButtonGroup>
                  <FieldDescription>Additional tax amount</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor='shipping'>Shipping Cost</FieldLabel>
                  <Input
                    id='shipping'
                    type='number'
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className='text-right'
                    placeholder='0.00'
                    min='0'
                    step='0.01'
                  />
                  <FieldDescription>Shipping and handling charges</FieldDescription>
                </Field>
              </div>

              <Separator />

              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Subtotal</span>
                  <span className='font-medium'>₹ {formatCurrency(subTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Discount</span>
                    <span className='font-medium text-green-600'>
                      - ₹ {formatCurrency(discount)}
                    </span>
                  </div>
                )}
                {tax > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Tax ({taxType})</span>
                    <span className='font-medium'>₹ {formatCurrency(tax)}</span>
                  </div>
                )}
                {shippingCost > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Shipping</span>
                    <span className='font-medium'>₹ {formatCurrency(shippingCost)}</span>
                  </div>
                )}
                <div className='flex justify-between border-t pt-2 text-lg font-semibold'>
                  <span>Total</span>
                  <span>₹ {formatCurrency(total)}</span>
                </div>
              </div>

              <Separator />

              <div className='grid gap-4 sm:grid-cols-2'>
                <Field className='w-fit'>
                  <FieldLabel htmlFor='paid'>Amount Paid</FieldLabel>
                  <Input
                    id='paid'
                    type='number'
                    value={paid}
                    onChange={(e) => setPaid(Math.max(0, parseFloat(e.target.value) || 0))}
                    className='w-fit text-right'
                    placeholder='0.00'
                    min='0'
                    step='0.01'
                  />
                  <FieldDescription>Amount paid to supplier</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Balance Due</FieldLabel>
                  <div className='flex h-10 items-center justify-end'>
                    <Badge
                      variant={balance > 0 ? 'destructive' : 'secondary'}
                      className='px-4 py-2 text-base'
                    >
                      ₹ {formatCurrency(balance)}
                    </Badge>
                  </div>
                  <FieldDescription className='text-right'>Remaining amount</FieldDescription>
                </Field>
              </div>

              <Field orientation='horizontal'>
                <Checkbox
                  id='fully-paid'
                  checked={fullyPaid}
                  onCheckedChange={(checked) => setFullyPaid(!!checked)}
                />
                <FieldLabel htmlFor='fully-paid' className='cursor-pointer font-normal'>
                  Mark as fully paid
                </FieldLabel>
              </Field>
            </FieldGroup>
          </ItemContent>
        </Item>

        {/* Actions */}
        <div className='flex justify-end gap-3 pb-6'>
          <Button variant='outline' size='lg' onClick={resetPurchaseOrder}>
            Reset
          </Button>
          <Button onClick={handleSaveAndNew} size='lg'>
            <ShoppingCart className='mr-2 h-4 w-4' />
            Save & New Order
          </Button>
        </div>
      </div>

      <AddMultipleRowsDialog
        open={showAddMultipleDialog}
        onOpenChange={setShowAddMultipleDialog}
        onConfirm={addMultipleItems}
      />
    </div>
  )
}
