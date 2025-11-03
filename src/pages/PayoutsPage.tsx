import { useEffect, useState } from 'react'
import DashboardSidebar from '@/components/DashboardSidebar'
import { useAuth } from '@/context/AuthContext'
import storage from '@/utils/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function PayoutsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const [payouts, setPayouts] = useState<any[]>([])
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    if (!currentUser) return
    const list = storage.getPayouts(String(currentUser.id))
    setPayouts(list)
    // compute demo balance: sum of completed orders assigned to this tailor
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]') as any[]
      const myOrders = orders.filter(o => String(o.assignedTailorId) === String(currentUser.id) || o.tailorName === currentUser.name)
      const completed = myOrders.filter(o => o.status === 'completed')
      const total = completed.reduce((s, o) => s + (o.paid ? (o.amount || 0) : (o.amount || 0)), 0)
      // subtract already recorded payouts
      const paidOut = list.reduce((s: number, p: any) => s + (p.amount || 0), 0)
      setBalance(Math.max(0, total - paidOut))
    } catch (e) {
      setBalance(0)
    }
  }, [currentUser])

  if (!currentUser || !isAuthenticated) return null

  const requestPayout = () => {
    if (!currentUser) return
    if (balance <= 0) {
      toast('No balance available for payout')
      return
    }
    const updated = storage.recordPayout(String(currentUser.id), { amount: balance, method: 'bank', status: 'requested' })
    setPayouts(updated)
    setBalance(0)
    toast.success('Payout requested')
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold">Payouts</h1>
          <p className="text-muted-foreground">Request and view past payout requests.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold mb-4">₹{balance}</div>
              <Button onClick={requestPayout} className="bg-gradient-to-r from-gold-600 to-gold-500">Request Payout</Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payouts recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {payouts.map(p => (
                      <div key={p.id} className="flex items-center justify-between border-b py-2">
                        <div>
                          <div className="font-medium">₹{p.amount}</div>
                          <div className="text-xs text-muted-foreground">{p.method} • {new Date(p.time).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{p.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
