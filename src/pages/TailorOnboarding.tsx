import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, ImageIcon, Settings, CheckCircle2 } from 'lucide-react'

export default function TailorOnboarding() {
  const { currentUser, updateUser } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  if (!currentUser) return null

  const onComplete = () => {
    setSaving(true)
    // mark onboarding as completed and set profileComplete
    updateUser({ onboarding: { isNewTailor: false, completed: true }, profileComplete: true })
    setTimeout(() => {
      setSaving(false)
      navigate('/tailor-dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex bg-background">
      <main className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif font-bold mb-2">Welcome, {currentUser.name} — your Tailor workspace</h1>
          <p className="text-muted-foreground mb-6">We've created sensible defaults to help you start receiving orders. You can customize these anytime from Profile & Settings.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Services & Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Default services and starting price were added to your profile.</p>
                <ul className="mt-3 text-sm space-y-1">
                  <li>Default service: Custom Tailoring</li>
                  <li>Starting price: ₹3000</li>
                  <li>Turnaround: 7 days</li>
                </ul>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => navigate('/profile')}>Edit Services</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Upload examples of your work so customers can choose you more easily.</p>
                <div className="mt-4">
                  <Button asChild>
                    <a href="/tailor-portfolio">Manage Portfolio</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Payments & Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">We've set bank transfer as your payout method. You can update this in Payouts.</p>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => navigate('/payouts')}>Set Up Payouts</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 max-w-md">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg">You're almost ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Complete this quick setup to start receiving orders. You can always customize later.</p>
                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-gold-600 to-gold-500" onClick={onComplete} disabled={saving}>
                    {saving ? 'Saving...' : 'Complete setup'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/tailor-dashboard')}>Skip for now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
