import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Upload,
  FileImage,
  X,
  Link as LinkIcon,
  Truck,
  MapPin,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, ShippingRate } from '@/types'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchShippingRates,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
} from '@/lib/api'

export function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [shippingLoading, setShippingLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingShippingRate, setEditingShippingRate] = useState<ShippingRate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    inStock: true,
    image: '',
    description: '',
  })
  const [shippingFormData, setShippingFormData] = useState({
    location: '',
    fee: 0,
  })
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
    loadShippingRates()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch {
      setProducts([
        { id: 1, name: 'Laptop', price: '$999', inStock: true },
        { id: 2, name: 'Phone', price: '$699', inStock: false },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadShippingRates = async () => {
    try {
      setShippingLoading(true)
      const data = await fetchShippingRates()
      setShippingRates(data)
    } catch {
      setShippingRates([
        { id: 1, location: 'Nairobi', fee: 0 },
        { id: 2, location: 'Mombasa', fee: 500 },
      ])
    } finally {
      setShippingLoading(false)
    }
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price,
        inStock: product.inStock,
        image: product.image || '',
        description: product.description || '',
      })
      setUploadedFileName(null)
    } else {
      setEditingProduct(null)
      setFormData({ name: '', price: '', inStock: true, image: '', description: '' })
      setUploadedFileName(null)
    }
    setDialogOpen(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFileName(null)
    setFormData((prev) => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData)
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        )
      } else {
        const created = await createProduct(formData)
        setProducts((prev) => [...prev, created])
      }
    } catch {
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...formData } : p
          )
        )
      } else {
        const newId = Math.max(...products.map((p) => p.id), 0) + 1
        setProducts((prev) => [...prev, { id: newId, ...formData }])
      }
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
    } catch {
      // Continue with local delete
    }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggleStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock })
    } catch {
      // Continue with local update
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, inStock: !p.inStock } : p
      )
    )
  }

  // Shipping Rate Handlers
  const handleOpenShippingDialog = (rate?: ShippingRate) => {
    if (rate) {
      setEditingShippingRate(rate)
      setShippingFormData({
        location: rate.location,
        fee: rate.fee,
      })
    } else {
      setEditingShippingRate(null)
      setShippingFormData({ location: '', fee: 0 })
    }
    setShippingDialogOpen(true)
  }

  const handleShippingSubmit = async () => {
    try {
      if (editingShippingRate) {
        const updated = await updateShippingRate(editingShippingRate.id, shippingFormData)
        setShippingRates((prev) =>
          prev.map((r) => (r.id === editingShippingRate.id ? updated : r))
        )
      } else {
        const created = await createShippingRate(shippingFormData)
        setShippingRates((prev) => [...prev, created])
      }
    } catch {
      if (editingShippingRate) {
        setShippingRates((prev) =>
          prev.map((r) =>
            r.id === editingShippingRate.id ? { ...r, ...shippingFormData } : r
          )
        )
      } else {
        const newId = Math.max(...shippingRates.map((r) => r.id), 0) + 1
        setShippingRates((prev) => [...prev, { id: newId, ...shippingFormData }])
      }
    }
    setShippingDialogOpen(false)
  }

  const handleDeleteShippingRate = async (id: number) => {
    try {
      await deleteShippingRate(id)
    } catch {
      // Continue with local delete
    }
    setShippingRates((prev) => prev.filter((r) => r.id !== id))
  }

  const inStockCount = products.filter((p) => p.inStock).length
  const outOfStockCount = products.length - inStockCount

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shipping Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{shippingRates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct
                        ? 'Update the product details below.'
                        : 'Fill in the details for the new product.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="$99.99"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Product Image</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-emerald-400 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                        <p className="text-sm">
                          <span className="text-emerald-600 font-medium">Click to upload</span>
                          {' '}your image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                      {uploadedFileName && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                          <FileImage className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm truncate flex-1">{uploadedFileName}</span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          Image URL
                        </Label>
                        <Input
                          id="image"
                          value={uploadedFileName ? '' : formData.image}
                          onChange={(e) => {
                            setUploadedFileName(null)
                            setFormData((prev) => ({ ...prev, image: e.target.value }))
                          }}
                          placeholder="https://example.com/image.jpg"
                          disabled={!!uploadedFileName}
                        />
                      </div>
                      {formData.image && (
                        <div className="mt-2 relative h-24 w-24 rounded-lg overflow-hidden border">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Product description"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="inStock">In Stock</Label>
                      <Switch
                        id="inStock"
                        checked={formData.inStock}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, inStock: checked }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingProduct ? 'Save Changes' : 'Add Product'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Product</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    product.inStock
                                      ? 'bg-gradient-to-br from-primary to-sky-600'
                                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  }`}
                                >
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold">{product.price}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStock(product)}
                              className="cursor-pointer"
                            >
                              <Badge
                                variant={product.inStock ? 'success' : 'destructive'}
                                className="gap-1"
                              >
                                {product.inStock ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    In Stock
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    Out of Stock
                                  </>
                                )}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipping Rates</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage shipping fees by location
                </p>
              </div>
              <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => handleOpenShippingDialog()}>
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingShippingRate ? 'Edit Shipping Rate' : 'Add Shipping Location'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingShippingRate
                        ? 'Update the shipping rate for this location.'
                        : 'Add a new shipping location and fee.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={shippingFormData.location}
                        onChange={(e) =>
                          setShippingFormData((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="e.g., Nairobi, Mombasa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fee">Shipping Fee (UGX)</Label>
                      <Input
                        id="fee"
                        type="number"
                        min="0"
                        value={shippingFormData.fee}
                        onChange={(e) =>
                          setShippingFormData((prev) => ({ ...prev, fee: Number(e.target.value) }))
                        }
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter 0 for free shipping
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShippingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleShippingSubmit}>
                      {editingShippingRate ? 'Save Changes' : 'Add Location'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {shippingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Location</th>
                        <th className="text-left py-3 px-4 font-medium">Shipping Fee</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingRates.map((rate) => (
                        <tr key={rate.id} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                                <MapPin className="h-5 w-5 text-sky-600" />
                              </div>
                              <span className="font-medium">{rate.location}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {rate.fee === 0 ? (
                              <Badge variant="success">Free</Badge>
                            ) : (
                              <span className="font-semibold">UGX {rate.fee.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenShippingDialog(rate)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteShippingRate(rate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage customer orders
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  When customers place orders, they will appear here for you to manage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
