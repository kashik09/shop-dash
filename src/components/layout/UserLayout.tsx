import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Settings, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

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

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path) && path !== '/dashboard'
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-card border-r flex flex-col fixed h-full">
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg">ShopDash</span>
            <span className="text-xs text-muted-foreground block -mt-1">Account</span>
          </div>
        </div>

        <div className="px-6 py-4 border-b">
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

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.exact
              ? location.pathname === item.path
              : isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full justify-start gap-3" onClick={signOut}>
            Sign Out
          </Button>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              Back to Store
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
