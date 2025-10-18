import { ElectronAPI } from '@electron-toolkit/preload'

interface Product {
  id: string
  businessId: string | null
  categoryId: string | null
  supplierId: string | null
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
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

interface Category {
  id: string
  businessId: string | null
  name: string
  description: string | null
  parentId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

interface Supplier {
  id: string
  businessId: string | null
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  taxId: string | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

interface Customer {
  id: string
  businessId: string | null
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  taxId: string | null
  creditLimit: number | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

interface StockMovement {
  id: string
  productId: string
  invoiceId: string | null
  type: string
  quantity: number
  quantityBefore: number
  quantityAfter: number
  notes: string | null
  createdAt: Date
}

interface ProductsAPI {
  list: (filters?: { search?: string; categoryId?: string; supplierId?: string; isActive?: boolean }) => 
    Promise<{ success: boolean; data?: Product[]; error?: string }>
  get: (id: string) => Promise<{ success: boolean; data?: Product | null; error?: string }>
  create: (productData: Partial<Product>) => Promise<{ success: boolean; data?: Product; error?: string }>
  update: (id: string, productData: Partial<Product>) => Promise<{ success: boolean; data?: Product; error?: string }>
  delete: (id: string) => Promise<{ success: boolean; error?: string }>
}

interface CategoriesAPI {
  list: (filters?: { search?: string; isActive?: boolean }) => 
    Promise<{ success: boolean; data?: Category[]; error?: string }>
  create: (categoryData: Partial<Category>) => Promise<{ success: boolean; data?: Category; error?: string }>
  update: (id: string, categoryData: Partial<Category>) => Promise<{ success: boolean; data?: Category; error?: string }>
  delete: (id: string) => Promise<{ success: boolean; error?: string }>
}

interface SuppliersAPI {
  list: (filters?: { search?: string; isActive?: boolean }) => 
    Promise<{ success: boolean; data?: Supplier[]; error?: string }>
  create: (supplierData: Partial<Supplier>) => Promise<{ success: boolean; data?: Supplier; error?: string }>
  update: (id: string, supplierData: Partial<Supplier>) => Promise<{ success: boolean; data?: Supplier; error?: string }>
  delete: (id: string) => Promise<{ success: boolean; error?: string }>
}

interface CustomersAPI {
  list: (filters?: { search?: string; isActive?: boolean }) => 
    Promise<{ success: boolean; data?: Customer[]; error?: string }>
  create: (customerData: Partial<Customer>) => Promise<{ success: boolean; data?: Customer; error?: string }>
  update: (id: string, customerData: Partial<Customer>) => Promise<{ success: boolean; data?: Customer; error?: string }>
  delete: (id: string) => Promise<{ success: boolean; error?: string }>
}

interface StockAPI {
  recordMovement: (movementData: Partial<StockMovement>) => Promise<{ success: boolean; data?: StockMovement; error?: string }>
  getHistory: (productId: string) => Promise<{ success: boolean; data?: StockMovement[]; error?: string }>
}

interface API {
  products: ProductsAPI
  categories: CategoriesAPI
  suppliers: SuppliersAPI
  customers: CustomersAPI
  stock: StockAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

