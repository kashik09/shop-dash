import { useState, useEffect } from 'react'
import { Filter, FilterX, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductList } from '@/components/ProductList'
import { Product } from '@/types'
import { fetchProducts } from '@/lib/api'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
      setError(null)
    } catch {
      setError('Failed to load products. Check your API URL or make sure the API server is running.')
      // Fallback to demo data
      setProducts([
        {
          id: 1,
          name: 'Laptop',
          price: 999000,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
        },
        {
          id: 2,
          name: 'Phone',
          price: 699000,
          inStock: false,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
        },
        {
          id: 3,
          name: 'Tablet',
          price: 499000,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
        },
        {
          id: 4,
          name: 'Monitor',
          price: 299000,
          inStock: true,
          image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
        },
        {
          id: 5,
          name: 'Keyboard',
          price: 79000,
          inStock: false,
          image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products
    .filter((p) => !showInStockOnly || p.inStock)
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const inStockCount = products.filter((p) => p.inStock).length
  const outOfStockCount = products.length - inStockCount

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <p className="text-muted-foreground">
          Browse our collection of quality products
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {products.length} Total
        </Badge>
        <Badge variant="success" className="text-sm py-1 px-3">
          {inStockCount} In Stock
        </Badge>
        <Badge variant="destructive" className="text-sm py-1 px-3">
          {outOfStockCount} Out of Stock
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          variant={showInStockOnly ? 'default' : 'outline'}
          onClick={() => setShowInStockOnly(!showInStockOnly)}
          className="gap-2"
        >
          {showInStockOnly ? (
            <>
              <FilterX className="h-4 w-4" />
              Show All
            </>
          ) : (
            <>
              <Filter className="h-4 w-4" />
              In Stock Only
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProductList
          products={filteredProducts}
          isFiltered={showInStockOnly || searchQuery.length > 0}
        />
      )}
    </div>
  )
}
