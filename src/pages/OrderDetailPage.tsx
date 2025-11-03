import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import storage, { Message } from '@/utils/storage'
import payments from '@/utils/payments'
import toast from 'react-hot-toast'
import StripeCardModal from '@/components/StripeCardModal'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<any | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositPercent, setDepositPercent] = useState<number>(30)
  const [showCardModal, setShowCardModal] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const saved = localStorage.getItem('orders')
    if (saved && id) {
      const orders = JSON.parse(saved)
      const found = orders.find((o: any) => o.id === id)
      setOrder(found || null)
    }

    if (id) {
      setMessages(storage.getMessages(id as any as number))
    }

    const onOrderMessage = (e: any) => {
      const detail = e?.detail
      if (!detail) return
      if (String(detail.orderId) === String(id)) {
        setMessages(storage.getMessages(id as any as number))
      }
    }

    const onOrderUpdated = (e: any) => {
      const detail = e?.detail
      if (!detail) return
      if (String(detail.orderId) === String(id)) {
        const saved2 = localStorage.getItem('orders')
        if (saved2 && id) {
          const orders = JSON.parse(saved2)
          const found = orders.find((o: any) => o.id === id)
          setOrder(found || null)
        }
      }
    }

    window.addEventListener('order-message-sent', onOrderMessage as EventListener)
    window.addEventListener('order-updated', onOrderUpdated as EventListener)
    return () => {
      window.removeEventListener('order-message-sent', onOrderMessage as EventListener)
      window.removeEventListener('order-updated', onOrderUpdated as EventListener)
    }
  }, [id, isAuthenticated, navigate])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !id) return

    const newMessage: Message = {
      id: Date.now(),
      chatId: Number(id.replace(/\D/g, '')) || Date.now(),
      sender: currentUser.role === 'customer' ? 'customer' : 'tailor',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // persist under messages-<orderId>
    storage.addMessage(id as any as number, newMessage)
    const updated = storage.getMessages(id as any as number)
    setMessages(updated)
    setInput('')

    // dispatch an order-specific event so timeline or other UI can react
    try {
      window.dispatchEvent(new CustomEvent('order-message-sent', { detail: { orderId: id, message: newMessage } }))
    } catch (e) {}

    // also add a simple notification for recipient
    const recipientKey = newMessage.sender === 'customer' ? 'tailor' : 'customer'
    storage.addNotification(recipientKey, {
      id: Date.now(),
      title: `New message on ${id}`,
      body: newMessage.text,
      time: new Date().toISOString(),
      orderId: String(id),
      url: `/orders/${id}`,
      read: false,
    })
  }

  // Accept quote with configurable deposit percent
  const acceptQuote = async (percent: number) => {
    if (!order || !order.quote) return
    const price = Number(order.quote.price || order.amount || 0)
    const deposit = Math.round(price * (percent / 100))
    try {
      // If configured to use in-app PaymentIntents, create PI and show card modal
      // @ts-ignore
      const usePI = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_USE_PAYMENT_INTENTS) || false
      // @ts-ignore
      const apiBase = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4242'
      if (usePI === 'true' || usePI === true) {
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, amount: deposit, currency: 'inr' }),
        })
        const data = await resp.json()
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret)
          setShowCardModal(true)
          return
        }
        toast.error('Failed to create payment intent')
        return
      }

      // Fallback to Checkout redirect (legacy)
      const resp = await fetch(`${apiBase.replace(/\/$/, '')}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: deposit, currency: 'inr' }),
      })
      const data = await resp.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        console.error('create-checkout-session response', data)
        toast.error('Failed to create checkout session')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to create payment session')
    }
  }

  const rejectQuote = () => {
    if (!order) return
    storage.updateOrder(order.id, { status: 'cancelled' })
    storage.addNotification('tailor', {
      id: Date.now(),
      title: `Quote rejected for ${order.id}`,
      body: `Customer rejected the quote.`,
      time: new Date().toISOString(),
      orderId: String(order.id),
      url: `/orders/${order.id}`,
      read: false,
    })
    toast?.success?.('Quote rejected')
    const saved = localStorage.getItem('orders')
    if (saved) {
      const orders = JSON.parse(saved)
      const found = orders.find((o: any) => o.id === order.id)
      setOrder(found || null)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      {/* Stripe Elements modal when using PaymentIntents */}
      {showCardModal && clientSecret && order && (
        <StripeCardModal clientSecret={clientSecret} orderId={String(order.id)} onClose={() => { setShowCardModal(false); setClientSecret(null) }} />
      )}
      <main className="flex-1 p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold mb-2">Order {id}</h1>
            <p className="text-sm text-muted-foreground mb-4">Details and conversation</p>

            <Card className="mb-4">
              <CardContent>
                <div className="mb-2">Item: {order?.item}</div>
                <div className="mb-2">Tailor: {order?.tailorName}</div>
                <div className="mb-2">Status: {order?.status}</div>
                <div className="mb-2">Amount: {order?.amount}</div>
              </CardContent>
            </Card>

              {/* Quote block for customers when a quote exists */}
              {order?.quote && currentUser.role === 'customer' && order?.status === 'quoted' && (
                <Card className="mb-4 border-yellow-200">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Quote from {order?.tailorName}</h4>
                        <p className="text-sm text-muted-foreground">{order.quote.message}</p>
                        <div className="mt-2">
                          <span className="text-lg font-semibold">₹{order.quote.price}</span>
                          <span className="text-sm text-muted-foreground ml-3">• {order.quote.days} days</span>
                        </div>
                      </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setShowDepositModal(true)} className="bg-gradient-to-r from-gold-600 to-gold-500">Accept & Pay Deposit</Button>
                      <Button variant="outline" onClick={rejectQuote}>Reject</Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deposit confirmation modal */}
              {showDepositModal && order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowDepositModal(false)} />
                  <div className="bg-card rounded shadow-lg z-60 w-[90%] max-w-md p-6 relative">
                    <h3 className="text-lg font-semibold mb-2">Confirm Deposit</h3>
                    <p className="text-sm text-muted-foreground mb-4">You can adjust the deposit percent to pay now. This demo captures the deposit only.</p>
                    <div className="mb-4">
                      <label className="block text-sm mb-1">Deposit percent</label>
                      <input type="number" min={0} max={100} value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value || 0))} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">Quoted price: ₹{order.quote.price}</div>
                      <div className="text-lg font-semibold mt-2">Deposit to pay: ₹{Math.round(Number(order.quote.price || order.amount || 0) * (depositPercent / 100))}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowDepositModal(false)}>Cancel</Button>
                      <Button onClick={() => acceptQuote(depositPercent)} className="bg-gradient-to-r from-gold-600 to-gold-500">Confirm & Pay</Button>
                    </div>
                  </div>
                </div>
              )}

            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Conversation</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`p-3 rounded ${m.sender === 'customer' ? 'bg-primary text-primary-foreground ml-auto max-w-[70%]' : 'bg-card border max-w-[70%]'}`}>
                      <div className="text-sm">{m.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">{m.time}</div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a message..." />
                  <Button type="submit" className="bg-gradient-to-r from-gold-600 to-gold-500">Send</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <aside>
            <h3 className="text-lg font-semibold mb-2">Timeline</h3>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded">Order created: {order?.date}</div>
              {/* Future: render timeline entries from order.events or messages */}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
