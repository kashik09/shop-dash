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
import { Product } from '@/types'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api'

export function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    inStock: true,
    image: '',
    description: '',
  })
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch {
      // Fallback demo data
      setProducts([
        { id: 1, name: 'Laptop', price: '$999', inStock: true },
        { id: 2, name: 'Phone', price: '$699', inStock: false },
        { id: 3, name: 'Tablet', price: '$499', inStock: true },
        { id: 4, name: 'Monitor', price: '$299', inStock: true },
        { id: 5, name: 'Keyboard', price: '$79', inStock: false },
      ])
    } finally {
      setLoading(false)
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
      // Convert to base64 for preview and storage
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
      // Fallback: update local state
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

  const inStockCount = products.filter((p) => p.inStock).length
  const outOfStockCount = products.length - inStockCount

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products</p>
          </div>
        </div>

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

                {/* Upload Zone */}
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

                {/* Uploaded File Chip */}
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

                {/* OR Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* URL Input */}
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

                {/* Image Preview */}
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
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
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
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
    </div>
  )
}
