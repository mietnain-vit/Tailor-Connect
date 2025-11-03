import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Camera, Edit2, Save, X } from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import storage from '@/utils/storage'

export default function ProfilePage() {
  const { currentUser, updateUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
  })
  const [avatar, setAvatar] = useState<string | null>(currentUser?.avatar || null)

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login')
    } else {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        location: currentUser.location || '',
      })
      setAvatar(currentUser.avatar || null)
    }
  }, [currentUser, isAuthenticated, navigate])

  // tailor portfolio
  const [portfolio, setPortfolio] = useState<any[]>([])

  useEffect(() => {
    if (currentUser && currentUser.role === 'tailor') {
      const list = storage.getPortfolio(String(currentUser.id))
      setPortfolio(list)
    }
  }, [currentUser])

  const onPortfolioDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !currentUser) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const data = reader.result as string
      const updated = storage.addPortfolioItem(String(currentUser.id), { data, title: file.name })
      setPortfolio(updated)
      toast.success('Portfolio image uploaded')
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps: getPortfolioRoot, getInputProps: getPortfolioInput } = useDropzone({ onDrop: onPortfolioDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatar(result)
        updateUser({ avatar: result })
        toast.success('Profile picture updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
    })
    setIsEditing(false)
  }

  if (!isAuthenticated || !currentUser) return null

  return (
    <div className="dashboard-page">
      <DashboardSidebar />
      <main className="dashboard-main">
        <div className="space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-gold-600 to-gold-500" />
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 pb-6">
                  <div
                    {...getRootProps()}
                    className="relative cursor-pointer group"
                  >
                    <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {avatar ? (
                        <img src={avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(currentUser.name)
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <input {...getInputProps()} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold mb-2">{currentUser.name}</h1>
                    <p className="text-muted-foreground mb-4">{currentUser.email}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {currentUser.location && (
                        <span className="text-muted-foreground">📍 {currentUser.location}</span>
                      )}
                      {currentUser.phone && (
                        <span className="text-muted-foreground">📞 {currentUser.phone}</span>
                      )}
                      <span className="capitalize px-3 py-1 bg-primary/10 text-primary rounded-full">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-gold-600 to-gold-500">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{currentUser.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{currentUser.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{currentUser.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{currentUser.location || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role-specific Content */}
          {currentUser.role === 'customer' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Saved Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Chest</p>
                      <p className="font-semibold">38 inches</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Waist</p>
                      <p className="font-semibold">32 inches</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Shoulders</p>
                      <p className="font-semibold">16 inches</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sleeves</p>
                      <p className="font-semibold">24 inches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Specialty</p>
                      <p className="font-semibold">Traditional Wear</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Experience</p>
                      <p className="font-semibold">15 years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      <p className="font-semibold">4.8 ⭐</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                      <p className="font-semibold">250</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tailor Portfolio */}
          {currentUser.role === 'tailor' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div {...getPortfolioRoot()} className="border-dashed border-2 rounded p-4 text-center cursor-pointer mb-4">
                    <input {...getPortfolioInput()} />
                    <p className="text-sm text-muted-foreground">Click or drag an image here to add to your portfolio</p>
                  </div>

                  {portfolio.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No portfolio items yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {portfolio.map((p: any) => (
                        <div key={p.id} className="rounded overflow-hidden border">
                          <img src={p.data} alt={p.title} className="w-full h-32 object-cover" />
                          <div className="p-2 flex items-center justify-between">
                            <p className="text-xs truncate">{p.title || 'Image'}</p>
                            <button
                              className="text-xs text-destructive"
                              onClick={() => {
                                if (!currentUser) return
                                const updated = storage.removePortfolioItem(String(currentUser.id), p.id)
                                setPortfolio(updated)
                                toast.success('Removed portfolio item')
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

