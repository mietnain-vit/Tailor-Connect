import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  id: string
  tailorName: string
  assignedTailorId?: number
  item: string
  status: string
  date: string
  amount: number
  progress?: number
}

export default function TailorWorkbenchPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('orders')
    if (saved) setOrders(JSON.parse(saved))
  }, [])

  if (!currentUser || !isAuthenticated) return null

  // show orders assigned to this tailor (by id) or fallback to tailorName match
  const myOrders = orders.filter(o => {
    const assignedId = o.assignedTailorId
    const userIdNum = Number(currentUser.id as any)
    if (assignedId && !Number.isNaN(userIdNum)) {
      return assignedId === userIdNum
    }
    return o.tailorName === currentUser.name
  })

  function persist(updated: Order[]) {
    setOrders(updated)
    localStorage.setItem('orders', JSON.stringify(updated))
  }

  const acceptOrder = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'in-progress', progress: o.progress || 0 } : o)
    persist(updated)
    toast.success('Order accepted')
    window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId: id } }))
  }

  const declineOrder = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o)
    persist(updated)
    toast('Order declined')
    window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId: id } }))
  }

  const updateProgress = (id: string, progress: number) => {
    const updated = orders.map(o => o.id === id ? { ...o, progress, status: progress >= 100 ? 'completed' : 'in-progress' } : o)
    persist(updated)
    toast.success('Progress updated')
    window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId: id } }))
  }

  const markCompleted = (id: string) => {
    updateProgress(id, 100)
    toast.success('Marked as completed')
    window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId: id } }))
  }

  // simple upload that stores base64 in localStorage under order-<id>-images
  const uploadImage = async (id: string, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      const key = `order-${id}-images`
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      list.push({ data, name: file.name, time: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(list))
      toast.success('Image uploaded')
      window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId: id } }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold">Tailor Workbench</h1>
          <p className="text-muted-foreground">Manage your assigned orders, update progress, upload proofs, and complete work.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-lg">No orders assigned to you yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Demo assignment uses the tailorName in the order to match your account name.</p>
              </CardContent>
            </Card>
          ) : myOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{order.item} • {order.id}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(order.date)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{order.tailorName}</p>
                    <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Progress: {order.progress ?? 0}%</label>
                  <Slider value={[order.progress ?? 0]} onValueChange={(v) => updateProgress(order.id, v[0])} max={100} />
                </div>

                <div className="flex gap-2 items-center mb-4">
                  <input type="file" accept="image/*" multiple onChange={(e) => {
                    const files = e.target.files
                    if (!files) return
                    Array.from(files).forEach(f => uploadImage(order.id, f))
                  }} />
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <Button onClick={() => acceptOrder(order.id)} className="bg-gradient-to-r from-gold-600 to-gold-500">Accept</Button>
                      <Button variant="destructive" onClick={() => declineOrder(order.id)}>Decline</Button>
                    </>
                  )}
                  {order.status !== 'pending' && (
                    <>
                      <Button onClick={() => markCompleted(order.id)} className="bg-gradient-to-r from-gold-600 to-gold-500">Mark Completed</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
