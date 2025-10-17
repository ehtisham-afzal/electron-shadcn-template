import { createFileRoute } from '@tanstack/react-router'
import {
  FileText,
  Receipt,
  User,
  Calendar,
  Phone,
  Package,
  CreditCard,
  FileCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

// Demo data for the invoice
const DEMO_DATA = {
  invoiceNumber: 'INV-001',
  date: new Date().toLocaleDateString(),
  customer: {
    name: 'John Doe',
    phone: '+92 300 1234567'
  },
  items: [
    { id: 1, name: 'Web Development Services', quantity: 1, price: 150000, total: 150000 },
    { id: 2, name: 'UI/UX Design', quantity: 2, price: 35000, total: 70000 },
    { id: 3, name: 'Content Writing', quantity: 5, price: 5000, total: 25000 }
  ],
  summary: {
    subtotal: 245000,
    discount: 15000,
    discountPercent: 6.12,
    tax: 5000,
    taxType: 'GST',
    total: 235000,
    received: 100000,
    balance: 135000
  }
}

function InvoicePreview() {
  // Helper function to format currency
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

  // Get payment status for visual indicators
  const getPaymentStatus = () => {
    const { received, total } = DEMO_DATA.summary
    if (received === 0) return { label: 'Unpaid', variant: 'destructive' as const }
    if (received < total) return { label: 'Partially Paid', variant: 'outline' as const }
    return { label: 'Paid', variant: 'default' as const }
  }

  const paymentStatus = getPaymentStatus()

  return (
    <div className="h-full flex-1 overflow-auto bg-muted/20">
      <div className="container mx-auto max-w-5xl space-y-6 p-6">
        {/* Invoice Header with visual upgrade */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Receipt className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
              </div>
              <div className="mt-2 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>#{DEMO_DATA.invoiceNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{DEMO_DATA.date}</span>
                </div>
                <Badge variant={paymentStatus.variant}>{paymentStatus.label}</Badge>
              </div>
            </div>
            <Button size="lg" className="gap-2 shadow-lg">
              <FileCheck className="h-5 w-5" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Customer Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customer Name</div>
                <div className="mt-1 text-lg font-medium">{DEMO_DATA.customer.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Phone Number</div>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{DEMO_DATA.customer.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Section with visual upgrade */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Package className="h-5 w-5 text-primary" />
              Invoice Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead className="w-20 text-center">Qty</TableHead>
                    <TableHead className="w-32 text-right">Unit Price</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_DATA.items.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      <TableCell className="text-muted-foreground text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" className="gap-2">
                <Package className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section with visual upgrade */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end">
              <div className="w-full space-y-4 md:w-1/2">
                {/* Summary calculations */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(DEMO_DATA.summary.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      Discount
                      <Badge variant="outline" className="font-mono">
                        {DEMO_DATA.summary.discountPercent.toFixed(2)}%
                      </Badge>
                    </span>
                    <span className="font-mono font-medium text-destructive">
                      -{formatCurrency(DEMO_DATA.summary.discount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {DEMO_DATA.summary.taxType}
                    </span>
                    <span className="font-mono font-medium">
                      {formatCurrency(DEMO_DATA.summary.tax)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between py-1 text-lg font-bold">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(DEMO_DATA.summary.total)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Received</span>
                    <span className="font-mono font-medium text-success-foreground">
                      {formatCurrency(DEMO_DATA.summary.received)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 text-base font-bold">
                    <span className="text-muted-foreground">Balance Due</span>
                    <div>
                      <Badge
                        variant={paymentStatus.variant}
                        className="font-mono px-3 py-1 text-sm"
                      >
                        {formatCurrency(DEMO_DATA.summary.balance)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment status indicator */}
                <div
                  className={`mt-4 rounded-md border ${
                    paymentStatus.variant === 'default'
                      ? 'border-success/30 bg-success/10'
                      : paymentStatus.variant === 'destructive'
                        ? 'border-warning/30 bg-warning/10'
                        : 'border-destructive/30 bg-destructive/10'
                  } p-3 text-center`}
                >
                  <div className="text-sm font-medium">
                    {paymentStatus.variant === 'default'
                      ? 'Payment has been completed'
                      : paymentStatus.variant === 'destructive'
                        ? 'Partial payment received'
                        : 'Payment pending'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-4">
          <Button variant="outline" size="lg">
            Reset
          </Button>
          <Button variant="secondary" size="lg" className="gap-2">
            <FileText className="h-5 w-5" />
            Save as Draft
          </Button>
          <Button size="lg" className="gap-2">
            <FileCheck className="h-5 w-5" />
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/items/invoice/preview')({
  component: InvoicePreview
})
