import { useEffect, useState } from 'react'
import { Save, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { fetchMyPreferences, updateMyPreferences } from '@/lib/api'
import { useTheme } from '@/context/ThemeContext'

const defaultPreferences = {
  theme: 'dark',
  notifications: {
    orderUpdates: true,
    shippingUpdates: true,
    marketing: false,
  },
  shipping: {
    name: '',
    phone: '',
    location: '',
    address: '',
  },
  marketingOptIn: false,
}

export function UserPreferences() {
  const { theme, toggleTheme } = useTheme()
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyPreferences()
        const merged = { ...defaultPreferences, ...data }
        setPreferences(merged)
        if (merged.theme && merged.theme !== theme) {
          toggleTheme()
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const updateNotifications = (field: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }))
  }

  const updateShipping = (field: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateMyPreferences(preferences)
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">Loading preferences...</div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">Manage your theme, notifications, and delivery defaults.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Choose how the dashboard looks.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Current: {theme}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark'
                toggleTheme()
                setPreferences((prev) => ({ ...prev, theme: nextTheme }))
              }}
            >
              Toggle Theme
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control when we send updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">Get updates when orders are confirmed.</p>
              </div>
              <Switch
                checked={preferences.notifications.orderUpdates}
                onCheckedChange={(checked) => updateNotifications('orderUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Shipping Updates</Label>
                <p className="text-sm text-muted-foreground">Receive delivery status alerts.</p>
              </div>
              <Switch
                checked={preferences.notifications.shippingUpdates}
                onCheckedChange={(checked) => updateNotifications('shippingUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Messages</Label>
                <p className="text-sm text-muted-foreground">Occasional promos and offers.</p>
              </div>
              <Switch
                checked={preferences.notifications.marketing}
                onCheckedChange={(checked) => updateNotifications('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Shipping Details</CardTitle>
            <CardDescription>Speed up checkout with saved info.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipName">Full Name</Label>
              <Input
                id="shipName"
                value={preferences.shipping.name}
                onChange={(e) => updateShipping('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipPhone">Phone Number</Label>
              <Input
                id="shipPhone"
                value={preferences.shipping.phone}
                onChange={(e) => updateShipping('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipLocation">Location</Label>
              <Input
                id="shipLocation"
                value={preferences.shipping.location}
                onChange={(e) => updateShipping('location', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="shipAddress">Address</Label>
              <Input
                id="shipAddress"
                value={preferences.shipping.address}
                onChange={(e) => updateShipping('address', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between sm:col-span-2">
              <div>
                <Label>Marketing Opt-in</Label>
                <p className="text-sm text-muted-foreground">Stay in the loop.</p>
              </div>
              <Switch
                checked={preferences.marketingOptIn}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketingOptIn: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-fit gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
