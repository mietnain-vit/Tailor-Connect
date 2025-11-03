import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import storage from '@/utils/storage'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      try {
  const apiBase = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4244'
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/checkout-session?sessionId=${encodeURIComponent(sessionId)}`)
        const session = await res.json()
        // metadata.orderId was set when creating the session
        const orderId = session?.metadata?.orderId || session?.metadata?.orderid
        const paid = session?.payment_status === 'paid' || session?.payment_status === 'paid'
        const amountTotal = session?.amount_total ? Math.round((session.amount_total || 0) / 100) : undefined
        if (orderId) {
          if (paid) {
            storage.updateOrder(String(orderId), { status: 'in-progress', paid: true, depositAmount: amountTotal })
            toast.success('Payment successful — order updated')
          } else {
            toast('Payment completed but status not marked paid')
          }
        }
        setLoading(false)
        navigate(`/orders/${orderId}`)
      } catch (e) {
        console.error(e)
        toast.error('Failed to verify payment')
        setLoading(false)
      }
    })()
  }, [sessionId, navigate])

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Card>
          <CardContent>
            {loading ? <div>Verifying payment...</div> : <div>Redirecting...</div>}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
