import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, MapPin, MessageCircle, User, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function DashboardSidebar() {
  const location = useLocation()
  const { currentUser } = useAuth()
  const isCustomer = currentUser?.role === 'customer'
  const links = isCustomer
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/orders', label: 'My Orders', icon: Package },
        { to: '/new-order', label: 'New Order', icon: Plus },
        { to: '/order-tracking', label: 'Track Orders', icon: MapPin },
        { to: '/chat', label: 'Messages', icon: MessageCircle },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/tailor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/tailor-workbench', label: 'Workbench', icon: Package },
        { to: '/orders', label: 'Orders', icon: Package },
        { to: '/chat', label: 'Messages', icon: MessageCircle },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/settings', label: 'Settings', icon: Settings },
      ]

  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-5rem)] p-4">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

