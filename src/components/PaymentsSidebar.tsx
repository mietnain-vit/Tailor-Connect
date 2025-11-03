import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Props {
  orderId: string
  amount: number
}

export default function PaymentsSidebar({ orderId, amount }: Props) {
  const [loading, setLoading] = useState(false)

  const startCheckout = async () => {
    try {
      setLoading(true)
      const apiBase = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4243'
      const resp = await fetch(`${apiBase.replace(/\/$/, '')}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency: 'inr' }),
      })
      const data = await resp.json()
      if (data?.url) {
        // give a tiny visual delay so spinner is visible before redirect
        setTimeout(() => { window.location.href = data.url }, 200)
        return
      }
      console.error('create-checkout-session response', data)
      toast.error('Failed to create checkout session')
      // fallback to demo payments if server/create-checkout fails
    } catch (err) {
      console.error('startCheckout error', err)
      toast.error('Failed to start checkout')
      try {
        const payments = (await import('@/utils/payments')).default
        await payments.processDeposit(String(orderId), Number(amount || 0))
        toast.success('Demo deposit processed')
        window.location.href = `/orders/${orderId}`
        return
      } catch (e) {
        console.error('demo payment fallback failed', e)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-80 hidden lg:block">
      <div className="sticky top-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Order</div>
              <div className="font-semibold mt-1">{orderId}</div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Deposit to pay</div>
              <div className="font-semibold mt-1">₹{amount}</div>
            </div>
            <div className="flex">
              <Button className="w-full bg-gradient-to-r from-gold-600 to-gold-500" onClick={startCheckout} disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </div>
                ) : (
                  'Pay with Stripe'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
