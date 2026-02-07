const API_URL = 'http://localhost:4000/api'

import { Product, ShippingRate } from '@/types'

// ============================================
// PRODUCTS
// ============================================

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  return res.json()
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}

// ============================================
// SHIPPING RATES
// ============================================

export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const res = await fetch(`${API_URL}/shipping`)
  if (!res.ok) throw new Error('Failed to fetch shipping rates')
  return res.json()
}

export async function createShippingRate(data: Omit<ShippingRate, 'id'>): Promise<ShippingRate> {
  const res = await fetch(`${API_URL}/shipping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create shipping rate')
  return res.json()
}

export async function updateShippingRate(id: number, data: Partial<ShippingRate>): Promise<ShippingRate> {
  const res = await fetch(`${API_URL}/shipping/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update shipping rate')
  return res.json()
}

export async function deleteShippingRate(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/shipping/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete shipping rate')
}

// ============================================
// CATEGORIES
// ============================================

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

// ============================================
// ORDERS
// ============================================

export async function fetchOrders() {
  const res = await fetch(`${API_URL}/orders`)
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function createOrder(data: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

// ============================================
// SETTINGS
// ============================================

export interface StoreSettings {
  store: {
    name: string
    email: string
    phone: string
    currency: string
    country: string
    address: string
  }
  tax: {
    enabled: boolean
    name: string
    rate: number
    includeInPrice: boolean
  }
  notifications: {
    emailEnabled: boolean
    lowStockAlert: boolean
    orderConfirmation: boolean
    shippingUpdates: boolean
  }
  cookies: {
    enabled: boolean
    requireConsent: boolean
  }
}

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_URL}/settings`)
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

export async function updateStoreSettings(data: Partial<StoreSettings['store']>) {
  const res = await fetch(`${API_URL}/settings/store`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update store settings')
  return res.json()
}

export async function updateTaxSettings(data: Partial<StoreSettings['tax']>) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tax: data }),
  })
  if (!res.ok) throw new Error('Failed to update tax settings')
  return res.json()
}

export async function updateNotificationSettings(data: Partial<StoreSettings['notifications']>) {
  const res = await fetch(`${API_URL}/settings/notifications`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update notification settings')
  return res.json()
}

export async function updateCookieSettings(data: Partial<StoreSettings['cookies']>) {
  const res = await fetch(`${API_URL}/settings/cookies`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update cookie settings')
  return res.json()
}

export async function upsertCookieConsent(data: {
  consentId: string
  status: 'accepted' | 'declined'
  email?: string | null
}) {
  const res = await fetch(`${API_URL}/consents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to store cookie consent')
  return res.json()
}
