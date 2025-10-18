import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  products: {
    list: (filters?: { search?: string; categoryId?: string; supplierId?: string; isActive?: boolean }) => 
      ipcRenderer.invoke('products:list', filters),
    get: (id: string) => ipcRenderer.invoke('products:get', id),
    create: (productData: any) => ipcRenderer.invoke('products:create', productData),
    update: (id: string, productData: any) => ipcRenderer.invoke('products:update', id, productData),
    delete: (id: string) => ipcRenderer.invoke('products:delete', id)
  },
  categories: {
    list: (filters?: { search?: string; isActive?: boolean }) => 
      ipcRenderer.invoke('categories:list', filters),
    create: (categoryData: any) => ipcRenderer.invoke('categories:create', categoryData),
    update: (id: string, categoryData: any) => ipcRenderer.invoke('categories:update', id, categoryData),
    delete: (id: string) => ipcRenderer.invoke('categories:delete', id)
  },
  suppliers: {
    list: (filters?: { search?: string; isActive?: boolean }) => 
      ipcRenderer.invoke('suppliers:list', filters),
    create: (supplierData: any) => ipcRenderer.invoke('suppliers:create', supplierData),
    update: (id: string, supplierData: any) => ipcRenderer.invoke('suppliers:update', id, supplierData),
    delete: (id: string) => ipcRenderer.invoke('suppliers:delete', id)
  },
  customers: {
    list: (filters?: { search?: string; isActive?: boolean }) => 
      ipcRenderer.invoke('customers:list', filters),
    create: (customerData: any) => ipcRenderer.invoke('customers:create', customerData),
    update: (id: string, customerData: any) => ipcRenderer.invoke('customers:update', id, customerData),
    delete: (id: string) => ipcRenderer.invoke('customers:delete', id)
  },
  stock: {
    recordMovement: (movementData: any) => ipcRenderer.invoke('stock:recordMovement', movementData),
    getHistory: (productId: string) => ipcRenderer.invoke('stock:getHistory', productId)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
