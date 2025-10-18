import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

// User preferences table
// Stores additional user information beyond what Supabase auth provides
export const userPreferencesTable = sqliteTable('user_preferences', {
  id: int().primaryKey({ autoIncrement: true }),
  supabaseId: text('supabase_id').notNull().unique(), // Links to Supabase auth.users.id
  theme: text().notNull().default('system'), // light, dark, system
  language: text().notNull().default('en'),
  notifications: int('notifications', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
})

// Categories table for product classification
export const categoriesTable = sqliteTable('categories', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id'), // Reserved for multi-branch support
  name: text().notNull(),
  description: text(),
  parentId: text('parent_id'), // For nested categories (optional)
  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
})

// Suppliers table
export const suppliersTable = sqliteTable('suppliers', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id'), // Reserved for multi-branch support
  name: text().notNull(),
  contactPerson: text('contact_person'),
  phone: text(),
  email: text(),
  address: text(),
  city: text(),
  country: text(),
  taxId: text('tax_id'), // VAT/GST number
  notes: text(),
  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
})

// Customers table
export const customersTable = sqliteTable('customers', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id'), // Reserved for multi-branch support
  name: text().notNull(),
  phone: text(),
  email: text(),
  address: text(),
  city: text(),
  country: text(),
  taxId: text('tax_id'), // VAT/GST number for B2B customers
  creditLimit: real('credit_limit').default(0), // Credit limit for the customer
  notes: text(),
  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
})

// Products table with foreign keys to categories and suppliers
export const productsTable = sqliteTable('products', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id'), // Reserved for multi-branch support
  categoryId: text('category_id'), // FK to categories.id
  supplierId: text('supplier_id'), // FK to suppliers.id (default supplier)
  sku: text().notNull().unique(), // Stock Keeping Unit - unique product identifier
  name: text().notNull(),
  description: text(),
  price: real().notNull().default(0), // Base selling price
  costPrice: real('cost_price').default(0), // Purchase/cost price
  taxRate: real('tax_rate').notNull().default(0), // Tax rate in percentage (e.g., 18 for 18%)
  stockQty: int('stock_qty').notNull().default(0), // Current stock quantity
  lowStockThreshold: int('low_stock_threshold').notNull().default(10), // Alert when stock is below this
  unit: text().default('pcs'), // Unit of measurement (pcs, kg, ltr, etc.)
  barcode: text(), // Barcode/UPC if available
  imageUrl: text('image_url'), // Product image URL or local path
  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
})

// Invoices table (sales, purchase, returns)
export const invoicesTable = sqliteTable('invoices', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id'), // Reserved for multi-branch support
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: text('customer_id'), // FK to customers.id (null for walk-in customers)
  supplierId: text('supplier_id'), // FK to suppliers.id (for purchase invoices)
  type: text().notNull(), // 'sale', 'purchase', 'sale_return', 'purchase_return'
  status: text().notNull().default('draft'), // 'draft', 'saved', 'paid', 'partial', 'canceled'
  subtotal: real().notNull().default(0),
  discount: real().notNull().default(0),
  taxTotal: real('tax_total').notNull().default(0),
  shippingCost: real('shipping_cost').default(0),
  total: real().notNull().default(0),
  paidAmount: real('paid_amount').default(0),
  balanceAmount: real('balance_amount').default(0),
  notes: text(),
  issuedAt: int('issued_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  dueDate: int('due_date', { mode: 'timestamp' }),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
})

// Invoice items table (line items for each invoice)
export const invoiceItemsTable = sqliteTable('invoice_items', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text('invoice_id').notNull(), // FK to invoices.id
  productId: text('product_id').notNull(), // FK to products.id
  productName: text('product_name').notNull(), // Snapshot of product name at time of invoice
  quantity: int().notNull(),
  unitPrice: real('unit_price').notNull(),
  taxRate: real('tax_rate').notNull().default(0),
  taxAmount: real('tax_amount').default(0),
  discount: real().default(0),
  total: real().notNull(),
  deliveryDate: int('delivery_date', { mode: 'timestamp' }),
  notes: text(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
})

// Stock movements table to track all inventory changes
export const stockMovementsTable = sqliteTable('stock_movements', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').notNull(), // FK to products.id
  invoiceId: text('invoice_id'), // FK to invoices.id (if movement is from an invoice)
  type: text().notNull(), // 'sale', 'purchase', 'adjustment', 'return', 'opening_stock'
  quantity: int().notNull(), // Signed quantity: positive for additions, negative for removals
  quantityBefore: int('quantity_before').notNull(), // Stock quantity before this movement
  quantityAfter: int('quantity_after').notNull(), // Stock quantity after this movement
  notes: text(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

// Payments table to track invoice payments
export const paymentsTable = sqliteTable('payments', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text('invoice_id').notNull(), // FK to invoices.id
  amount: real().notNull(),
  method: text().notNull(), // 'cash', 'card', 'upi', 'bank_transfer', 'cheque'
  reference: text(), // Transaction reference/cheque number
  notes: text(),
  receivedAt: int('received_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})
