import { Link, useLocation } from 'react-router-dom'
import { Database, ExternalLink, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/context/AdminAuthContext'

interface DataLayoutProps {
  children: React.ReactNode
}

export function DataLayout({ children }: DataLayoutProps) {
  const location = useLocation()
  const { admin, signOut } = useAdminAuth()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Data Room</p>
              <h1 className="text-lg font-semibold">Admin Data Viewer</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {admin && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                Signed in as <span className="text-foreground">{admin.name}</span>
              </div>
            )}
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Back to Admin
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                Store <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
