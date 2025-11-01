import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockData } from '@/utils/mockData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatNumber } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function TailorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tailor, setTailor] = useState<any | null>(null)
  const { currentUser, addFavorite, removeFavorite, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('fav-tailors') || '[]') } catch { return [] }
  })

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const favs = Array.isArray((currentUser as any).favorites) ? (currentUser as any).favorites : []
      setFavorites(favs)
    }
  }, [currentUser, isAuthenticated])

  useEffect(() => {
    if (!id) return
    const t = mockData.tailors.find((x: any) => String(x.id) === String(id))
    setTailor(t || null)
  }, [id])

  if (!tailor) return (
    <div className="container py-12">Tailor not found</div>
  )

  const toggleFavorite = async () => {
    if (favorites.includes(tailor.id)) {
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
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>{tailor.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div>
              <Avatar className="w-28 h-28">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${tailor.name}&background=FFD700&color=000`} />
                <AvatarFallback>{getInitials(tailor.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground">{tailor.specialty} • {tailor.location}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="font-semibold">{tailor.rating} ★</div>
                <div className="text-sm text-muted-foreground">{formatNumber(tailor.orders)} orders • {tailor.experience} experience</div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {(tailor.services || []).map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-muted rounded text-sm">{s}</span>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Recent Work</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <img key={i} src={`https://picsum.photos/seed/${tailor.id}-${i}/400/300`} alt={`Work ${i+1}`} className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              </div>

              {/* Testimonials (demo) */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">What customers say</h4>
                <div className="space-y-3">
                  {mockData.testimonials.slice(0,3).map(t => (
                    <div key={t.id} className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                      <div className="font-medium">{t.name}</div>
                      <p className="text-sm mt-1">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => navigate('/new-order', { state: { tailorId: tailor.id } })} className="bg-gradient-to-r from-gold-600 to-gold-500">Request Tailor</Button>
                <Button variant="outline" onClick={toggleFavorite}>{favorites.includes(tailor.id) ? 'Unfavorite' : 'Favorite'}</Button>
                <Button variant="ghost" onClick={() => navigate('/chat', { state: { tailorId: tailor.id } })}>Message</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
