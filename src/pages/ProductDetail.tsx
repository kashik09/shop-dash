import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, ShoppingCart, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { fetchProduct } from '@/lib/api'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id))
    }
  }, [id])

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true)
      const data = await fetchProduct(productId)
      setProduct(data)
      setError(null)
    } catch {
      setError('Failed to load product.')
      // Fallback demo data
      const demoProducts: Product[] = [
        { id: 1, name: 'Laptop', price: '$999', inStock: true, description: 'High-performance laptop for work and play.' },
        { id: 2, name: 'Phone', price: '$699', inStock: false, description: 'Latest smartphone with advanced features.' },
        { id: 3, name: 'Tablet', price: '$499', inStock: true, description: 'Versatile tablet for entertainment and productivity.' },
        { id: 4, name: 'Monitor', price: '$299', inStock: true, description: '27-inch 4K display for crisp visuals.' },
        { id: 5, name: 'Keyboard', price: '$79', inStock: false, description: 'Mechanical keyboard with RGB lighting.' },
      ]
      const found = demoProducts.find((p) => p.id === productId)
      if (found) setProduct(found)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/products">
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </Link>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card className="overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`h-80 lg:h-full min-h-[300px] w-full object-cover ${
                !product.inStock && 'grayscale'
              }`}
            />
          ) : (
            <div
              className={`flex h-80 lg:h-full min-h-[300px] items-center justify-center ${
                product.inStock
                  ? 'bg-gradient-to-br from-primary to-sky-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}
            >
              <Package className="h-32 w-32 text-white/80" />
            </div>
          )}
        </Card>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge
            variant={product.inStock ? 'success' : 'destructive'}
            className="w-fit gap-1 mb-4"
          >
            {product.inStock ? (
              <>
                <CheckCircle className="h-3 w-3" />
                In Stock
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Out of Stock
              </>
            )}
          </Badge>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-4xl font-bold text-primary mb-6">{product.price}</p>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {product.description ||
                  'A high-quality product designed to meet your needs. Built with premium materials and backed by our satisfaction guarantee.'}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-auto">
            <Button
              size="lg"
              className="flex-1 gap-2"
              disabled={!product.inStock}
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          {!product.inStock && (
            <p className="text-sm text-muted-foreground mt-4">
              This product is currently out of stock. Check back later for availability.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
