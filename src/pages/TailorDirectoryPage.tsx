import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Star, Filter, SlidersHorizontal, X, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/useDebounce'
import { mockData } from '@/utils/mockData'
import { getInitials, formatNumber } from '@/lib/utils'
import { LazyImage } from '@/components/LazyImage'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Tailor {
  id: number
  name: string
  specialty: string
  rating: number
  location: string
  orders: number
  experience: string
  services?: string[]
  priceFrom?: number
  available?: boolean
}

export default function TailorDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState<string[]>([])
  const [filterSpecialty, setFilterSpecialty] = useState<string[]>([])
  const [minRating, setMinRating] = useState([0])
  const [dressType, setDressType] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const { currentUser, addFavorite, removeFavorite, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('fav-tailors') || '[]') } catch { return [] }
  })

  // keep favorites in sync with authenticated user profile
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const favs = Array.isArray((currentUser as any).favorites) ? (currentUser as any).favorites : []
      setFavorites(favs)
      try { localStorage.setItem('fav-tailors', JSON.stringify(favs)) } catch {}
    }
  }, [currentUser, isAuthenticated])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()

  const debouncedSearch = useDebounce(searchTerm, 300)
  const [userTailors, setUserTailors] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('user-tailors') || '[]') } catch { return [] }
  })

  useEffect(() => {
    const handler = () => setUserTailors(JSON.parse(localStorage.getItem('user-tailors') || '[]'))
    window.addEventListener('tailor-updated', handler as EventListener)
    window.addEventListener('storage', handler as EventListener)
    return () => {
      window.removeEventListener('tailor-updated', handler as EventListener)
      window.removeEventListener('storage', handler as EventListener)
    }
  }, [])

  const allTailors = [...mockData.tailors, ...userTailors]

  const locations = Array.from(new Set(allTailors.map(t => t.location)))
  const specialties = Array.from(new Set(allTailors.map(t => t.specialty)))
  const dressTypes = ['Shirt','Suit','Dress','Traditional Wear','Wedding Attire','Casual Wear','Designer Wear','Ethnic Fashion']

  const filteredTailors = useMemo(() => {
  let list = allTailors.filter(tailor => {
      const matchesSearch = 
        tailor.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tailor.specialty.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tailor.location.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      const matchesLocation = 
        filterLocation.length === 0 || filterLocation.includes(tailor.location)
      
      const matchesSpecialty = 
        filterSpecialty.length === 0 || filterSpecialty.includes(tailor.specialty)
      
      const matchesRating = tailor.rating >= minRating[0]

      return matchesSearch && matchesLocation && matchesSpecialty && matchesRating
    })

    // Dress type filter: match by services or specialty
    if (dressType) {
      list = list.filter(t => (t.services || []).some((s: string) => s.toLowerCase().includes(dressType.toLowerCase())) || t.specialty.toLowerCase().includes(dressType.toLowerCase()))
    }

    // Sorting
    if (sortBy === 'rating') list = list.sort((a,b) => b.rating - a.rating)
    if (sortBy === 'orders') list = list.sort((a,b) => b.orders - a.orders)
    if (sortBy === 'price') list = list.sort((a,b) => (a.priceFrom || 0) - (b.priceFrom || 0))

    return list
  }, [debouncedSearch, filterLocation, filterSpecialty, minRating, dressType, sortBy])

  const toggleLocation = (location: string) => {
    setFilterLocation(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const toggleSpecialty = (specialty: string) => {
    setFilterSpecialty(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const clearFilters = () => {
    setFilterLocation([])
    setFilterSpecialty([])
    setMinRating([0])
    setSearchTerm('')
  }

  const hasActiveFilters = filterLocation.length > 0 || filterSpecialty.length > 0 || minRating[0] > 0

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-gradient">
          Our Expert Tailors
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left text-muted-foreground text-lg">
            Discover skilled professionals ready to bring your vision to life
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/favorites')}>Favorites</Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, specialty, or location..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select value={dressType} onChange={(e) => setDressType(e.target.value)} className="px-3 py-2 border rounded">
                  <option value="">All dress types</option>
                  {dressTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded">
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="orders">Orders</option>
                  <option value="price">Price (low → high)</option>
                </select>

                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                          {filterLocation.length + filterSpecialty.length + (minRating[0] > 0 ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Filters</h3>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Clear
                          </Button>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium mb-3 block">Minimum Rating</label>
                        <div className="px-2">
                          <Slider
                            value={minRating}
                            onValueChange={setMinRating}
                            max={5}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>0</span>
                            <span className="font-semibold">{minRating[0].toFixed(1)}</span>
                            <span>5.0</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium mb-3 block">Location</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {locations.map(location => (
                            <div key={location} className="flex items-center space-x-2">
                              <Checkbox
                                id={`location-${location}`}
                                checked={filterLocation.includes(location)}
                                onCheckedChange={() => toggleLocation(location)}
                              />
                              <label
                                htmlFor={`location-${location}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {location}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium mb-3 block">Specialty</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {specialties.map(specialty => (
                            <div key={specialty} className="flex items-center space-x-2">
                              <Checkbox
                                id={`specialty-${specialty}`}
                                checked={filterSpecialty.includes(specialty)}
                                onCheckedChange={() => toggleSpecialty(specialty)}
                              />
                              <label
                                htmlFor={`specialty-${specialty}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {specialty}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filterLocation.map(location => (
              <Badge key={location} variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {location}
                <button
                  onClick={() => toggleLocation(location)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filterSpecialty.map(specialty => (
              <Badge key={specialty} variant="secondary" className="gap-1">
                {specialty}
                <button
                  onClick={() => toggleSpecialty(specialty)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {minRating[0] > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {minRating[0].toFixed(1)}+ Rating
                <button
                  onClick={() => setMinRating([0])}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {formatNumber(filteredTailors.length)} tailors
          </p>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Tailors Grid/List */}
      {filteredTailors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-lg text-muted-foreground mb-4">No tailors found</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </motion.div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredTailors.map((tailor, index) => (
            <motion.div
              key={tailor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative h-full hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className={viewMode === 'list' ? 'flex flex-row gap-4 p-6' : 'p-6'}>
                  <div className="absolute right-4 top-4 z-10">
                    <Heart className={`h-5 w-5 ${favorites.includes(tailor.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                  </div>
                  <div className={viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}>
                    <Avatar className="w-20 h-20 mx-auto group-hover:scale-105 transition-transform">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${tailor.name}&background=FFD700&color=000`} />
                      <AvatarFallback className="bg-gradient-to-br from-gold-500 to-gold-600 text-white text-xl">
                        {getInitials(tailor.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className={viewMode === 'list' ? 'flex items-start justify-between' : ''}>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{tailor.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{tailor.specialty}</p>
                      </div>
                      {viewMode === 'list' && (
                        <Badge variant="outline">{tailor.location}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(tailor.rating)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{tailor.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({formatNumber(tailor.orders)} orders)
                      </span>
                    </div>
                    {viewMode === 'grid' && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{tailor.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">{tailor.experience} experience</span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-gold-600 to-gold-500" onClick={() => {
                        // navigate with route state (clean prefill)
                        navigate('/new-order', { state: { tailorId: tailor.id } })
                      }}>
                        Request Tailor
                      </Button>
                      <Button variant="outline" onClick={() => {
                        (async () => {
                          if (favorites.includes(tailor.id)) {
                            // remove
                            if (isAuthenticated && removeFavorite) await removeFavorite(tailor.id)
                            else {
                              const set = new Set(favorites)
                              set.delete(tailor.id)
                              const arr = Array.from(set)
                              setFavorites(arr)
                              try { localStorage.setItem('fav-tailors', JSON.stringify(arr)) } catch(e) {}
                            }
                          } else {
                            if (isAuthenticated && addFavorite) await addFavorite(tailor.id)
                            else {
                              const set = new Set(favorites)
                              set.add(tailor.id)
                              const arr = Array.from(set)
                              setFavorites(arr)
                              try { localStorage.setItem('fav-tailors', JSON.stringify(arr)) } catch(e) {}
                            }
                          }
                        })()
                      }}>
                        {favorites.includes(tailor.id) ? 'Unfavorite' : 'Favorite'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
