import { useEffect, useState } from 'react'
import DashboardSidebar from '@/components/DashboardSidebar'
import { useAuth } from '@/context/AuthContext'
import storage from '@/utils/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function AdminPayoutsPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const [allPayouts, setAllPayouts] = useState<any[]>([])

  useEffect(() => {
    // collect payouts across tailors from localStorage keys
    const keys = Object.keys(localStorage).filter(k => k.startsWith('payouts-'))
    const aggregated: any[] = []
    keys.forEach(k => {
      const tid = k.replace('payouts-', '')
      try {
        const list = JSON.parse(localStorage.getItem(k) || '[]')
        list.forEach((p: any) => aggregated.push({ ...p, tailorId: tid }))
      } catch (e) {}
    })
    setAllPayouts(aggregated)
  }, [])

  if (!currentUser || !isAuthenticated) return null
  if (currentUser.role !== 'admin') return <div className="p-6">Access denied</div>

  const handleApprove = (tailorId: string, payoutId: any) => {
    storage.approvePayout(tailorId, payoutId, 'approved')
    toast.success('Payout approved')
    // refresh
    const keys = Object.keys(localStorage).filter(k => k.startsWith('payouts-'))
    const aggregated: any[] = []
    keys.forEach(k => {
      const tid = k.replace('payouts-', '')
      try {
        const list = JSON.parse(localStorage.getItem(k) || '[]')
        list.forEach((p: any) => aggregated.push({ ...p, tailorId: tid }))
      } catch (e) {}
    })
    setAllPayouts(aggregated)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold">Admin - Payout Requests</h1>
          <p className="text-muted-foreground">Approve or manage payout requests</p>
        </div>

        <div className="space-y-3">
          {allPayouts.length === 0 ? (
            <Card>
              <CardContent className="p-6">No payout requests</CardContent>
            </Card>
          ) : (
            allPayouts.map(p => (
              <Card key={`${p.tailorId}-${p.id}`}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Tailor: {p.tailorId}</div>
                    <div className="text-sm text-muted-foreground">₹{p.amount} • {p.method} • {p.time}</div>
                  </div>
                  <div className="flex gap-2">
                    {p.status !== 'approved' && (
                      <Button onClick={() => handleApprove(p.tailorId, p.id)} className="bg-gradient-to-r from-gold-600 to-gold-500">Approve</Button>
                    )}
                    <div className="text-sm text-muted-foreground">{p.status}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
