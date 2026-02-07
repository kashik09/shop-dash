import { ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function AdminOrders() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              When customers place orders, they will appear here for you to manage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
