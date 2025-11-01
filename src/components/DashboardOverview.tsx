import React from 'react'
import { Link } from 'react-router-dom'
import { Package, DollarSign, Star, Users, MessageCircle, PlusCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import storage from '@/utils/storage'
import { formatCurrency } from '@/lib/utils'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

function getMonthKey(d: string) {
  try {
    const dt = new Date(d)
    return dt.toLocaleString(undefined, { month: 'short', year: 'numeric' })
  } catch (e) {
    return d
  }
}

interface Props {
  role: 'customer' | 'tailor' | string
  orders: any[]
}

export default function DashboardOverview({ role, orders }: Props) {
  const unread = (storage.getNotifications(role) || []).filter(n => !n.read).length

  const isCustomer = role === 'customer'

  const stats = isCustomer ? {
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  } : {
    total: orders.length,
    revenue: orders.reduce((s, o) => s + (o.amount || 0), 0),
    rating: 4.7
  }
  const revenueData = (() => {
    const map: Record<string, number> = {}
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const k = d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
      months.push(k)
      map[k] = 0
    }
    orders.forEach(o => {
      if (!o.date) return
      const k = getMonthKey(o.date)
      if (map[k] === undefined) map[k] = 0
      map[k] += Number(o.amount || 0)
    })
    return months.map(m => ({ month: m, revenue: map[m] || 0 }))
  })()

  const upcoming = orders
    .filter(o => o.date && new Date(o.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="font-semibold mb-2">Earnings (by month)</h3>
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

        <Card>
          <CardContent>
            <h3 className="font-semibold mb-2">Upcoming Orders</h3>
            <div className="space-y-2">
              {upcoming.map(o => (
                <div key={o.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{o.item}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right text-sm font-semibold">{formatCurrency(o.amount)}</div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-sm text-muted-foreground">No upcoming orders</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 bg-card rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {isCustomer ? (
          <>
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{stats.rating}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Notifications</p>
              <p className="text-2xl font-bold">{unread}</p>
            </div>
            <div className="p-3 bg-card rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {isCustomer ? (
                <>
                  <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-500">
                    <Link to="/new-order">Create Order</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/tailors">Find Tailors</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-500">
                    <Link to="/tailor-workbench">My Workbench</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/chat">Messages</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="font-semibold mb-2">Recent Notifications</h3>
            <div className="space-y-2">
              {(storage.getNotifications(role) || []).slice().reverse().slice(0,5).map(n => (
                <div key={n.id} className="p-2 border rounded hover:bg-accent">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
              ))}
              {storage.getNotifications(role || 'guest').length === 0 && (
                <div className="text-sm text-muted-foreground">No notifications</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
