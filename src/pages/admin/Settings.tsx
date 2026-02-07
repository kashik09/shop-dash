import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  fetchSettings,
  updateStoreSettings,
  updateNotificationSettings,
  updateCookieSettings,
  StoreSettings,
} from '@/lib/api'
import { useSettings } from '@/context/SettingsContext'

export function AdminSettings() {
  const { refresh } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await fetchSettings()
      setSettings({
        ...data,
        cookies: data.cookies ?? { enabled: true, requireConsent: true },
      })
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStore = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateStoreSettings(settings.store)
      await refresh()
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateNotificationSettings(settings.notifications)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCookies = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateCookieSettings(settings.cookies)
    } catch (err) {
      console.error('Failed to save cookies:', err)
    } finally {
      setSaving(false)
    }
  }

  const updateStore = (field: string, value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      store: { ...settings.store, [field]: value },
    })
  }

  const updateTax = (field: string, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      tax: { ...settings.tax, [field]: value },
    })
  }

  const updateNotification = (field: string, value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [field]: value },
    })
  }

  const updateCookies = (field: string, value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      cookies: { ...settings.cookies, [field]: value },
    })
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your store</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic details about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.store.name}
                  onChange={(e) => updateStore('name', e.target.value)}
                  placeholder="Your Store Name"
                />
                <p className="text-xs text-muted-foreground">
                  This name appears in the header and footer
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email or Phone</Label>
                <Input
                  id="email"
                  type="text"
                  value={settings.store.email}
                  onChange={(e) => updateStore('email', e.target.value)}
                  placeholder="+256 700 000 000 or contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.store.phone}
                  onChange={(e) => updateStore('phone', e.target.value)}
                  placeholder="+256 700 000 000"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.store.address}
                  onChange={(e) => updateStore('address', e.target.value)}
                  placeholder="Kampala, Uganda"
                />
              </div>
            </div>
            <Button onClick={handleSaveStore} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure VAT and tax rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Tax</Label>
                <p className="text-sm text-muted-foreground">Apply tax to orders</p>
              </div>
              <Switch
                checked={settings.tax.enabled}
                onCheckedChange={(checked) => updateTax('enabled', checked)}
              />
            </div>
            {settings.tax.enabled && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxName">Tax Name</Label>
                    <Input
                      id="taxName"
                      value={settings.tax.name}
                      onChange={(e) => updateTax('name', e.target.value)}
                      placeholder="VAT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.tax.rate}
                      onChange={(e) => updateTax('rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tax Included in Price</Label>
                    <p className="text-sm text-muted-foreground">Prices already include tax</p>
                  </div>
                  <Switch
                    checked={settings.tax.includeInPrice}
                    onCheckedChange={(checked) => updateTax('includeInPrice', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable email notifications</p>
              </div>
              <Switch
                checked={settings.notifications.emailEnabled}
                onCheckedChange={(checked) => updateNotification('emailEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Confirmation</Label>
                <p className="text-sm text-muted-foreground">Send confirmation when order is placed</p>
              </div>
              <Switch
                checked={settings.notifications.orderConfirmation}
                onCheckedChange={(checked) => updateNotification('orderConfirmation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Shipping Updates</Label>
                <p className="text-sm text-muted-foreground">Send updates when order ships</p>
              </div>
              <Switch
                checked={settings.notifications.shippingUpdates}
                onCheckedChange={(checked) => updateNotification('shippingUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when products are low</p>
              </div>
              <Switch
                checked={settings.notifications.lowStockAlert}
                onCheckedChange={(checked) => updateNotification('lowStockAlert', checked)}
              />
            </div>
            <Button onClick={handleSaveNotifications} disabled={saving} className="gap-2 sm:col-span-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Notifications
            </Button>
          </CardContent>
        </Card>

        {/* Cookie Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Controls</CardTitle>
            <CardDescription>Manage cookie usage and consent banner</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Cookies</Label>
                <p className="text-sm text-muted-foreground">Allow the site to set cookies</p>
              </div>
              <Switch
                checked={settings.cookies.enabled}
                onCheckedChange={(checked) => updateCookies('enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Consent</Label>
                <p className="text-sm text-muted-foreground">Show consent banner before storing cookies</p>
              </div>
              <Switch
                checked={settings.cookies.requireConsent}
                onCheckedChange={(checked) => updateCookies('requireConsent', checked)}
              />
            </div>
            <Button onClick={handleSaveCookies} disabled={saving} className="gap-2 sm:col-span-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Cookie Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
