export interface Product {
  id: number
  name: string
  price: number
  inStock: boolean
  category?: string
  description?: string
  image?: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

export interface ShippingRate {
  id: number
  location: string
  fee: number
}

export interface Category {
  id: number
  name: string
  label: string
}

export interface Order {
  id: number
  userId: number
  items: CartItem[]
  total: number
  shippingFee: number
  location: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: string
}

// Helper to format price in UGX
export function formatPrice(price: number): string {
  return `UGX ${price.toLocaleString()}`
}
