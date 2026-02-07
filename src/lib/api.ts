import { Product, ShippingRate } from '@/types'

const API_URL = 'http://localhost:4000'

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  return response.json()
}

export async function fetchProduct(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch product')
  }
  return response.json()
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!response.ok) {
    throw new Error('Failed to create product')
  }
  return response.json()
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!response.ok) {
    throw new Error('Failed to update product')
  }
  return response.json()
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete product')
  }
}

// Shipping Rates
export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const response = await fetch(`${API_URL}/shippingRates`)
  if (!response.ok) {
    throw new Error('Failed to fetch shipping rates')
  }
  return response.json()
}

export async function updateShippingRate(id: number, data: Partial<ShippingRate>): Promise<ShippingRate> {
  const response = await fetch(`${API_URL}/shippingRates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update shipping rate')
  }
  return response.json()
}

export async function createShippingRate(data: Omit<ShippingRate, 'id'>): Promise<ShippingRate> {
  const response = await fetch(`${API_URL}/shippingRates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create shipping rate')
  }
  return response.json()
}

export async function deleteShippingRate(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/shippingRates/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete shipping rate')
  }
}
