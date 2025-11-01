import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  Users,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate, formatCurrency } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'

interface Order {
  id: string
  tailorName: string
  item: string
  status: string
  date: string
  amount: number
  progress?: number
}

export default function Dashboard() {
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
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('orders')
      if (saved) setOrders(JSON.parse(saved))
    }
    window.addEventListener('order-updated', handler as EventListener)
    return () => window.removeEventListener('order-updated', handler as EventListener)
  }, [])

  if (!currentUser) return null

  const isCustomer = currentUser.role === USER_ROLES.CUSTOMER

  // Stats calculation
  const stats = isCustomer 
    ? {
        total: orders.length,
        inProgress: orders.filter(o => o.status === 'in-progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'pending').length
      }
    : {
        total: 45,
        revenue: 250000,
        rating: 4.8,
        customers: 120
      }

  // Chart data
  const orderTrendData = [
    { month: 'Jan', orders: 12 },
    { month: 'Feb', orders: 19 },
    { month: 'Mar', orders: 15 },
    { month: 'Apr', orders: 22 },
    { month: 'May', orders: 18 },
    { month: 'Jun', orders: 25 },
  ]

  const statusDistribution = [
    { name: 'Completed', value: stats.completed || 30, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress || 10, color: '#6366f1' },
    { name: 'Pending', value: stats.pending || 5, color: '#f59e0b' },
  ]

  const statCards = isCustomer ? [
    { 
      title: 'Total Orders', 
      value: stats.total, 
      icon: Package, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      icon: TrendingUp, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      icon: CheckCircle2, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      title: 'Pending', 
      value: stats.pending, 
      icon: Clock, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
  ] : [
    { 
      title: 'Total Orders', 
      value: stats.total, 
      icon: Package, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      title: 'Revenue', 
      value: formatCurrency(stats.revenue || 0), 
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      title: 'Rating', 
      value: stats.rating, 
      icon: Star, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    { 
      title: 'Customers', 
      value: stats.customers, 
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your {isCustomer ? 'orders' : 'business'} today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" asChild>
                <Link to="/orders">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No orders yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by creating your first order
                  </p>
                  <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-500">
                    <Link to="/new-order">Create New Order</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-primary">{order.id}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {order.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.item} • {order.tailorName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.amount)}</p>
                        <Button variant="ghost" size="sm" asChild className="mt-2">
                          <Link to="/orders">View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
