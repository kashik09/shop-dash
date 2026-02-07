import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder, fetchShippingRates } from '@/lib/api'
import { loadFlutterwave } from '@/lib/flutterwave'
import { ShippingRate, formatPrice } from '@/types'
import { Input } from '@/components/ui/input'

export function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart()
  const { user } = useAuth()
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    loadShippingRates()
  }, [])

  useEffect(() => {
    if (!user) return

    setCustomerEmail((prev) => prev || user.email || '')
    setCustomerName((prev) => prev || user.user_metadata?.full_name || '')
    setCustomerPhone((prev) => prev || user.phone || '')
  }, [user])

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
  const flutterwaveKey = import.meta.env.VITE_FLW_PUBLIC_KEY

  const canCheckout = Boolean(
    customerName.trim() &&
      customerEmail.trim() &&
      customerPhone.trim() &&
      selectedLocation &&
      grandTotal > 0
  )

  const handleCheckout = async () => {
    setCheckoutError('')

    if (!flutterwaveKey) {
      setCheckoutError('Missing Flutterwave public key. Add VITE_FLW_PUBLIC_KEY to your .env file.')
      return
    }

    if (!canCheckout) {
      setCheckoutError('Please complete your contact details before checkout.')
      return
    }

    setProcessingPayment(true)

    try {
      await loadFlutterwave()
    } catch (err) {
      setProcessingPayment(false)
      setCheckoutError('Unable to load the Flutterwave checkout script.')
      return
    }

    const txRef = `shopdash_${Date.now()}_${Math.random().toString(16).slice(2)}`

    window.FlutterwaveCheckout?.({
      public_key: flutterwaveKey,
      tx_ref: txRef,
      amount: grandTotal,
      currency: 'UGX',
      payment_options: 'mobilemoneyuganda,card',
      customer: {
        email: customerEmail.trim(),
        phone_number: customerPhone.trim(),
        name: customerName.trim(),
      },
      customizations: {
        title: 'ShopDash',
        description: 'Order payment',
      },
      callback: async (response) => {
        try {
          if (response?.status === 'successful') {
            await createOrder({
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerPhone: customerPhone.trim(),
              location: selectedLocation,
              items: items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              subtotal: total,
              shippingFee,
              total: grandTotal,
              payment: {
                provider: 'flutterwave',
                status: response.status,
                transactionId: response.transaction_id,
                txRef,
                chargedAmount: response.charged_amount,
                currency: response.currency,
                processorResponse: response.processor_response,
                raw: response,
              },
            })
            clearCart()
          } else {
            setCheckoutError('Payment was not completed.')
          }
        } catch (err) {
          console.error('Order creation failed:', err)
          setCheckoutError('Payment succeeded but order creation failed.')
        } finally {
          setProcessingPayment(false)
        }
      },
      onclose: () => {
        setProcessingPayment(false)
      },
    })
  }

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
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <ShoppingCart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">{itemCount} items in your cart</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600">
                      <Package className="h-10 w-10 text-white/80" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.id}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive gap-1"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between pt-4">
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Button variant="ghost" className="text-destructive" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
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
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Location
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
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping to {selectedLocation}</span>
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
              {checkoutError && (
                <p className="text-sm text-destructive">{checkoutError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : 'Pay with Mobile Money'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
