import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
