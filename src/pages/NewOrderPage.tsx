import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, User, Package, Ruler, FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { mockData } from '@/utils/mockData'
import { getInitials, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Tailor {
  id: number
  name: string
  specialty: string
  rating: number
  experience: string
}

const schema = yup.object({
  tailorId: yup.number().required('Please select a tailor'),
  itemType: yup.string().required('Item type is required'),
  description: yup.string(),
  chest: yup.number().positive(),
  waist: yup.number().positive(),
  shoulders: yup.number().positive(),
  sleeves: yup.number().positive(),
})

type OrderFormData = yup.InferType<typeof schema>

export default function NewOrderPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1)
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OrderFormData>({
    resolver: yupResolver(schema),
  })

  const itemType = watch('itemType')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Check for prefilled tailor from Tailor Directory
  useEffect(() => {
    try {
      const state = (location && (location as any).state) || null
      const stateTailorId = state?.tailorId
      if (stateTailorId) {
        const t = mockData.tailors.find(x => x.id === Number(stateTailorId))
        if (t) {
          setSelectedTailor(t)
          setValue('tailorId', t.id)
          setStep(2)
        }
        return
      }

      const raw = localStorage.getItem('prefill-tailor-id')
      if (raw) {
        const tid = Number(raw)
        const t = mockData.tailors.find(x => x.id === tid)
        if (t) {
          setSelectedTailor(t)
          setValue('tailorId', t.id)
          setStep(2)
        }
        localStorage.removeItem('prefill-tailor-id')
      }
    } catch (e) {
      // ignore
    }
  }, [setValue, location])

  if (!currentUser || !isAuthenticated) return null

  const handleTailorSelect = (tailor: Tailor) => {
    setSelectedTailor(tailor)
    setValue('tailorId', tailor.id)
    setStep(2)
  }

  const handleNext = () => {
    if (step === 1 && !selectedTailor) {
      toast.error('Please select a tailor')
      return
    }
    if (step === 2 && !itemType) {
      toast.error('Please select an item type')
      return
    }
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const onSubmit = (data: OrderFormData) => {
    const newOrder = {
      id: 'ORD-' + String((JSON.parse(localStorage.getItem('orders') || '[]')).length + 1).padStart(3, '0'),
      tailorName: selectedTailor?.name || 'Rajesh Kumar',
      assignedTailorId: selectedTailor?.id ?? null,
      item: data.itemType,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      amount: 8500,
      progress: 0,
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.unshift(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    toast.success('Order placed successfully!')
    navigate('/dashboard')
  }

  const steps = [
    { number: 1, label: 'Select Tailor', icon: User },
    { number: 2, label: 'Design & Details', icon: Package },
    { number: 3, label: 'Measurements', icon: Ruler },
    { number: 4, label: 'Confirm', icon: FileText },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">Create New Order</h1>
          <p className="text-muted-foreground">Follow the steps to place your custom order</p>
        </motion.div>

        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon
                const isActive = step === stepItem.number
                const isCompleted = step > stepItem.number
                return (
                  <div key={stepItem.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-muted border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {stepItem.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          step > stepItem.number ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Your Tailor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockData.tailors.map((tailor) => (
                        <button
                          key={tailor.id}
                          type="button"
                          onClick={() => handleTailorSelect(tailor)}
                          className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                            selectedTailor?.id === tailor.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                            {getInitials(tailor.name)}
                          </div>
                          <h3 className="font-semibold mb-1">{tailor.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{tailor.specialty}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{tailor.rating}</span>
                            <span className="text-sm text-muted-foreground">• {tailor.experience}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Design Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="itemType">Item Type *</Label>
                      <Select
                        id="itemType"
                        {...register('itemType')}
                        className="mt-2"
                      >
                        <option value="">Select item type</option>
                        <option value="Shirt">Shirt</option>
                        <option value="Suit">Suit</option>
                        <option value="Dress">Dress</option>
                        <option value="Traditional Wear">Traditional Wear</option>
                        <option value="Wedding Attire">Wedding Attire</option>
                        <option value="Casual Wear">Casual Wear</option>
                        <option value="Other">Other</option>
                      </Select>
                      {errors.itemType && (
                        <p className="text-sm text-destructive mt-1">{errors.itemType.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Describe your requirements, preferences, and any special instructions..."
                        {...register('description')}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="chest">Chest (inches)</Label>
                        <Input
                          id="chest"
                          type="number"
                          placeholder="38"
                          {...register('chest', { valueAsNumber: true })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="waist">Waist (inches)</Label>
                        <Input
                          id="waist"
                          type="number"
                          placeholder="32"
                          {...register('waist', { valueAsNumber: true })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulders">Shoulders (inches)</Label>
                        <Input
                          id="shoulders"
                          type="number"
                          placeholder="16"
                          {...register('shoulders', { valueAsNumber: true })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleeves">Sleeves (inches)</Label>
                        <Input
                          id="sleeves"
                          type="number"
                          placeholder="24"
                          {...register('sleeves', { valueAsNumber: true })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      * Measurements are optional but recommended for a perfect fit
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Review your order details before submission
                  </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tailor</p>
                        <p className="font-semibold">{selectedTailor?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Item Type</p>
                        <p className="font-semibold">{itemType || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                        <p className="font-semibold text-gradient">{formatCurrency(8500)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p className="font-semibold">7-10 days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-gold-600 to-gold-500"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-gradient-to-r from-gold-600 to-gold-500"
              >
                Submit Order
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

