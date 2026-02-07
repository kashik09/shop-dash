import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { CartProvider } from '@/context/CartContext'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { Admin } from '@/pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <Routes>
            {/* Store Routes */}
            <Route element={<Layout><Home /></Layout>} path="/" />
            <Route element={<Layout><Products /></Layout>} path="/products" />
            <Route element={<Layout><ProductDetail /></Layout>} path="/products/:id" />
            <Route element={<Layout><Cart /></Layout>} path="/cart" />

            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminLayout><Admin /></AdminLayout>} />
          </Routes>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
