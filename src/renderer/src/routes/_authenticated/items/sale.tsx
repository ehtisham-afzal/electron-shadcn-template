import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Percent, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from '@/components/ui/field'
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { createFileRoute } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { InvoiceItemsTable } from '@/features/items/invoice/invoice-items-table'
import { invoiceItemsColumns, type InvoiceItem } from '@/features/items/invoice/invoice-items-columns'
import { AddMultipleRowsDialog } from '@/features/items/invoice/add-multiple-rows-dialog'

interface ValidationErrors {
  customerName?: string
  items?: string
}

function InvoicePage() {
  // Local state
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: crypto.randomUUID(),
      itemCode: '',
      deliveryDate: null,
      quantity: 1,
      rate: 0,
      amount: 0
    }
  ])
  const [discount, setDiscount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [tax, setTax] = useState(0)
  const [taxType, setTaxType] = useState('None')
  const [received, setReceived] = useState(0)
  const [fullyReceived, setFullyReceived] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showAddMultipleDialog, setShowAddMultipleDialog] = useState(false)

  // Computed values
  const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const total = subTotal - discount + tax
  const balance = Math.max(0, total - received)

  // Update discount when percentage changes
  useEffect(() => {
    if (discountPercent > 0) {
      setDiscount((subTotal * discountPercent) / 100)
    }
  }, [discountPercent, subTotal])

  // Update received when fully received is toggled
  useEffect(() => {
    if (fullyReceived) {
      setReceived(total)
    }
  }, [fullyReceived, total])

  // Update received when fully received is toggled
  useEffect(() => {
    if (fullyReceived) {
      setReceived(total)
    }
  }, [fullyReceived, total])

  // Helper functions
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Auto-calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
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
        description: 'Invoice must have at least one item'
      })
      return
    }
    setItems((prevItems) => prevItems.filter((item) => !ids.includes(item.id)))
    toast.success(`${ids.length} item(s) removed`)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      itemCode: '',
      deliveryDate: null,
      quantity: 1,
      rate: 0,
      amount: 0
    }
    setItems([...items, newItem])
  }

  const addMultipleItems = (count: number) => {
    const newItems: InvoiceItem[] = Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      itemCode: '',
      deliveryDate: null,
      quantity: 1,
      rate: 0,
      amount: 0
    }))
    setItems([...items, ...newItems])
    toast.success(`${count} rows added`)
  }

  const handleDownloadTemplate = () => {
    // Create CSV content
    const headers = ['Item Code', 'Delivery Date', 'Quantity', 'Rate (INR)']
    const csvContent = [
      headers.join(','),
      // Add sample data
      '12345-BLA-128GB: iPhone 13-BLA-128GB,16-10-2025,1,55999.00',
      '43567-BLA: OPPO A17k-BLA,16-10-2025,1,12999.00'
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-items-template.csv`
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

        // Skip header row
        const dataLines = lines.slice(1)

        const uploadedItems: InvoiceItem[] = dataLines.map((line) => {
          const [itemCode, dateStr, quantity, rate] = line.split(',')

          // Parse date (expecting dd-mm-yyyy format)
          let deliveryDate: Date | null = null
          if (dateStr) {
            const [day, month, year] = dateStr.trim().split('-')
            if (day && month && year) {
              deliveryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }
          }

          const qty = Math.max(0, parseInt(quantity) || 1)
          const price = Math.max(0, parseFloat(rate) || 0)

          return {
            id: crypto.randomUUID(),
            itemCode: itemCode?.trim() || '',
            deliveryDate,
            quantity: qty,
            rate: price,
            amount: qty * price
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

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }

    if (!items.some((i) => i.itemCode.trim())) {
      newErrors.items = 'At least one item with an item code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetInvoice = () => {
    setCustomerName('')
    setCustomerPhone('')
    setItems([
      {
        id: crypto.randomUUID(),
        itemCode: '',
        deliveryDate: null,
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ])
    setDiscount(0)
    setDiscountPercent(0)
    setTax(0)
    setTaxType('None')
    setReceived(0)
    setFullyReceived(false)
    setErrors({})
    toast.success('Invoice reset')
  }

  const handleSaveAndNew = () => {
    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors before saving'
      })
      return
    }

    // Here you would typically save to a database or API
    toast.success('Invoice saved', {
      description: `Invoice #${invoiceNumber} saved successfully`
    })

    // Generate new invoice number
    const currentNum = parseInt(invoiceNumber.split('-')[1])
    setInvoiceNumber(`INV-${String(currentNum + 1).padStart(3, '0')}`)

    resetInvoice()
  }

  const handleDiscountChange = (value: number) => {
    setDiscount(value)
    // Clear percentage when manually setting discount
    setDiscountPercent(0)
  }

  const handleDiscountPercentChange = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value))
    setDiscountPercent(clamped)
  }

  return (
    <div className="h-full flex-1 overflow-auto">
      <div className="container mx-auto max-w-5xl space-y-4 p-6">
        {/* Header */}
        <header className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">New Invoice</h1>
            <p className="text-muted-foreground mt-1 text-sm">Invoice #{invoiceNumber}</p>
          </div>
        </header>

        {/* Customer Information */}
        <Item variant="muted">
          <ItemContent className="w-full">
            <FieldGroup className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="customer-name">
                    Customer Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="customer-name"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={cn(errors.customerName && 'border-destructive')}
                  />
                  <FieldError>{errors.customerName}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="customer-phone">Phone Number</FieldLabel>
                  <div className="flex">
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                      +92
                    </span>
                    <Input
                      id="customer-phone"
                      placeholder="3001234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="rounded-l-none"
                      maxLength={10}
                    />
                  </div>
                </Field>
              </div>
            </FieldGroup>
          </ItemContent>
        </Item>

        {/* Items Section */}
        <Item variant="muted" className="flex flex-col">
          <ItemContent className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <ItemTitle>Items</ItemTitle>
                <ItemDescription>Add items to your invoice</ItemDescription>
              </div>
            </div>

            {errors.items && <FieldError className="mb-2">{errors.items}</FieldError>}

            <InvoiceItemsTable
              data={items}
              columns={invoiceItemsColumns}
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
        <Item variant="muted">
          <ItemContent className="w-full">
            <ItemTitle>Summary</ItemTitle>
            <ItemDescription>Discounts, taxes and payment details</ItemDescription>

            <FieldGroup className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Discount</FieldLabel>
                  <div className="flex gap-2">
                    <InputGroup>
                      <InputGroupInput
                        type="number"
                        value={discount}
                        onChange={(e) =>
                          handleDiscountChange(Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        placeholder="0.00"
                        className="text-right"
                      />
                      <InputGroupAddon>
                        <Coins />
                      </InputGroupAddon>
                    </InputGroup>

                    <InputGroup className="w-fit">
                      <InputGroupInput
                        type="number"
                        value={discountPercent}
                        onChange={(e) =>
                          handleDiscountPercentChange(parseFloat(e.target.value) || 0)
                        }
                        placeholder="%"
                        className="text-right"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <InputGroupAddon align="inline-end">
                        <Percent />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <FieldDescription>Enter amount or percentage</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Tax</FieldLabel>
                  <ButtonGroup className="w-full">
                    <ButtonGroup className="flex-1">
                      <Select value={taxType} onValueChange={setTaxType}>
                        <SelectTrigger className="font-mono">{taxType}</SelectTrigger>
                        <SelectContent className="min-w-32">
                          {['None', 'GST', 'VAT', 'Sales Tax'].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0.00"
                        className="w-full text-right"
                        min="0"
                        step="0.01"
                      />
                    </ButtonGroup>
                  </ButtonGroup>
                  <FieldDescription>Additional tax amount</FieldDescription>
                </Field>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="w-fit">
                  <FieldLabel htmlFor="received">Amount Received</FieldLabel>
                  <Input
                    id="received"
                    type="number"
                    value={received}
                    onChange={(e) => setReceived(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-fit text-right"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <FieldDescription>Amount paid by customer</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Balance Due</FieldLabel>
                  <div className="flex h-10 items-center justify-end">
                    <Badge
                      variant={balance > 0 ? 'destructive' : 'secondary'}
                      className="px-4 py-2 text-base"
                    >
                      {formatCurrency(balance)}
                    </Badge>
                  </div>
                  <FieldDescription className="text-right">Remaining amount</FieldDescription>
                </Field>
              </div>

              <Field orientation="horizontal">
                <Checkbox
                  id="fully-received"
                  checked={fullyReceived}
                  onCheckedChange={(checked) => setFullyReceived(!!checked)}
                />
                <FieldLabel htmlFor="fully-received" className="cursor-pointer font-normal">
                  Mark as fully paid
                </FieldLabel>
              </Field>
            </FieldGroup>
          </ItemContent>
        </Item>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" size="lg" onClick={resetInvoice}>
            Reset
          </Button>
          <Button onClick={handleSaveAndNew} size="lg">
            <FileText className="mr-2 h-4 w-4" />
            Save & New Invoice
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

export const Route = createFileRoute('/_authenticated/items/sale')({
  component: InvoicePage
})
