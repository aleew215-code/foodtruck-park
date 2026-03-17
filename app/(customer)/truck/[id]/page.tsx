'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, AlertCircle, X } from 'lucide-react'
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

  // Customization modal state
  const [customItem, setCustomItem] = useState<MenuItem | null>(null)
  const [customQty, setCustomQty] = useState(1)
  const [customMods, setCustomMods] = useState<string[]>([])

  const MOD_OPTIONS = [
    { label: 'No onions',    emoji: '🧅' },
    { label: 'No tomatoes',  emoji: '🍅' },
    { label: 'No lettuce',   emoji: '🥬' },
    { label: 'No sauce',     emoji: '🫙' },
    { label: 'No salt',      emoji: '🧂' },
    { label: 'Extra cheese', emoji: '🧀' },
    { label: 'Extra sauce',  emoji: '➕' },
    { label: 'Extra meat',   emoji: '🥩' },
    { label: 'Extra guac',   emoji: '🥑' },
    { label: 'Extra spicy',  emoji: '🌶️' },
    { label: 'Mild',         emoji: '😊' },
    { label: 'Well done',    emoji: '🍳' },
    { label: 'Gluten-free',  emoji: '🌿' },
    { label: 'No bread',     emoji: '🚫' },
  ]

  function toggleMod(label: string) {
    setCustomMods(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    )
  }

  useEffect(() => {
    fetch(`/api/trucks/${id}`)
      .then(r => r.json())
      .then(data => { setTruck(data); setLoading(false) })
  }, [id])

  const cartItems = items.filter(i => i.foodTruckId === id as string)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  function getCartQuantity(itemId: string) {
    return cartItems.filter(i => i.menuItemId === itemId).reduce((s, i) => s + i.quantity, 0)
  }

  function openCustomize(item: MenuItem) {
    setCustomItem(item)
    setCustomQty(1)
    setCustomMods([])
  }

  function confirmAdd() {
    if (!customItem || !truck) return
    addItem({
      id: `${customItem.id}-${Date.now()}`,
      foodTruckId: id as string,
      foodTruckName: truck.name,
      menuItemId: customItem.id,
      name: customItem.name,
      price: customItem.price,
      quantity: customQty,
      notes: customMods.length > 0 ? customMods.join(', ') : undefined,
      image: customItem.image || undefined,
    })
    setCustomItem(null)
  }

  function handleRemove(item: MenuItem) {
    const cartItem = [...cartItems].reverse().find(i => i.menuItemId === item.id)
    if (cartItem) {
      if (cartItem.quantity > 1) updateQuantity(cartItem.id, id as string, cartItem.quantity - 1)
      else removeItem(cartItem.id, id as string)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
  if (!truck) return (
    <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.40)' }}>
      Food truck not found
    </div>
  )

  const allItems = [...truck.uncategorized, ...truck.categories.flatMap(c => c.items)]

  return (
    <div className="max-w-3xl mx-auto ag-page-enter" style={{ paddingBottom: cartItems.length > 0 ? '96px' : '0' }}>

      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm mb-4 transition"
        style={{ color: 'rgba(255,255,255,0.45)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      {/* ── Hero Header ──────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-5"
        style={{ height: '220px' }}
      >
        {/* Background gradient fallback */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(251,191,36,0.12) 100%)',
          }}
        />

        {/* Cover image */}
        {(truck.coverImage || truck.logo) && (
          <Image
            src={truck.coverImage || truck.logo!}
            alt={truck.name}
            fill
            className="object-cover"
          />
        )}

        {/* Dark-to-transparent top overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(12,10,7,0.40) 0%, transparent 40%, rgba(12,10,7,0.75) 100%)' }}
        />

        {/* Badges row */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant={truck.isOpen ? 'success' : 'destructive'}>
            {truck.isOpen ? 'Open' : 'Closed'}
          </Badge>
          {truck.tableServiceEnabled && (
            <Badge variant="secondary" className="bg-white/15 text-white border-0 backdrop-blur-sm">
              Table Service
            </Badge>
          )}
        </div>

        {/* Truck info bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
            {truck.name}
          </h1>
          {truck.cuisine && (
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>
              {truck.cuisine}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────── */}
      <div
        className="ag-glass rounded-2xl px-4 py-3 flex items-center gap-5 mb-5"
      >
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-sm text-white">
            {truck.rating > 0 ? truck.rating.toFixed(1) : 'New'}
          </span>
          {truck.totalRatings > 0 && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              ({truck.totalRatings})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-orange-400" />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>
            {truck.avgPrepTime} min
          </span>
        </div>
        {truck.description && (
          <p
            className="text-xs ml-auto text-right line-clamp-2 max-w-[55%]"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            {truck.description}
          </p>
        )}
      </div>

      {/* ── Promotions ───────────────────────────────────────── */}
      {truck.promotions.filter(p => p.isActive).map(promo => (
        <div
          key={promo.id}
          className="ag-glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-4"
          style={{ borderLeft: '3px solid rgba(249,115,22,0.70)' }}
        >
          <span className="text-xl shrink-0">🎉</span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{promo.name}</p>
            {promo.description && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {promo.description}
              </p>
            )}
          </div>
          <Badge className="ml-auto shrink-0">
            {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
          </Badge>
        </div>
      ))}

      {/* ── Category Tabs ─────────────────────────────────────── */}
      {truck.categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {['all', ...truck.categories.map(c => c.id), ...(truck.combos.length > 0 ? ['combos'] : [])].map(catId => {
            const isActive = activeCategory === catId
            const label = catId === 'all'
              ? 'All'
              : catId === 'combos'
              ? 'Combos'
              : truck.categories.find(c => c.id === catId)?.name ?? catId
            return (
              <button
                key={catId}
                onClick={() => setActiveCategory(catId)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ag-press"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #f97316, #ea6c00)'
                    : 'rgba(255,255,255,0.06)',
                  border: isActive
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.09)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  boxShadow: isActive ? '0 0 14px rgba(249,115,22,0.35)' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Menu Items ───────────────────────────────────────── */}
      <div className="space-y-3">
        {(
          activeCategory === 'all'
            ? allItems
            : activeCategory === 'combos'
            ? []
            : truck.categories.find(c => c.id === activeCategory)?.items || []
        ).filter(item => item.isAvailable).map(item => {
          const qty = getCartQuantity(item.id)
          return (
            <div
              key={item.id}
              className="ag-glass ag-glass-hover-lg rounded-2xl p-4 flex gap-4"
            >
              {/* Item image */}
              {item.image && (
                <div className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white truncate">{item.name}</h3>
                      {item.isPopular && (
                        <Badge variant="warning" className="text-[10px] shrink-0">Popular</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.42)' }}>
                        {item.description}
                      </p>
                    )}
                    {item.allergens.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="text-xs" style={{ color: 'rgba(251,191,36,0.80)' }}>
                          {item.allergens.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className="font-extrabold text-base shrink-0"
                    style={{ color: '#f97316' }}
                  >
                    {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Add / Qty controls */}
                <div className="flex items-center justify-end mt-3">
                  {qty === 0 ? (
                    <button
                      onClick={() => truck.isOpen && openCustomize(item)}
                      disabled={!truck.isOpen}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white ag-glow-btn ag-press disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea6c00)',
                        boxShadow: '0 0 18px rgba(249,115,22,0.35)',
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(item)}
                        className="h-8 w-8 rounded-full flex items-center justify-center ag-press transition"
                        style={{
                          background: 'rgba(249,115,22,0.12)',
                          border: '1.5px solid rgba(249,115,22,0.45)',
                          color: '#f97316',
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center font-extrabold text-white">{qty}</span>
                      <button
                        onClick={() => openCustomize(item)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white ag-press transition"
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ea6c00)',
                          boxShadow: '0 0 12px rgba(249,115,22,0.40)',
                        }}
                      >
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
          <div key={combo.id} className="ag-glass ag-glass-hover-lg rounded-2xl p-4 flex gap-4">
            {combo.image && (
              <div className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0">
                <Image src={combo.image} alt={combo.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{combo.name}</h3>
                    <Badge variant="secondary">Combo</Badge>
                  </div>
                  {combo.description && (
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {combo.description}
                    </p>
                  )}
                </div>
                <span className="font-extrabold text-base shrink-0" style={{ color: '#f97316' }}>
                  {formatCurrency(combo.price)}
                </span>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    addItem({
                      id: combo.id,
                      foodTruckId: id as string,
                      foodTruckName: truck.name,
                      comboId: combo.id,
                      name: combo.name,
                      price: combo.price,
                      quantity: 1,
                    })
                  }}
                  disabled={!truck.isOpen}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white ag-glow-btn ag-press disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c00)' }}
                >
                  <Plus className="h-4 w-4" />
                  Add Combo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky Cart Footer ───────────────────────────────── */}
      {cartItems.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 p-4 ag-bottom-nav"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <div className="max-w-3xl mx-auto">
            <Link href="/cart">
              <Button
                className="w-full h-13 text-base"
                style={{ height: '52px' }}
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  View Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
                <span className="ml-auto font-extrabold">{formatCurrency(cartTotal)}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Customization Modal (dark glass bottom sheet) ─────── */}
      {customItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setCustomItem(null) }}
        >
          <div
            className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden animate-fadeIn"
            style={{
              background: 'rgba(20,15,10,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Modal header */}
            <div className="relative">
              {customItem.image ? (
                <div className="relative h-52 w-full">
                  <Image src={customItem.image} alt={customItem.name} fill className="object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(20,15,10,0.90) 0%, transparent 60%)' }}
                  />
                  <div className="absolute bottom-4 left-5 right-12">
                    <h3 className="text-xl font-extrabold text-white">{customItem.name}</h3>
                    <p className="font-bold mt-0.5" style={{ color: '#f97316' }}>
                      {formatCurrency(customItem.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-5 pt-5 pb-3 pr-12">
                  <h3 className="text-xl font-extrabold text-white">{customItem.name}</h3>
                  <p className="font-bold mt-0.5" style={{ color: '#f97316' }}>
                    {formatCurrency(customItem.price)}
                  </p>
                </div>
              )}
              {/* Close button */}
              <button
                onClick={() => setCustomItem(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition ag-press"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {customItem.description && (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {customItem.description}
                </p>
              )}

              {/* Allergens */}
              {customItem.allergens.length > 0 && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}
                >
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-medium" style={{ color: 'rgba(251,191,36,0.90)' }}>
                    Contains: {customItem.allergens.join(', ')}
                  </span>
                </div>
              )}

              {/* Modifications */}
              <div>
                <p className="text-sm font-bold text-white mb-2.5">
                  Customize{' '}
                  <span className="font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    (optional)
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOD_OPTIONS.map(mod => {
                    const active = customMods.includes(mod.label)
                    return (
                      <button
                        key={mod.label}
                        onClick={() => toggleMod(mod.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ag-press"
                        style={{
                          background: active ? 'rgba(249,115,22,0.20)' : 'rgba(255,255,255,0.05)',
                          border: active ? '1.5px solid rgba(249,115,22,0.65)' : '1px solid rgba(255,255,255,0.10)',
                          color: active ? '#f97316' : 'rgba(255,255,255,0.60)',
                          transform: active ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        <span>{mod.emoji}</span>
                        <span>{mod.label}</span>
                      </button>
                    )
                  })}
                </div>
                {customMods.length > 0 && (
                  <p className="text-xs mt-2 font-medium" style={{ color: 'rgba(249,115,22,0.80)' }}>
                    ✓ {customMods.join(' · ')}
                  </p>
                )}
              </div>

              {/* Quantity + Add */}
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  <button
                    onClick={() => setCustomQty(q => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition ag-press"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      color: 'rgba(255,255,255,0.70)',
                    }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-extrabold text-white">{customQty}</span>
                  <button
                    onClick={() => setCustomQty(q => q + 1)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white transition ag-press"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea6c00)',
                      boxShadow: '0 0 10px rgba(249,115,22,0.40)',
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button onClick={confirmAdd} className="flex-1 h-11 text-base font-bold" size="lg">
                  Add{customQty > 1 ? ` ${customQty} ×` : ''} {formatCurrency(customItem.price * customQty)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
