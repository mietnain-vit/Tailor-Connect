import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// demo features removed
import toast from 'react-hot-toast'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: yup.string().oneOf(['customer', 'tailor']).required(),
})

type LoginFormData = yup.InferType<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'customer' | 'tailor'>('customer')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'customer',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      // Prefer role from authenticated user; fallback to selected role from form
      const role = (currentUser && (currentUser as any).role) || data.role
      if (role === 'tailor') navigate('/tailor-dashboard')
      else navigate('/dashboard')
    } catch (error) {
      // Error handled by AuthContext
    }
  }

  // demo features removed; use signup/login flow with local accounts

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-serif">Welcome Back</CardTitle>
            <CardDescription>Sign in to your TailorConnect account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={role === 'customer' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('customer')}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={role === 'tailor' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('tailor')}
              >
                Tailor
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('role')} value={role} />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* demo features removed */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
