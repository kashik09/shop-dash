import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingBag,
  Settings,
  Store,
  Moon,
  Sun,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useAdminAuth } from '@/context/AdminAuthContext'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/shipping', icon: Truck, label: 'Shipping' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { admin, signOut } = useAdminAuth()

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path) && path !== '/admin'
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col fixed h-full">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg">ShopDash</span>
            <span className="text-xs text-muted-foreground block -mt-1">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
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

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          {admin && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{admin.name}</span>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                Dark Mode
              </>
            )}
          </Button>

          {/* Back to Store Button */}
          <Link to="/">
            <Button variant="outline" className="w-full justify-start gap-3">
              <ExternalLink className="h-5 w-5" />
              Back to Store
            </Button>
          </Link>
          <Link to="/admin-data">
            <Button variant="outline" className="w-full justify-start gap-3">
              Data Viewer
            </Button>
          </Link>

          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
