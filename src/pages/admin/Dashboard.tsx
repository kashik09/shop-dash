import { useState, useEffect } from 'react'
import { Package, TrendingUp, TrendingDown, Truck, ShoppingBag, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchProducts, fetchShippingRates } from '@/lib/api'
import { Product, ShippingRate } from '@/types'

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, shippingData] = await Promise.all([
        fetchProducts(),
        fetchShippingRates(),
      ])
      setProducts(productsData)
      setShippingRates(shippingData)
    } catch {
      // Fallback data
      setProducts([])
      setShippingRates([])
    } finally {
      setLoading(false)
    }
  }

  const inStockCount = products.filter((p) => p.inStock).length
  const outOfStockCount = products.length - inStockCount

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-foreground',
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600',
    },
    {
      title: 'In Stock',
      value: inStockCount,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600',
    },
    {
      title: 'Shipping Zones',
      value: shippingRates.length,
      icon: Truck,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600',
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent orders</p>
              <p className="text-sm">Orders will appear here when customers make purchases</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sales data yet</p>
              <p className="text-sm">Revenue stats will appear once you start selling</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
