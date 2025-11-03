import { useEffect, useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import storage from '@/utils/storage'
import toast from 'react-hot-toast'

interface Props {
  clientSecret?: string | null
  orderId: string
  onClose: () => void
}

export default function StripeCardModal({ clientSecret, orderId, onClose }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // noop: could be used to reset state when clientSecret changes
    setIsProcessing(false)
  }, [clientSecret])

  if (!clientSecret) return null

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error('Stripe is not ready yet')
      return
    }
    const card = elements.getElement(CardElement as any)
    if (!card) {
      toast.error('Card element not found')
      return
    }

    try {
      setIsProcessing(true)
      // cast to any to avoid strict element typing mismatches in different stripe element builds
      const res = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: card as any } } as any)
      if (res.error) {
        toast.error(res.error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }
      if (res.paymentIntent && res.paymentIntent.status === 'succeeded') {
        // mark order paid locally (server webhook is authoritative)
  const received = ((res.paymentIntent as any)?.amount_received || (res.paymentIntent as any)?.amount) || 0
        storage.updateOrder(String(orderId), { status: 'in-progress', paid: true, depositAmount: Math.round(received / 100) })
        toast.success('Payment successful')
        onClose()
      } else {
        toast('Payment processing')
      }
    } catch (err: any) {
      console.error('confirmCardPayment error', err)
      toast.error(err?.message || 'Payment error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="bg-card rounded shadow-lg z-50 w-[90%] max-w-md p-6 relative">
        <h3 className="text-lg font-semibold mb-2">Enter card details</h3>
        <div className="border p-3 rounded mb-4">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handlePay} disabled={isProcessing} className="bg-gradient-to-r from-gold-600 to-gold-500">
            {isProcessing ? 'Processing…' : 'Pay'}
          </Button>
        </div>
      </div>
    </div>
  )
}
