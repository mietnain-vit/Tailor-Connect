import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from './ui/button'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { currentUser, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              TC
            </div>
            <span className="text-2xl font-serif font-bold text-gradient">TailorConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/tailors" className="text-sm font-medium hover:text-primary transition-colors">
              Find Tailors
            </Link>
            <Link to="/favorites" className="text-sm font-medium hover:text-primary transition-colors">
              Favorites
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-4"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="ml-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-xs font-semibold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </div>
                </Button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg"
                    >
                      <div className="p-4 border-b">
                        <p className="text-sm font-semibold">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" className="bg-gradient-to-r from-gold-600 to-gold-500" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/tailors" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Find Tailors
              </Link>
              <Link to="/favorites" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Favorites
              </Link>
              <Link to="/about" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-destructive">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

