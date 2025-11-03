import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DashboardSidebar from '@/components/DashboardSidebar'
import PaymentsSidebar from '@/components/PaymentsSidebar'
import { Card, CardContent } from '@/components/ui/card'
import storage from '@/utils/storage'
import toast from 'react-hot-toast'

export default function PaymentsCheckoutPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!orderId) return
    ;(async () => {
      try {
        setLoading(true)
        setLoadingMsg('Creating Checkout session...')
  const apiBase = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4244'
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, amount: Number(amount || 0), currency: 'inr' }),
        })
        const data = await resp.json()
        if (data?.url) {
          // redirect to Stripe Checkout
          setLoadingMsg('Redirecting to Stripe…')
          setTimeout(() => { window.location.href = data.url }, 200)
          return
        }
        console.error('create-checkout-session response', data)
        // fallback: demo payment processing
        try {
          const payments = (await import('@/utils/payments')).default
          await payments.processDeposit(String(orderId), Number(amount || 0))
          toast.success('Demo deposit processed')
          navigate(`/orders/${orderId}`)
        } catch (e) {
          toast.error('Failed to create checkout session')
          navigate('/dashboard')
        }
      } catch (e) {
        console.error('checkout redirect error', e)
        toast.error('Failed to create checkout session')
        navigate('/dashboard')
      } finally {
        setLoading(false)
        setLoadingMsg(null)
      }
    })()
  }, [orderId, amount, navigate])

  return (
    <div className="min-h-screen flex bg-background">
      <PaymentsSidebar orderId={orderId || 'unknown'} amount={Number(amount || 0)} />
      <main className="flex-1 p-6 lg:p-8">
        <Card>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <div>{loadingMsg || 'Preparing payment…'}</div>
              </div>
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
