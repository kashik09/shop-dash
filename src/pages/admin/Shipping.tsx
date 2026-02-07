import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShippingRate } from '@/types'
import {
  fetchShippingRates,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
} from '@/lib/api'

export function AdminShipping() {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [formData, setFormData] = useState({ location: '', fee: 0 })

  useEffect(() => {
    loadShippingRates()
  }, [])

  const loadShippingRates = async () => {
    try {
      setLoading(true)
      const data = await fetchShippingRates()
      setShippingRates(data)
    } catch {
      setShippingRates([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (rate?: ShippingRate) => {
    if (rate) {
      setEditingRate(rate)
      setFormData({ location: rate.location, fee: rate.fee })
    } else {
      setEditingRate(null)
      setFormData({ location: '', fee: 0 })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingRate) {
        const updated = await updateShippingRate(editingRate.id, formData)
        setShippingRates((prev) =>
          prev.map((r) => (r.id === editingRate.id ? updated : r))
        )
      } else {
        const created = await createShippingRate(formData)
        setShippingRates((prev) => [...prev, created])
      }
    } catch {
      if (editingRate) {
        setShippingRates((prev) =>
          prev.map((r) => (r.id === editingRate.id ? { ...r, ...formData } : r))
        )
      } else {
        const newId = Math.max(...shippingRates.map((r) => r.id), 0) + 1
        setShippingRates((prev) => [...prev, { id: newId, ...formData }])
      }
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteShippingRate(id)
    } catch {
      // Continue
    }
    setShippingRates((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shipping</h1>
          <p className="text-muted-foreground">Manage shipping rates by location</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRate ? 'Edit Shipping Rate' : 'Add Shipping Location'}
              </DialogTitle>
              <DialogDescription>
                {editingRate
                  ? 'Update the shipping rate for this location.'
                  : 'Add a new shipping location and fee.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Kampala, Entebbe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Shipping Fee (UGX)</Label>
                <Input
                  id="fee"
                  type="number"
                  min="0"
                  value={formData.fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fee: Number(e.target.value) }))}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Enter 0 for free shipping</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingRate ? 'Save Changes' : 'Add Location'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shippingRates.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No shipping zones</h3>
              <p className="text-sm text-muted-foreground">Add locations to set shipping rates</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Shipping Fee</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRates.map((rate) => (
                    <tr key={rate.id} className="border-b last:border-0 hover:bg-muted/30">
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
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rate)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(rate.id)}
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
