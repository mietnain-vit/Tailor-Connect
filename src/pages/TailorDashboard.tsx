import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import TailorOnboarding from './TailorOnboarding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import storage from '@/utils/storage'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function TailorDashboard() {
  const { currentUser, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])

  useEffect(() => {
    const saved = storage.getOrders()
    setOrders(saved || [])

    const pid = currentUser?.id ? `tailor-portfolio-${currentUser.id}` : null
    if (pid) {
      try { setPortfolio(JSON.parse(localStorage.getItem(pid) || '[]')) } catch { setPortfolio([]) }
    }
  }, [currentUser])

  useEffect(() => {
    const handler = () => setOrders(storage.getOrders())
    window.addEventListener('order-updated', handler as EventListener)
    return () => window.removeEventListener('order-updated', handler as EventListener)
  }, [])

  if (!currentUser || !isAuthenticated) return null

  // Render tailor onboarding if this is a newly created tailor
  if (currentUser.onboarding && (currentUser.onboarding.isNewTailor)) {
    return <TailorOnboarding />
  }

  const myOrders = useMemo(() => orders.filter(o => (o.assignedTailorId && String(o.assignedTailorId) === String(currentUser.id)) || o.tailorName === currentUser.name), [orders, currentUser])

  // Orders specifically assigned to this tailor (used for new requests)
  const assignedOrders = useMemo(() => orders.filter(o => String(o.assignedTailorId) === String(currentUser.id)), [orders, currentUser])

  const stats = useMemo(() => {
    return {
      total: myOrders.length,
      pending: myOrders.filter(o => o.status === 'pending').length,
      inProgress: myOrders.filter(o => o.status === 'in-progress').length,
      completed: myOrders.filter(o => o.status === 'completed').length,
      revenue: myOrders.reduce((s, o) => s + (Number(o.amount || 0)), 0),
    }
  }, [myOrders])

  const revenueData = useMemo(() => {
    const map: Record<string, number> = {}
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const k = d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
      months.push(k)
      map[k] = 0
    }
    myOrders.forEach(o => {
      if (!o.date) return
      const k = new Date(o.date).toLocaleString(undefined, { month: 'short', year: 'numeric' })
      if (!map[k]) map[k] = 0
      map[k] += Number(o.amount || 0)
    })
    return months.map(m => ({ month: m, revenue: map[m] || 0 }))
  }, [myOrders])

  function handleUploadPortfolio(files: FileList | null) {
    if (!files || !currentUser) return
    const arr = Array.from(files)
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = () => {
        const data = reader.result as string
        const key = `tailor-portfolio-${currentUser.id}`
        const existing = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } })()
        existing.push({ name: f.name, data, time: new Date().toISOString() })
        localStorage.setItem(key, JSON.stringify(existing))
        setPortfolio(existing)
        window.dispatchEvent(new CustomEvent('tailor-updated'))
      }
      reader.readAsDataURL(f)
    })
  }

  async function markOrderReady(id: string) {
    storage.updateOrder(id, { status: 'ready', progress: 100 })
    storage.addNotification('customer', { id: Date.now(), title: 'Order Ready', body: `Your order ${id} is ready for pickup/delivery`, time: new Date().toISOString(), orderId: id, url: `/orders/${id}` })
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">Tailor Dashboard</h1>
          <p className="text-sm text-muted-foreground">A workspace tailored for tailors — manage orders, quotes, portfolio and earnings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <h3 className="font-semibold mb-2">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Total Orders</div><div className="font-semibold">{stats.total}</div></div>
                <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Pending</div><div className="font-semibold">{stats.pending}</div></div>
                <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">In Progress</div><div className="font-semibold">{stats.inProgress}</div></div>
                <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Completed</div><div className="font-semibold">{stats.completed}</div></div>
                <div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Revenue</div><div className="font-semibold">{formatCurrency(stats.revenue)}</div></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent>
              <h3 className="font-semibold mb-2">Earnings (last 6 months)</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Requests: only show orders explicitly assigned to this tailor */}
          <Card>
            <CardHeader>
              <CardTitle>New Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignedOrders.filter(o => (o.status || 'pending') === 'pending').length === 0 ? (
                  <div className="text-sm text-muted-foreground">No new requests assigned to you</div>
                ) : (
                  assignedOrders.filter(o => (o.status || 'pending') === 'pending').slice(0,8).map(o => (
                    <div key={o.id} className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{o.id} — {o.item}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(o.date)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{formatCurrency(o.amount)}</div>
                        <Button size="sm" variant="outline" onClick={() => markOrderReady(o.id)}>Mark Ready</Button>
                        <Button size="sm" asChild>
                          <Link to={`/orders/${o.id}`}>Open</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Quick access to conversations with customers.</p>
              <Button asChild className="w-full bg-gradient-to-r from-gold-600 to-gold-500">
                <Link to="/chat">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Manage your portfolio of works.</p>
              <input type="file" accept="image/*" multiple onChange={(e) => handleUploadPortfolio(e.target.files)} />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {portfolio.map((p, i) => (
                  <img key={i} src={p.data} alt={p.name} className="w-full h-20 object-cover rounded" />
                ))}
                {portfolio.length === 0 && <div className="text-sm text-muted-foreground">No portfolio items</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quotes & Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {myOrders.filter(o => o.quote && o.status === 'pending').map(o => (
                  <div key={o.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.id} — {o.item}</div>
                      <div className="text-xs text-muted-foreground">Quote: {formatCurrency(o.quote?.price || 0)} • {o.quote?.turnaroundDays} days</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" asChild>
                        <Link to={`/orders/${o.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {myOrders.filter(o => o.quote && o.status === 'pending').length === 0 && (<div className="text-sm text-muted-foreground">No pending quotes</div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
