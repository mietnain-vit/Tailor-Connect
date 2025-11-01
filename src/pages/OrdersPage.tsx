import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, MessageCircle, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  id: string
  tailorName: string
  item: string
  status: string
  date: string
  amount: number
  progress?: number
}

export default function OrdersPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
    const handler = () => {
      const saved = localStorage.getItem('orders')
      if (saved) {
        setOrders(JSON.parse(saved))
        toast.success('Orders updated')
      }
    }
    window.addEventListener('order-updated', handler as EventListener)
    return () => window.removeEventListener('order-updated', handler as EventListener)
  }, [isAuthenticated, navigate])

  if (!currentUser) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">View and manage all your orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">Create your first order to get started</p>
            <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-500">
              <Link to="/new-order">Create New Order</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-primary">{order.id}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{order.item}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Tailor: {order.tailorName}</span>
                          <span>•</span>
                          <span>{formatDate(order.date)}</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">{formatCurrency(order.amount)}</span>
                        </div>
                        {order.status === 'in-progress' && order.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{order.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-gold-600 to-gold-500 h-2 rounded-full transition-all"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/order-tracking">Track</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/chat">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

