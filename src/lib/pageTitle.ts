const titleMap = new Map<string, string>([
  ['/', 'Home'],
  ['/products', 'Products'],
  ['/cart', 'Cart'],
  ['/checkout', 'Checkout'],
  ['/login', 'Sign In'],
  ['/signup', 'Create Account'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Use'],
  ['/payments', 'Payments'],
  ['/dashboard', 'Dashboard'],
  ['/dashboard/orders', 'Order History'],
  ['/dashboard/preferences', 'Preferences'],
  ['/admin/login', 'Admin Sign In'],
  ['/admin', 'Admin Dashboard'],
  ['/admin/products', 'Admin Products'],
  ['/admin/shipping', 'Admin Shipping'],
  ['/admin/orders', 'Admin Orders'],
  ['/admin/settings', 'Admin Settings'],
  ['/admin-data', 'Admin Data Viewer'],
])

export const getPageTitle = (pathname: string) => {
  if (titleMap.has(pathname)) {
    return titleMap.get(pathname) || null
  }

  if (pathname.startsWith('/products/')) {
    return 'Product Details'
  }

  return null
}

export const buildDocumentTitle = (pathname: string, storeName: string) => {
  const pageTitle = getPageTitle(pathname)
  if (!pageTitle) return storeName
  return `${storeName} | ${pageTitle}`
}
