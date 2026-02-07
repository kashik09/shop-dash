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
import { fetchFlutterwaveStatus, fetchMyPreferences, fetchShippingRates, startFlutterwaveCharge } from '@/lib/api'
import { ShippingRate, formatPrice } from '@/types'

export function Checkout() {
  const CHECKOUT_STORAGE_KEY = 'checkout_draft'
  const readDraft = () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const draft = readDraft()
  const { items, total, itemCount } = useCart()
  const { user } = useAuth()
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedLocation, setSelectedLocation] = useState(draft?.selectedLocation || '')
  const [shippingFee, setShippingFee] = useState(0)
  const [customerName, setCustomerName] = useState(draft?.customerName || '')
  const [receiverName, setReceiverName] = useState(draft?.receiverName || '')
  const [receiverPhone, setReceiverPhone] = useState(draft?.receiverPhone || '')
  const [deliveryNote, setDeliveryNote] = useState(draft?.deliveryNote || '')
  const [customerPhone, setCustomerPhone] = useState(draft?.customerPhone || '')
  const [paymentNetwork, setPaymentNetwork] = useState(draft?.paymentNetwork || 'MTN')
  const [paymentReady, setPaymentReady] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [prefLoaded, setPrefLoaded] = useState(false)

  useEffect(() => {
    loadShippingRates()
  }, [])

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const status = await fetchFlutterwaveStatus()
        setPaymentReady(Boolean(status?.enabled))
      } catch {
        setPaymentReady(false)
      }
    }

    loadPayments()
  }, [])

  useEffect(() => {
    if (!user) return

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
          if (!selectedLocation && data.shipping.location) {
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
      if (!selectedLocation && data.length > 0) {
        setSelectedLocation(data[0].location)
      }
    } catch {
      const fallback = [
        { id: 1, location: 'Kampala', fee: 0 },
        { id: 2, location: 'Entebbe', fee: 5000 },
        { id: 3, location: 'Jinja', fee: 8000 },
      ]
      setShippingRates(fallback)
      if (!selectedLocation) {
        setSelectedLocation(fallback[0].location)
      }
    }
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
  }

  useEffect(() => {
    if (!selectedLocation) return
    const rate = shippingRates.find((r) => r.location === selectedLocation)
    setShippingFee(rate?.fee || 0)
  }, [shippingRates, selectedLocation])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const payload = {
      customerName,
      customerPhone,
      receiverName,
      receiverPhone,
      deliveryNote,
      selectedLocation,
      paymentNetwork,
    }
    try {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Ignore storage errors
    }
  }, [
    customerName,
    customerPhone,
    receiverName,
    receiverPhone,
    deliveryNote,
    selectedLocation,
    paymentNetwork,
  ])

  const handlePayment = async () => {
    setPaymentError('')
    setPaymentNote('')

    if (!paymentReady) {
      setPaymentError('Mobile Money payments are not ready yet.')
      return
    }

    if (!customerName.trim()) {
      setPaymentError('Please add your full name before paying.')
      return
    }

    if (!customerPhone.trim()) {
      setPaymentError('Please add a valid phone number before paying.')
      return
    }

    if (!selectedLocation) {
      setPaymentError('Please choose a delivery location before paying.')
      return
    }

    setPaymentLoading(true)
    try {
      const response = await startFlutterwaveCharge({
        amount: grandTotal,
        phone: customerPhone,
        network: paymentNetwork,
        customerName,
        meta: {
          location: selectedLocation,
          receiverName: receiverName || null,
          receiverPhone: receiverPhone || null,
          note: deliveryNote || null,
        },
      })

      const nextAction = response?.data?.next_action
      if (nextAction?.type === 'redirect_url' && nextAction?.redirect_url?.url) {
        window.location.href = nextAction.redirect_url.url
        return
      }

      const instruction =
        nextAction?.payment_instruction?.note ||
        'Check your phone for a Mobile Money prompt to approve the payment.'
      setPaymentNote(instruction)
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment could not be started.')
    } finally {
      setPaymentLoading(false)
    }
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
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="+256 700 000 000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="pt-2 border-t border-border/60 space-y-4">
                <div>
                  <Label>Receiver Details (optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Use this if someone else will receive the delivery.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">Receiver Name</Label>
                    <Input
                      id="receiverName"
                      placeholder="Receiver full name"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiverPhone">Receiver Phone</Label>
                    <Input
                      id="receiverPhone"
                      placeholder="+256 700 000 000"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryNote">Delivery Note</Label>
                  <textarea
                    id="deliveryNote"
                    placeholder="Anything the rider should know?"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
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
              <div className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentNetwork">Mobile Money Network</Label>
                  <Select value={paymentNetwork} onValueChange={setPaymentNetwork}>
                    <SelectTrigger id="paymentNetwork">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!paymentReady && (
                  <p className="text-sm text-muted-foreground">
                    Mobile Money payments will show here once setup is complete.
                  </p>
                )}
                {paymentError && (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {paymentError}
                  </p>
                )}
                {paymentNote && (
                  <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {paymentNote}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                disabled={!paymentReady || paymentLoading}
                onClick={handlePayment}
              >
                {paymentLoading ? 'Starting payment...' : 'Pay with Mobile Money'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
