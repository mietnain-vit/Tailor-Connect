import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import storage from '@/utils/storage'
import toast from 'react-hot-toast'

export default function PaymentsCheckoutPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!orderId) return
    ;(async () => {
      try {
        setLoading(true)
        const apiBase = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4242'
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, amount: Number(amount || 0), currency: 'inr' }),
        })
        const data = await resp.json()
        if (data?.url) {
          // redirect to Stripe Checkout
          window.location.href = data.url
          return
        }
        console.error('create-checkout-session response', data)
        toast.error('Failed to create checkout session')
        navigate('/dashboard')
      } catch (e) {
        console.error('checkout redirect error', e)
        toast.error('Failed to create checkout session')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [orderId, amount, navigate])

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Card>
          <CardContent>
            {loading ? (
              <div>Preparing payment…</div>
            ) : (
              <div>
                <p>Unable to start Checkout. Returning to dashboard.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
