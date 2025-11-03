import { useEffect } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import storage from '@/utils/storage'
import toast from 'react-hot-toast'

export default function StripeCardModal({ clientSecret, orderId, onClose }: { clientSecret: string, orderId: string, onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    // noop
  }, [clientSecret])

  const handlePay = async () => {
    if (!stripe || !elements) return
    const card = elements.getElement(CardElement)
    if (!card) return
    const res = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } })
    if (res.error) {
      toast.error(res.error.message || 'Payment failed')
      return
    }
    if (res.paymentIntent && res.paymentIntent.status === 'succeeded') {
      // mark order paid locally (server webhook is authoritative)
      storage.updateOrder(String(orderId), { status: 'in-progress', paid: true, depositAmount: Math.round((res.paymentIntent.amount_received || res.paymentIntent.amount) / 100) })
      toast.success('Payment successful')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-card rounded shadow-lg z-60 w-[90%] max-w-md p-6 relative">
        <h3 className="text-lg font-semibold mb-2">Enter card details</h3>
        <div className="border p-3 rounded mb-4">
          <CardElement />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePay} className="bg-gradient-to-r from-gold-600 to-gold-500">Pay</Button>
        </div>
      </div>
    </div>
  )
}
