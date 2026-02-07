import { ReactNode, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner'
import { useSettings } from '@/context/SettingsContext'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { storeName } = useSettings()

  useEffect(() => {
    document.title = storeName || 'ShopDash'
  }, [storeName])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsentBanner />
    </div>
  )
}
