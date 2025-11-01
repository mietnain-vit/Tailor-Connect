import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockData } from '@/utils/mockData'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getInitials, formatNumber } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function FavoritesPage() {
  const { currentUser, addFavorite, removeFavorite, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const favs = Array.isArray((currentUser as any).favorites) ? (currentUser as any).favorites : []
      setFavorites(favs)
    } else {
      try { const arr = JSON.parse(localStorage.getItem('fav-tailors') || '[]'); setFavorites(arr) } catch { setFavorites([]) }
    }
  }, [currentUser, isAuthenticated])

  const tailors = mockData.tailors.filter(t => favorites.includes(t.id))

  if (tailors.length === 0) return (
    <div className="container py-12 text-center">
      <p className="text-lg text-muted-foreground mb-4">You don't have any favorite tailors yet.</p>
      <Button onClick={() => navigate('/tailors')}>Browse Tailors</Button>
    </div>
  )

  return (
    <div className="container py-12">
      <h2 className="text-2xl font-semibold mb-6">Your Favorite Tailors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tailors.map(t => (
          <Card key={t.id}>
            <CardContent className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${t.name}&background=FFD700&color=000`} />
                <AvatarFallback>{getInitials(t.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.specialty}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatNumber(t.orders)} orders</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => navigate(`/tailors/${t.id}`)} variant="outline">View</Button>
                  <Button onClick={() => navigate('/new-order', { state: { tailorId: t.id } })} className="bg-gradient-to-r from-gold-600 to-gold-500">Request</Button>
                  <Button variant="ghost" onClick={async () => {
                    if (isAuthenticated && removeFavorite) await removeFavorite(t.id)
                    else {
                      const set = new Set(favorites)
                      set.delete(t.id)
                      const arr = Array.from(set)
                      setFavorites(arr)
                      try { localStorage.setItem('fav-tailors', JSON.stringify(arr)) } catch(e) {}
                    }
                  }}>Remove</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
