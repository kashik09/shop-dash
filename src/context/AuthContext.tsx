import { createContext, useContext, useEffect, useState } from 'react'
import {
  AuthUser,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signUp: (payload: { name: string; email?: string; phone?: string; password: string }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await fetchCurrentUser()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const signIn = async (identifier: string, password: string) => {
    try {
      const data = await loginUser({ identifier, password })
      setUser(data)
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'Login failed' }
    }
  }

  const signUp = async (payload: { name: string; email?: string; phone?: string; password: string }) => {
    try {
      const data = await registerUser(payload)
      setUser(data)
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'Signup failed' }
    }
  }

  const signOut = async () => {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
