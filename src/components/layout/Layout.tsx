import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner'
import { useSettings } from '@/context/SettingsContext'
import { buildDocumentTitle } from '@/lib/pageTitle'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { storeName } = useSettings()

  useEffect(() => {
    const siteName = storeName || 'ShopDash'
    document.title = buildDocumentTitle(location.pathname, siteName)
  }, [location.pathname, storeName])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsentBanner />
    </div>
  )
}
