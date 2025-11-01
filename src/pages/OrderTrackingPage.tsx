import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  tailorName: string
  item: string
  status: string
  date: string
  amount: number
  progress?: number
}

interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'active' | 'pending'
}

export default function OrderTrackingPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [images, setImages] = useState<Array<{data:string;name?:string;time?:string}>>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders)
      setOrders(parsedOrders)
      if (parsedOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(parsedOrders[0].id)
      }
    }
    const handler = (e?: Event) => {
      const id = selectedOrderId
      if (!id) return
      const key = `order-${id}-images`
      const imgs = JSON.parse(localStorage.getItem(key) || '[]')
      setImages(imgs)
    }
    window.addEventListener('order-updated', handler as EventListener)
    return () => window.removeEventListener('order-updated', handler as EventListener)
  }, [isAuthenticated, navigate, selectedOrderId])

  if (!currentUser || !isAuthenticated) return null

  const order = orders.find(o => o.id === selectedOrderId)

  useEffect(() => {
    if (!selectedOrderId) return
    const key = `order-${selectedOrderId}-images`
    const imgs = JSON.parse(localStorage.getItem(key) || '[]')
    setImages(imgs)
  }, [selectedOrderId])

  const getTimelineSteps = (status: string): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been received',
        status: status !== 'pending' ? 'completed' : 'pending',
      },
      {
        id: 'accepted',
        title: 'Order Accepted',
        description: 'Tailor has accepted your order',
        status: status === 'in-progress' || status === 'completed' ? 'completed' : status === 'pending' ? 'pending' : 'active',
      },
      {
        id: 'progress',
        title: 'In Progress',
        description: 'Your clothing is being tailored',
        status: status === 'completed' ? 'completed' : status === 'in-progress' ? 'active' : 'pending',
      },
      {
        id: 'ready',
        title: 'Ready for Delivery',
        description: 'Your order is ready',
        status: status === 'completed' ? 'completed' : 'pending',
      },
    ]
    return steps
  }

  const timelineSteps = order ? getTimelineSteps(order.status) : []

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Monitor the progress of your orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders to track</h2>
            <p className="text-muted-foreground mb-6">Create your first order to get started</p>
            <Button 
              className="bg-gradient-to-r from-gold-600 to-gold-500"
              onClick={() => navigate('/new-order')}
            >
              Create New Order
            </Button>
          </motion.div>
        ) : !order ? null : (
          <>
            {orders.length > 1 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <label className="mb-2 block">Select Order:</label>
                  <Select
                    value={selectedOrderId || ''}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id} - {o.item}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-bold text-lg">{order.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tailor</p>
                      <p className="font-bold text-lg">{order.tailorName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-bold text-lg">{formatDate(order.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            step.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : step.status === 'active'
                              ? 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20'
                              : 'bg-muted border-muted-foreground text-muted-foreground'
                          }`}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-current" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-full min-h-[60px] ${
                              step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {images.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Proof Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="border rounded overflow-hidden">
                        <img src={img.data} alt={img.name || 'proof'} className="w-full h-40 object-cover" />
                        <div className="p-2 text-xs text-muted-foreground">{img.name} • {new Date(img.time).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}

