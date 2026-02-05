import { SearchX } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { Product } from '@/types'

interface ProductListProps {
  products: Product[]
  onRemove?: (id: number) => void
  showAdminActions?: boolean
  isFiltered?: boolean
}

export function ProductList({
  products,
  onRemove,
  showAdminActions = false,
  isFiltered = false,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <SearchX className="h-16 w-16 mb-4" />
        <p className="text-lg">
          {isFiltered
            ? 'No products match the current filter.'
            : 'No products available.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
        >
          <ProductCard
            product={product}
            onRemove={onRemove}
            showAdminActions={showAdminActions}
          />
        </div>
      ))}
    </div>
  )
}
