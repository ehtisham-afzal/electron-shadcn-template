import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { eq, and, isNull, desc, like, or } from 'drizzle-orm'
// Import database utilities
import { initializeDatabase, closeDatabase, getDatabase } from './db'
import {
  productsTable,
  categoriesTable,
  suppliersTable,
  customersTable,
  invoicesTable,
  invoiceItemsTable,
  stockMovementsTable,
  paymentsTable
} from './db/schema'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize single application database
  try {
    initializeDatabase()
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // ============================================
  // PRODUCTS IPC HANDLERS
  // ============================================

  ipcMain.handle('products:list', async (_, filters?: { search?: string; categoryId?: string; supplierId?: string; isActive?: boolean }) => {
    try {
      const db = getDatabase()
      let query = db.select().from(productsTable).where(isNull(productsTable.deletedAt))

      if (filters?.search) {
        query = query.where(
          or(
            like(productsTable.name, `%${filters.search}%`),
            like(productsTable.sku, `%${filters.search}%`),
            like(productsTable.barcode, `%${filters.search}%`)
          )
        )
      }

      if (filters?.categoryId) {
        query = query.where(eq(productsTable.categoryId, filters.categoryId))
      }

      if (filters?.supplierId) {
        query = query.where(eq(productsTable.supplierId, filters.supplierId))
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(productsTable.isActive, filters.isActive))
      }

      const products = await query.orderBy(desc(productsTable.createdAt))
      return { success: true, data: products }
    } catch (error) {
      console.error('Error listing products:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('products:get', async (_, id: string) => {
    try {
      const db = getDatabase()
      const product = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1)
      return { success: true, data: product[0] || null }
    } catch (error) {
      console.error('Error getting product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('products:create', async (_, productData) => {
    try {
      const db = getDatabase()
      const result = await db.insert(productsTable).values(productData).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('products:update', async (_, id: string, productData) => {
    try {
      const db = getDatabase()
      const result = await db.update(productsTable).set({ ...productData, updatedAt: new Date() }).where(eq(productsTable.id, id)).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('products:delete', async (_, id: string) => {
    try {
      const db = getDatabase()
      await db.update(productsTable).set({ deletedAt: new Date() }).where(eq(productsTable.id, id))
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // ============================================
  // CATEGORIES IPC HANDLERS
  // ============================================

  ipcMain.handle('categories:list', async (_, filters?: { search?: string; isActive?: boolean }) => {
    try {
      const db = getDatabase()
      let query = db.select().from(categoriesTable).where(isNull(categoriesTable.deletedAt))

      if (filters?.search) {
        query = query.where(like(categoriesTable.name, `%${filters.search}%`))
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(categoriesTable.isActive, filters.isActive))
      }

      const categories = await query.orderBy(categoriesTable.name)
      return { success: true, data: categories }
    } catch (error) {
      console.error('Error listing categories:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('categories:create', async (_, categoryData) => {
    try {
      const db = getDatabase()
      const result = await db.insert(categoriesTable).values(categoryData).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('categories:update', async (_, id: string, categoryData) => {
    try {
      const db = getDatabase()
      const result = await db.update(categoriesTable).set({ ...categoryData, updatedAt: new Date() }).where(eq(categoriesTable.id, id)).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error updating category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('categories:delete', async (_, id: string) => {
    try {
      const db = getDatabase()
      await db.update(categoriesTable).set({ deletedAt: new Date() }).where(eq(categoriesTable.id, id))
      return { success: true }
    } catch (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // ============================================
  // SUPPLIERS IPC HANDLERS
  // ============================================

  ipcMain.handle('suppliers:list', async (_, filters?: { search?: string; isActive?: boolean }) => {
    try {
      const db = getDatabase()
      let query = db.select().from(suppliersTable).where(isNull(suppliersTable.deletedAt))

      if (filters?.search) {
        query = query.where(
          or(
            like(suppliersTable.name, `%${filters.search}%`),
            like(suppliersTable.phone, `%${filters.search}%`),
            like(suppliersTable.email, `%${filters.search}%`)
          )
        )
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(suppliersTable.isActive, filters.isActive))
      }

      const suppliers = await query.orderBy(suppliersTable.name)
      return { success: true, data: suppliers }
    } catch (error) {
      console.error('Error listing suppliers:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('suppliers:create', async (_, supplierData) => {
    try {
      const db = getDatabase()
      const result = await db.insert(suppliersTable).values(supplierData).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating supplier:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('suppliers:update', async (_, id: string, supplierData) => {
    try {
      const db = getDatabase()
      const result = await db.update(suppliersTable).set({ ...supplierData, updatedAt: new Date() }).where(eq(suppliersTable.id, id)).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error updating supplier:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('suppliers:delete', async (_, id: string) => {
    try {
      const db = getDatabase()
      await db.update(suppliersTable).set({ deletedAt: new Date() }).where(eq(suppliersTable.id, id))
      return { success: true }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // ============================================
  // CUSTOMERS IPC HANDLERS
  // ============================================

  ipcMain.handle('customers:list', async (_, filters?: { search?: string; isActive?: boolean }) => {
    try {
      const db = getDatabase()
      let query = db.select().from(customersTable).where(isNull(customersTable.deletedAt))

      if (filters?.search) {
        query = query.where(
          or(
            like(customersTable.name, `%${filters.search}%`),
            like(customersTable.phone, `%${filters.search}%`),
            like(customersTable.email, `%${filters.search}%`)
          )
        )
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(customersTable.isActive, filters.isActive))
      }

      const customers = await query.orderBy(customersTable.name)
      return { success: true, data: customers }
    } catch (error) {
      console.error('Error listing customers:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('customers:create', async (_, customerData) => {
    try {
      const db = getDatabase()
      const result = await db.insert(customersTable).values(customerData).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('customers:update', async (_, id: string, customerData) => {
    try {
      const db = getDatabase()
      const result = await db.update(customersTable).set({ ...customerData, updatedAt: new Date() }).where(eq(customersTable.id, id)).returning()
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('customers:delete', async (_, id: string) => {
    try {
      const db = getDatabase()
      await db.update(customersTable).set({ deletedAt: new Date() }).where(eq(customersTable.id, id))
      return { success: true }
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // ============================================
  // STOCK MOVEMENTS IPC HANDLERS
  // ============================================

  ipcMain.handle('stock:recordMovement', async (_, movementData) => {
    try {
      const db = getDatabase()
      
      // Get current product stock
      const product = await db.select().from(productsTable).where(eq(productsTable.id, movementData.productId)).limit(1)
      if (!product[0]) {
        throw new Error('Product not found')
      }

      const quantityBefore = product[0].stockQty
      const quantityAfter = quantityBefore + movementData.quantity

      // Record movement
      const movement = await db.insert(stockMovementsTable).values({
        ...movementData,
        quantityBefore,
        quantityAfter
      }).returning()

      // Update product stock
      await db.update(productsTable).set({ stockQty: quantityAfter }).where(eq(productsTable.id, movementData.productId))

      return { success: true, data: movement[0] }
    } catch (error) {
      console.error('Error recording stock movement:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('stock:getHistory', async (_, productId: string) => {
    try {
      const db = getDatabase()
      const movements = await db.select().from(stockMovementsTable).where(eq(stockMovementsTable.productId, productId)).orderBy(desc(stockMovementsTable.createdAt))
      return { success: true, data: movements }
    } catch (error) {
      console.error('Error getting stock history:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Example IPC handlers for database operations
  // You can uncomment and modify these as needed:
  /*
  import { getDatabase } from './db'
  import { userPreferencesTable } from './db/schema'
  
  ipcMain.handle('db:getUserPreferences', async () => {
    const db = getDatabase()
    return await db.select().from(userPreferencesTable)
  })
  
  ipcMain.handle('db:createUserPreference', async (_, userData) => {
    const db = getDatabase()
    return await db.insert(userPreferencesTable).values(userData)
  })
  */

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
