import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Users, Package, Settings } from 'lucide-react'

export default function CustomerOnboarding() {
  const { currentUser, updateUser } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  if (!currentUser) return null

  const onComplete = async () => {
    setSaving(true)
    // mark onboarding as completed and set profileComplete
    updateUser({ onboarding: { isNewCustomer: false, completed: true }, profileComplete: true })
    // small delay to show spinner feel
    setTimeout(() => {
      setSaving(false)
      navigate('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <main className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-bold mb-2">Welcome to TailorConnect, {currentUser.name}!</h1>
          <p className="text-muted-foreground mb-6">Here's a quick setup to get you started. These defaults can be changed anytime in your profile settings.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Default order preferences and quick actions.</p>
                <ul className="space-y-2 text-sm">
                  <li>Preferred currency: INR</li>
                  <li>Default delivery: Standard (5-7 days)</li>
                </ul>
                <div className="mt-4">
                  <Button asChild>
                    <a href="/new-order">Create your first order</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tailors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Find and favorite tailors nearby to speed up future orders.</p>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <a href="/tailors">Browse Tailors</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Default notifications and payout method have been set for you.</p>
                <ul className="space-y-2 text-sm">
                  <li>Notifications: Email on</li>
                  <li>Payout method: Bank transfer</li>
                </ul>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => navigate('/profile')}>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 max-w-md">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg">Finish setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">You're all set with sensible defaults. When you're ready you can complete the quick setup to jump into the dashboard.</p>
                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-gold-600 to-gold-500" onClick={onComplete} disabled={saving}>
                    {saving ? 'Saving...' : 'Complete setup'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>Skip for now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
