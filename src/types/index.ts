export interface Product {
  id: number
  name: string
  price: string
  inStock: boolean
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
  total: string
  itemCount: number
}
