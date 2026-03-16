'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  isAvailable: boolean
  isPopular: boolean
  allergens: string[]
  categoryId: string | null
}

interface Category {
  id: string
  name: string
  items: MenuItem[]
}

interface TruckDetail {
  id: string
  name: string
  description: string | null
  logo: string | null
  coverImage: string | null
  cuisine: string | null
  rating: number
  totalRatings: number
  avgPrepTime: number
  isOpen: boolean
  tableServiceEnabled: boolean
  categories: Category[]
  uncategorized: MenuItem[]
  combos: any[]
  promotions: any[]
}

export default function TruckMenuPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const { addItem, items, updateQuantity, removeItem } = useCart()
  const [truck, setTruck] = useState<TruckDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch(`/api/trucks/${id}`)
      .then(r => r.json())
      .then(data => { setTruck(data); setLoading(false) })
  }, [id])

  const cartItems = items.filter(i => i.foodTruckId === id as string)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  function getCartQuantity(itemId: string) {
    return cartItems.find(i => i.menuItemId === itemId)?.quantity || 0
  }

  function handleAdd(item: MenuItem) {
    addItem({ id: item.id, foodTruckId: id as string, foodTruckName: truck!.name, menuItemId: item.id, name: item.name, price: item.price, quantity: 1, image: item.image || undefined })
  }

  function handleRemove(item: MenuItem) {
    const cartItem = cartItems.find(i => i.menuItemId === item.id)
    if (cartItem) {
      if (cartItem.quantity > 1) updateQuantity(item.id, id as string, cartItem.quantity - 1)
      else removeItem(item.id, id as string)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!truck) return <div className="text-center py-20 text-gray-500">Food truck not found</div>

  const allItems = [...truck.uncategorized, ...truck.categories.flatMap(c => c.items)]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50 h-48 mb-6">
        {(truck.coverImage || truck.logo) && (
          <Image src={truck.coverImage || truck.logo!} alt={truck.name} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={truck.isOpen ? 'success' : 'destructive'}>{truck.isOpen ? 'Open' : 'Closed'}</Badge>
            {truck.tableServiceEnabled && <Badge variant="secondary" className="bg-white/20 text-white border-0">Table Service</Badge>}
          </div>
          <h1 className="text-2xl font-bold">{truck.name}</h1>
          {truck.cuisine && <p className="text-sm text-white/80">{truck.cuisine}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{truck.rating > 0 ? truck.rating.toFixed(1) : 'No ratings yet'}</span>
          {truck.totalRatings > 0 && <span className="text-gray-400">({truck.totalRatings})</span>}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{truck.avgPrepTime} min prep time</span>
        </div>
      </div>

      {truck.description && <p className="text-gray-600 mb-6">{truck.description}</p>}

      {/* Promotions */}
      {truck.promotions.filter(p => p.isActive).map(promo => (
        <div key={promo.id} className="mb-4 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-semibold text-orange-800 text-sm">{promo.name}</p>
            {promo.description && <p className="text-xs text-orange-600">{promo.description}</p>}
          </div>
          <Badge className="ml-auto">
            {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
          </Badge>
        </div>
      ))}

      {/* Category tabs */}
      {truck.categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button onClick={() => setActiveCategory('all')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
          {truck.categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
          ))}
          {truck.combos.length > 0 && <button onClick={() => setActiveCategory('combos')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === 'combos' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Combos</button>}
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-3">
        {(activeCategory === 'all' ? allItems : activeCategory === 'combos' ? [] : truck.categories.find(c => c.id === activeCategory)?.items || []).filter(item => item.isAvailable).map(item => {
          const qty = getCartQuantity(item.id)
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              {item.image && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.isPopular && <Badge variant="warning" className="text-[10px]">Popular</Badge>}
                    </div>
                    {item.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                    {item.allergens.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-600">{item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">{formatCurrency(item.price)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div />
                  {qty === 0 ? (
                    <button onClick={() => handleAdd(item)} disabled={!truck.isOpen} className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRemove(item)} className="h-8 w-8 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{qty}</span>
                      <button onClick={() => handleAdd(item)} className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Combos */}
        {activeCategory === 'combos' && truck.combos.filter(c => c.isAvailable).map(combo => (
          <div key={combo.id} className="bg-white rounded-xl border border-orange-100 p-4 flex gap-4">
            {combo.image && (
              <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
                <Image src={combo.image} alt={combo.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{combo.name}</h3>
                    <Badge variant="secondary">Combo</Badge>
                  </div>
                  {combo.description && <p className="text-sm text-gray-500 mt-0.5">{combo.description}</p>}
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(combo.price)}</span>
              </div>
              <button onClick={() => { addItem({ id: combo.id, foodTruckId: id as string, foodTruckName: truck.name, comboId: combo.id, name: combo.name, price: combo.price, quantity: 1 }); }} disabled={!truck.isOpen} className="mt-3 flex items-center gap-1.5 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50">
                <Plus className="h-4 w-4" /> Add Combo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sticky Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg z-30">
          <div className="max-w-3xl mx-auto">
            <Link href="/cart">
              <Button className="w-full flex items-center justify-between h-12 text-base">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  View Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
                <span>{formatCurrency(cartTotal)}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
