import { createContext, useContext, useEffect, useState } from 'react'
import { adminLogin, adminLogout, AdminUser, fetchAdmin } from '@/lib/api'

interface AdminAuthContextType {
  admin: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await fetchAdmin()
      setAdmin(data)
    } catch {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const data = await adminLogin({ email, password })
      setAdmin(data)
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'Admin login failed' }
    }
  }

  const signOut = async () => {
    await adminLogout()
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
