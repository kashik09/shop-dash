import { Link } from 'react-router-dom'
import { ShoppingBag, Settings, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

export function UserDashboard() {
  const { user } = useAuth()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
        <p className="text-muted-foreground">
          Track your orders and update your shopping preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            View recent orders, delivery status, and receipts.
            <div className="mt-4">
              <Link to="/dashboard/orders" className="text-primary hover:underline">
                View orders
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set your notification preferences and default delivery info.
            <div className="mt-4">
              <Link to="/dashboard/preferences" className="text-primary hover:underline">
                Manage preferences
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Keep your phone number and delivery address updated so our couriers can reach you quickly.
        </CardContent>
      </Card>
    </div>
  )
}
