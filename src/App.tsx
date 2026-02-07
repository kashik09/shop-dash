import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataLayout } from '@/components/layout/DataLayout'
import { UserLayout } from '@/components/layout/UserLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireAdmin } from '@/components/auth/RequireAdmin'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { Privacy } from '@/pages/Privacy'
import { Payments } from '@/pages/Payments'
import { Terms } from '@/pages/Terms'
import { UserDashboard, UserOrders, UserPreferences } from '@/pages/dashboard'
import { DataViewer } from '@/pages/data'
import {
  Dashboard,
  AdminProducts,
  AdminShipping,
  AdminOrders,
  AdminSettings,
  AdminLogin,
} from '@/pages/admin'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <CartProvider>
                <Routes>
                  {/* Store Routes */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/products" element={<Layout><Products /></Layout>} />
                  <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                  <Route path="/cart" element={<Layout><Cart /></Layout>} />
                  <Route
                    path="/checkout"
                    element={(
                      <RequireAuth>
                        <Layout><Checkout /></Layout>
                      </RequireAuth>
                    )}
                  />
                  <Route path="/login" element={<Layout><Login /></Layout>} />
                  <Route path="/signup" element={<Layout><SignUp /></Layout>} />
                  <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                  <Route path="/payments" element={<Layout><Payments /></Layout>} />
                  <Route path="/terms" element={<Layout><Terms /></Layout>} />

                  {/* User Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={(
                      <RequireAuth>
                        <UserLayout><UserDashboard /></UserLayout>
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/dashboard/orders"
                    element={(
                      <RequireAuth>
                        <UserLayout><UserOrders /></UserLayout>
                      </RequireAuth>
                    )}
                  />
                  <Route
                    path="/dashboard/preferences"
                    element={(
                      <RequireAuth>
                        <UserLayout><UserPreferences /></UserLayout>
                      </RequireAuth>
                    )}
                  />
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={(
                      <RequireAdmin>
                        <AdminLayout><Dashboard /></AdminLayout>
                      </RequireAdmin>
                    )}
                  />
                  <Route
                    path="/admin/products"
                    element={(
                      <RequireAdmin>
                        <AdminLayout><AdminProducts /></AdminLayout>
                      </RequireAdmin>
                    )}
                  />
                  <Route
                    path="/admin/shipping"
                    element={(
                      <RequireAdmin>
                        <AdminLayout><AdminShipping /></AdminLayout>
                      </RequireAdmin>
                    )}
                  />
                  <Route
                    path="/admin/orders"
                    element={(
                      <RequireAdmin>
                        <AdminLayout><AdminOrders /></AdminLayout>
                      </RequireAdmin>
                    )}
                  />
                  <Route
                    path="/admin/settings"
                    element={(
                      <RequireAdmin>
                        <AdminLayout><AdminSettings /></AdminLayout>
                      </RequireAdmin>
                    )}
                  />
                  <Route
                    path="/admin-data"
                    element={(
                      <RequireAdmin>
                        <DataLayout><DataViewer /></DataLayout>
                      </RequireAdmin>
                    )}
                  />
                </Routes>
              </CartProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
