import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { upsertCookieConsent } from '@/lib/api'

const CONSENT_STATUS_KEY = 'cookie_consent_status'
const CONSENT_ID_KEY = 'cookie_consent_id'

const getStoredValue = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const setStoredValue = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage failures (private mode, disabled storage, etc.)
  }
}

const getOrCreateConsentId = () => {
  const existing = getStoredValue(CONSENT_ID_KEY)
  if (existing) return existing

  const fallbackId = `consent_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : fallbackId

  setStoredValue(CONSENT_ID_KEY, generated)
  return generated
}

const setConsentCookie = (key: string, value: string) => {
  document.cookie = `${key}=${value}; Max-Age=31536000; Path=/; SameSite=Lax`
}

export function CookieConsentBanner() {
  const { settings, loading } = useSettings()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return

    const cookiesEnabled = settings?.cookies?.enabled ?? true
    const requireConsent = settings?.cookies?.requireConsent ?? true
    const status = getStoredValue(CONSENT_STATUS_KEY)

    setVisible(Boolean(cookiesEnabled && requireConsent && !status))
  }, [loading, settings])

  const handleChoice = async (status: 'accepted' | 'declined') => {
    setSaving(true)

    const consentId = getOrCreateConsentId()
    setStoredValue(CONSENT_STATUS_KEY, status)
    setConsentCookie('cookie_consent', status)
    setConsentCookie('cookie_consent_id', consentId)

    try {
      await upsertCookieConsent({
        consentId,
        status,
        email: user?.email ?? null,
      })
    } catch (err) {
      console.error('Failed to store cookie consent:', err)
    } finally {
      setSaving(false)
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-lg border bg-background p-4 shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to remember your preferences and improve your experience. You can update
          your choice at any time.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleChoice('declined')} disabled={saving}>
            Decline
          </Button>
          <Button onClick={() => handleChoice('accepted')} disabled={saving}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
