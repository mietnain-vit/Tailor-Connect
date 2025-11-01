import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import storage, { Message } from '@/utils/storage'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<any | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

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

    window.addEventListener('order-message-sent', onOrderMessage as EventListener)
    return () => window.removeEventListener('order-message-sent', onOrderMessage as EventListener)
  }, [id, isAuthenticated, navigate])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!currentUser) return null

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

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
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
