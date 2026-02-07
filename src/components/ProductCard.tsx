import { Package, ShoppingCart, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product, formatPrice } from '@/types'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface ProductCardProps {
  product: Product
  onRemove?: (id: number) => void
  showAdminActions?: boolean
}

export function ProductCard({ product, onRemove, showAdminActions = false }: ProductCardProps) {
  const { addToCart } = useCart()
  const isOutOfStock = !product.inStock

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        isOutOfStock && 'opacity-75'
      )}
    >
      <CardHeader className="p-0">
        {product.image ? (
          <div className="h-40 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className={cn(
                'h-full w-full object-cover transition-transform group-hover:scale-110',
                isOutOfStock && 'grayscale'
              )}
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-40 items-center justify-center',
              isOutOfStock
                ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                : 'bg-gradient-to-br from-primary to-sky-600'
            )}
          >
            <Package className="h-16 w-16 text-white/80 transition-transform group-hover:scale-110" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p
          className={cn(
            'text-2xl font-bold mb-3',
            isOutOfStock ? 'text-muted-foreground' : 'text-primary'
          )}
        >
          {formatPrice(product.price)}
        </p>
        <Badge variant={product.inStock ? 'success' : 'destructive'} className="gap-1">
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
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1 gap-2"
          disabled={isOutOfStock}
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
        {showAdminActions && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
