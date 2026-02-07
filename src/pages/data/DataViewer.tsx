import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { fetchAdminData, unlockAdminData } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockSeconds, setUnlockSeconds] = useState(0)
  const [showUnlockPassword, setShowUnlockPassword] = useState(false)

  const unlockActive = unlockSeconds > 0
  const previousUnlockSeconds = useRef(0)

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

  useEffect(() => {
    if (!unlockActive) return
    const timer = window.setInterval(() => {
      setUnlockSeconds((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [unlockActive])

  useEffect(() => {
    if (previousUnlockSeconds.current > 0 && unlockSeconds === 0) {
      loadData()
    }
    previousUnlockSeconds.current = unlockSeconds
  }, [unlockSeconds])

  const handleUnlock = async () => {
    setUnlockError('')
    if (!unlockPassword.trim()) {
      setUnlockError('Password is required')
      return
    }
    setUnlocking(true)
    try {
      await unlockAdminData({ password: unlockPassword })
      setUnlockSeconds(15)
      setUnlockPassword('')
      await loadData()
    } catch (err: any) {
      setUnlockError(err.message || 'Failed to unlock data')
    } finally {
      setUnlocking(false)
    }
  }

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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
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
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Sensitive data is masked</p>
            <p className="text-xs text-muted-foreground">
              Unlock full values for 15 seconds using your admin password.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px] space-y-2">
                <Label htmlFor="unlockPassword">Admin password</Label>
                <div className="relative">
                  <Input
                    id="unlockPassword"
                    type={showUnlockPassword ? 'text' : 'password'}
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnlockPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showUnlockPassword ? 'Hide password' : 'Show password'}
                  >
                    {showUnlockPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {unlockError && <p className="text-xs text-destructive">{unlockError}</p>}
              </div>
              <Button
                size="sm"
                onClick={handleUnlock}
                disabled={unlocking}
                className="h-9"
              >
                {unlockActive ? `Unlocked (${unlockSeconds}s)` : unlocking ? 'Unlocking...' : 'Unlock 15s'}
              </Button>
            </div>
          </div>
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
