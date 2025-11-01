import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth, isDemo } from '@/utils/firebaseConfig'
import { USER_ROLES } from '@/lib/constants'
import toast from 'react-hot-toast'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: typeof USER_ROLES.CUSTOMER | typeof USER_ROLES.TAILOR | typeof USER_ROLES.ADMIN
  avatar?: string
  location?: string
  [key: string]: any
}

interface AuthContextType {
  currentUser: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  addFavorite?: (tailorId: number) => Promise<void>
  removeFavorite?: (tailorId: number) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      
  if (user) {
        // Load user data from localStorage (or fetch from Firestore in production)
        const stored = localStorage.getItem('currentUser')
        if (stored) {
          try {
            const userData = JSON.parse(stored)
            setCurrentUser(userData)
          } catch (error) {
            console.error('Failed to parse stored user:', error)
            // Create default user from Firebase user
            setCurrentUser({
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: USER_ROLES.CUSTOMER,
            })
          }
        } else {
          // Create default user from Firebase user
          setCurrentUser({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: USER_ROLES.CUSTOMER,
          })
        }
      } else {
        setCurrentUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Seed demo data (orders/chats) into localStorage if not present
  useEffect(() => {
    try {
      const orders = localStorage.getItem('orders')
      const chatsSeeded = localStorage.getItem('chats-seeded')
      if (!orders) {
        // lazy import to avoid circular deps
        ;(async () => {
          try {
            const mod = await import('@/utils/mockData')
            const mockData = mod.mockData
            if (mockData?.orders) {
              localStorage.setItem('orders', JSON.stringify(mockData.orders))
            }
          } catch (e) {
            // ignore
          }
        })()
      }
      if (!chatsSeeded) {
        ;(async () => {
          try {
            const mod = await import('@/utils/mockData')
            const mockData = mod.mockData
            if (mockData?.messages) {
              mockData.messages.forEach((m: any) => {
                const key = `chat-${m.chatId}`
                const list = JSON.parse(localStorage.getItem(key) || '[]')
                list.push(m)
                localStorage.setItem(key, JSON.stringify(list))
              })
            }
            localStorage.setItem('chats-seeded', '1')
          } catch (e) {
            // ignore
          }
        })()
      }
    } catch (e) {
      // ignore seeding errors
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // First, check local accounts created via signup
      const raw = localStorage.getItem('local-accounts')
      if (raw) {
        try {
          const accounts = JSON.parse(raw)
          const acc = accounts[email]
          if (acc && acc.password === password) {
            const userData: User = {
              id: String(acc.id),
              name: acc.name,
              email,
              role: acc.role,
              phone: acc.phone,
              avatar: acc.avatar,
              location: acc.location,
            }
            setCurrentUser(userData)
            localStorage.setItem('currentUser', JSON.stringify(userData))
            toast.success('Login successful (local)')
            return
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      // If Firebase is configured and not in demo mode, try Firebase auth
      if (!isDemo) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        // Load user data
        const stored = localStorage.getItem('currentUser')
        if (stored) {
          const userData = JSON.parse(stored)
          setCurrentUser(userData)
        } else {
          setCurrentUser({
            id: userCredential.user.uid,
            name: userCredential.user.displayName || email.split('@')[0],
            email: email,
            role: USER_ROLES.CUSTOMER,
          })
        }
        toast.success('Login successful!')
        return
      }

      // No matching account found
      throw new Error('No account found. Please sign up first.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
      throw error
    }
  }

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      // Always create a local account for offline/demo usage
      const accountsRaw = localStorage.getItem('local-accounts')
      let accounts: Record<string, any> = {}
      try { accounts = accountsRaw ? JSON.parse(accountsRaw) : {} } catch { accounts = {} }
      if (accounts[email]) throw new Error('Account already exists')
      const id = `local-${Date.now()}`
      accounts[email] = { id, password, name, role }
      localStorage.setItem('local-accounts', JSON.stringify(accounts))
      toast.success('Account created locally. Please sign in.')
      return
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
      throw error
    }
  }

  const logout = async () => {
    try {
      if (!isDemo) {
        await firebaseSignOut(auth)
      }
      setCurrentUser(null)
      localStorage.removeItem('currentUser')
      toast.success('Logged out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout')
      throw error
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...userData }
      setCurrentUser(updated)
      localStorage.setItem('currentUser', JSON.stringify(updated))
    }
  }

  // Favorites management for authenticated users (persist locally and try Firestore)
  const addFavorite = async (tailorId: number) => {
    if (!currentUser) return
    const favs: number[] = (currentUser.favorites && Array.isArray(currentUser.favorites)) ? currentUser.favorites : []
    if (!favs.includes(tailorId)) {
      const updatedFavs = [...favs, tailorId]
      updateUser({ favorites: updatedFavs })
      // Attempt to persist to Firestore if configured
      try {
        const firestore = await import('firebase/firestore')
        const fc = await import('@/utils/firebaseConfig')
        const { getFirestore, doc, setDoc } = firestore
        const db = getFirestore(fc.app)
        const userDoc = doc(db, 'users', currentUser.id)
        await setDoc(userDoc, { favorites: updatedFavs }, { merge: true })
      } catch (e) {
        // ignore Firestore errors in demo mode
      }
    }
  }

  const removeFavorite = async (tailorId: number) => {
    if (!currentUser) return
    const favs: number[] = (currentUser.favorites && Array.isArray(currentUser.favorites)) ? currentUser.favorites : []
    if (favs.includes(tailorId)) {
      const updatedFavs = favs.filter(id => id !== tailorId)
      updateUser({ favorites: updatedFavs })
      try {
        const firestore = await import('firebase/firestore')
        const fc = await import('@/utils/firebaseConfig')
        const { getFirestore, doc, setDoc } = firestore
        const db = getFirestore(fc.app)
        const userDoc = doc(db, 'users', currentUser.id)
        await setDoc(userDoc, { favorites: updatedFavs }, { merge: true })
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        login,
        signup,
        logout,
        updateUser,
        addFavorite,
        removeFavorite,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
