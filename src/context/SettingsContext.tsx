import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchSettings, StoreSettings } from '@/lib/api'

interface SettingsContextType {
  settings: StoreSettings | null
  loading: boolean
  refresh: () => Promise<void>
  storeName: string
}

const defaultSettings: StoreSettings = {
  store: {
    name: 'ShopDash',
    email: '',
    phone: '',
    currency: 'UGX',
    country: 'Uganda',
    address: '',
  },
  tax: {
    enabled: true,
    name: 'VAT',
    rate: 18,
    includeInPrice: false,
  },
  notifications: {
    emailEnabled: true,
    lowStockAlert: true,
    orderConfirmation: true,
    shippingUpdates: true,
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      const data = await fetchSettings()
      setSettings(data)
    } catch {
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const storeName = settings?.store?.name || 'ShopDash'

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: loadSettings, storeName }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
