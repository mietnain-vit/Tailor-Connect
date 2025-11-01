import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  Award, 
  Users, 
  MessageSquare, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockData } from '@/utils/mockData'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

// demo quick-login removed

export default function HomePage() {
  const navigate = useNavigate()
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const features = [
    { 
      icon: Shield, 
      title: 'Expert Tailors', 
      description: 'Connect with verified, skilled tailors with years of experience in custom clothing' 
    },
    { 
      icon: Zap, 
      title: 'Secure Payments', 
      description: 'Safe and encrypted payment processing with multiple payment options' 
    },
    { 
      icon: Award, 
      title: 'Real-Time Tracking', 
      description: 'Track your order status from design to delivery with live updates' 
    },
    { 
      icon: Users, 
      title: 'Custom Measurements', 
      description: 'Upload your measurements for a perfect fit every time' 
    },
    { 
      icon: MessageSquare, 
      title: 'Direct Chat', 
      description: 'Communicate directly with tailors to discuss your requirements' 
    },
    { 
      icon: CheckCircle2, 
      title: 'Quality Guarantee', 
      description: '100% satisfaction guarantee with hassle-free alterations' 
    },
  ]

  const testimonials = mockData.testimonials || []

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message sent successfully!')
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-background to-background dark:from-gold-950/20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">
                <span className="text-gradient">Custom Tailoring,</span>
                <br />
                Made Simple
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Connect with skilled home-grown tailors and designers for bespoke clothing that fits your style perfectly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white"
                  onClick={() => navigate('/signup')}
                >
                  Join as Customer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/signup')}
                >
                  Join as Tailor
                </Button>
              </div>
              <div className="flex gap-4 mb-8">
                {/* demo buttons removed */}
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-gradient">10,000+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">500+</p>
                  <p className="text-sm text-muted-foreground">Expert Tailors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gradient">50,000+</p>
                  <p className="text-sm text-muted-foreground">Orders Completed</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gold-500/20 to-primary/20 p-8 flex items-center justify-center">
                <div className="text-6xl">👔</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient">Why Choose TailorConnect?</h2>
            <p className="text-xl text-muted-foreground">Everything you need for perfect custom clothing</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tailors Section */}
      <section id="tailors" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient">Featured Tailors</h2>
            <p className="text-xl text-muted-foreground">Meet our top-rated expert tailors</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.tailors.slice(0, 6).map((tailor, index) => (
              <motion.div
                key={tailor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                      {getInitials(tailor.name)}
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-1">{tailor.name}</h3>
                    <p className="text-sm text-muted-foreground text-center mb-3">{tailor.specialty}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {'★'.repeat(5)}
                      <span className="ml-2 font-semibold">{tailor.rating}</span>
                    </div>
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{tailor.orders}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{tailor.experience}</p>
                        <p className="text-xs text-muted-foreground">Experience</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" onClick={() => navigate('/tailors')}>
              View All Tailors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gradient">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Real experiences from real people</p>
          </motion.div>
          <div className="max-w-3xl mx-auto relative">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <Button variant="ghost" size="icon" onClick={prevTestimonial}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextTestimonial}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <p className="text-lg italic text-muted-foreground mb-6 text-center">
                  "{testimonials[testimonialIndex]?.text}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-bold">
                    {testimonials[testimonialIndex] && getInitials(testimonials[testimonialIndex].name)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonials[testimonialIndex]?.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[testimonialIndex]?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-gold-600 to-gold-500 text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-4xl font-serif font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of satisfied customers and expert tailors today
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/signup')}
                  className="bg-white text-gold-600 hover:bg-gray-100"
                >
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

