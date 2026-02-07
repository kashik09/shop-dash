import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { fetchAdminData } from '@/lib/api'

const datasets = [
  { id: 'users', label: 'Users' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'shipping', label: 'Shipping Rates' },
  { id: 'settings', label: 'Settings' },
  { id: 'consents', label: 'Cookie Consents' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'admin-alerts', label: 'Admin Alerts' },
  { id: 'admins', label: 'Admins' },
]

export function DataViewer() {
  const [dataset, setDataset] = useState(datasets[0].id)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeLabel = useMemo(
    () => datasets.find((item) => item.id === dataset)?.label || dataset,
    [dataset]
  )

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await fetchAdminData(dataset)
      setData(payload)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dataset])

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${dataset}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Read-only Data</h2>
        <p className="text-sm text-muted-foreground">
          Browse and export records stored in the server JSON files.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dataset</CardTitle>
          <CardDescription>Select what you want to inspect.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {datasets.map((item) => (
            <Button
              key={item.id}
              variant={item.id === dataset ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataset(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{activeLabel}</CardTitle>
            <CardDescription>
              {loading ? 'Loading latest records…' : 'Showing current snapshot'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={!data || loading}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && (
            <pre className="max-h-[520px] overflow-auto rounded-lg border bg-background p-4 text-xs">
              {loading ? 'Loading...' : JSON.stringify(data ?? {}, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
