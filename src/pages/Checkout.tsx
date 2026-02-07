import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Package, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { fetchMyPreferences, fetchShippingRates } from '@/lib/api'
import { ShippingRate, formatPrice } from '@/types'

export function Checkout() {
  const { items, total, itemCount } = useCart()
  const { user } = useAuth()
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [prefLoaded, setPrefLoaded] = useState(false)

  const paymentReady = false

  useEffect(() => {
    loadShippingRates()
  }, [])

  useEffect(() => {
    if (!user) return

    setCustomerEmail((prev) => prev || user.email || '')
    setCustomerName((prev) => prev || user.name || '')
    setCustomerPhone((prev) => prev || user.phone || '')
  }, [user])

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await fetchMyPreferences()
        if (data?.shipping) {
          setCustomerName((prev) => prev || data.shipping.name || '')
          setCustomerPhone((prev) => prev || data.shipping.phone || '')
          if (data.shipping.location) {
            setSelectedLocation(data.shipping.location)
          }
        }
      } catch {
        // Ignore preference errors for now
      } finally {
        setPrefLoaded(true)
      }
    }

    if (!prefLoaded) {
      loadPreferences()
    }
  }, [prefLoaded])

  const loadShippingRates = async () => {
    try {
      const data = await fetchShippingRates()
      setShippingRates(data)
      if (data.length > 0) {
        setSelectedLocation(data[0].location)
        setShippingFee(data[0].fee)
      }
    } catch {
      const fallback = [
        { id: 1, location: 'Kampala', fee: 0 },
        { id: 2, location: 'Entebbe', fee: 5000 },
        { id: 3, location: 'Jinja', fee: 8000 },
      ]
      setShippingRates(fallback)
      setSelectedLocation(fallback[0].location)
      setShippingFee(fallback[0].fee)
    }
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    const rate = shippingRates.find((r) => r.location === location)
    setShippingFee(rate?.fee || 0)
  }

  const grandTotal = total + shippingFee

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before checking out.
          </p>
          <div className="flex justify-center gap-2">
            <Link to="/products">
              <Button variant="outline">Browse Products</Button>
            </Link>
            <Link to="/cart">
              <Button>Back to Cart</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">{itemCount} items ready for delivery</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="+256 700 000 000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Choose delivery area
              </Label>
              <Select value={selectedLocation} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {shippingRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.location}>
                      {rate.location} {rate.fee === 0 ? '(Free)' : `(${formatPrice(rate.fee)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>{formatPrice(shippingFee)}</span>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
              {!paymentReady && (
                <p className="text-sm text-muted-foreground">
                  Flutterwave direct API checkout will be enabled once keys are added.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={!paymentReady}>
                Pay with Mobile Money
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
