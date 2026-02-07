import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LayoutDashboard, ShoppingBag, Settings, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { buildDocumentTitle } from '@/lib/pageTitle'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { path: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/dashboard/preferences', icon: Settings, label: 'Preferences' },
]

interface UserLayoutProps {
  children: React.ReactNode
}

export function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { storeName } = useSettings()

  useEffect(() => {
    const siteName = storeName || 'ShopDash'
    document.title = buildDocumentTitle(location.pathname, siteName)
  }, [location.pathname, storeName])

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path) && path !== '/dashboard'
  }

  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <aside className="w-full bg-card border-b md:border-b-0 md:border-r md:w-64 md:fixed md:h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-4 md:h-16 md:px-6 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg">ShopDash</span>
            <span className="text-xs text-muted-foreground block -mt-1">Account</span>
          </div>
        </div>

        <div className="px-4 py-3 md:px-6 md:py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Account'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || user?.phone || 'Signed in'}
              </p>
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-3 gap-2 p-4 md:flex md:flex-1 md:flex-col md:space-y-1 md:gap-0">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.exact
              ? location.pathname === item.path
              : isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t grid grid-cols-2 gap-2 md:space-y-2 md:grid-cols-1">
          <Button variant="outline" className="w-full justify-center md:justify-start gap-2" onClick={signOut}>
            Sign Out
          </Button>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-center md:justify-start gap-2">
              Back to Store
            </Button>
          </Link>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        {children}
      </main>
    </div>
  )
}
