const API_URL = 'http://localhost:4000/api'
const CSRF_STORAGE_KEY = 'csrf_token'

import { Product, ShippingRate } from '@/types'

export interface AuthUser {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  role?: string
  preferences?: any
}

export interface AdminUser {
  id: number
  name: string
  email?: string | null
  role?: string
  permissions?: string[]
}

const getStoredCsrf = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(CSRF_STORAGE_KEY)
  } catch {
    return null
  }
}

const setStoredCsrf = (token: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CSRF_STORAGE_KEY, token)
  } catch {
    // Ignore storage failures
  }
}

const ensureCsrfToken = async () => {
  let token = getStoredCsrf()
  if (token) return token

  const res = await fetch(`${API_URL}/csrf`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to initialize CSRF token')
  const data = await res.json()
  token = data?.token
  if (token) {
    setStoredCsrf(token)
  }
  return token
}

const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
  const token = await ensureCsrfToken()
  const headers = { ...(options.headers || {}), 'x-csrf-token': token }
  return fetch(url, { ...options, headers })
}

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
  const res = await fetchWithCsrf(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const res = await fetchWithCsrf(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetchWithCsrf(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
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
  const res = await fetchWithCsrf(`${API_URL}/shipping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create shipping rate')
  return res.json()
}

export async function updateShippingRate(id: number, data: Partial<ShippingRate>): Promise<ShippingRate> {
  const res = await fetchWithCsrf(`${API_URL}/shipping/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update shipping rate')
  return res.json()
}

export async function deleteShippingRate(id: number): Promise<void> {
  const res = await fetchWithCsrf(`${API_URL}/shipping/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
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
  const res = await fetch(`${API_URL}/orders`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function createOrder(data: any) {
  const res = await fetchWithCsrf(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await fetchWithCsrf(`${API_URL}/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
  const res = await fetchWithCsrf(`${API_URL}/settings/store`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update store settings')
  return res.json()
}

export async function updateTaxSettings(data: Partial<StoreSettings['tax']>) {
  const res = await fetchWithCsrf(`${API_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tax: data }),
  })
  if (!res.ok) throw new Error('Failed to update tax settings')
  return res.json()
}

export async function updateNotificationSettings(data: Partial<StoreSettings['notifications']>) {
  const res = await fetchWithCsrf(`${API_URL}/settings/notifications`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update notification settings')
  return res.json()
}

export async function updateCookieSettings(data: Partial<StoreSettings['cookies']>) {
  const res = await fetchWithCsrf(`${API_URL}/settings/cookies`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update cookie settings')
  return res.json()
}

// ============================================
// AUTH
// ============================================

export async function registerUser(payload: {
  name: string
  email?: string
  phone?: string
  password: string
}): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create account')
  return res.json()
}

export async function loginUser(payload: {
  identifier: string
  password: string
}): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to log out')
  }
}

// ============================================
// USER DASHBOARD
// ============================================

export async function fetchMyOrders() {
  const res = await fetch(`${API_URL}/me/orders`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function fetchMyPreferences() {
  const res = await fetch(`${API_URL}/me/preferences`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch preferences')
  return res.json()
}

export async function updateMyPreferences(data: any) {
  const res = await fetchWithCsrf(`${API_URL}/me/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update preferences')
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

// ============================================
// ADMIN AUTH
// ============================================

export async function adminLogin(payload: { email: string; password: string }): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Admin login failed')
  return res.json()
}

export async function fetchAdmin(): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin-auth/me`, { credentials: 'include' })
  if (!res.ok) throw new Error('Admin not authenticated')
  return res.json()
}

export async function adminLogout(): Promise<void> {
  const res = await fetch(`${API_URL}/admin-auth/logout`, { method: 'POST', credentials: 'include' })
  if (!res.ok && res.status !== 204) throw new Error('Failed to log out')
}

// ============================================
// ADMIN DATA VIEWER
// ============================================

export async function fetchAdminData(dataset: string) {
  const res = await fetch(`${API_URL}/admin-data?dataset=${encodeURIComponent(dataset)}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch admin data')
  return res.json()
}

// ============================================
// PAYMENTS (FLUTTERWAVE)
// ============================================

export async function fetchFlutterwaveStatus() {
  const res = await fetch(`${API_URL}/payments/flutterwave/status`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch payment status')
  return res.json()
}

export async function startFlutterwaveCharge(payload: {
  amount: number
  phone: string
  network: 'MTN' | 'AIRTEL'
  customerName: string
  meta?: Record<string, any>
}) {
  const res = await fetchWithCsrf(`${API_URL}/payments/flutterwave/uganda`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || 'Failed to start payment')
  }
  return res.json()
}
