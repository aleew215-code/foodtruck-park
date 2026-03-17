'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Star, Clock, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { TiltCard } from '@/components/ui/tilt-card'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import Link from 'next/link'

interface FoodTruck {
  id: string
  name: string
  description: string | null
  logo: string | null
  cuisine: string | null
  rating: number
  totalRatings: number
  avgPrepTime: number
  isOpen: boolean
  tableServiceEnabled: boolean
}

/* Floating food emojis — purely decorative */
const FLOATERS = ['🌮', '🍔', '🌯', '🍕', '🥙', '🍜']

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const { setTableNumber, tableNumber } = useCart()
  const [trucks, setTrucks] = useState<FoodTruck[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tableInput, setTableInput] = useState<string>('')
  const [showTableBanner, setShowTableBanner] = useState(false)

  /* ── All original logic preserved unchanged ──────────────── */
  useEffect(() => {
    const table = searchParams.get('table')
    if (table) {
      const num = parseInt(table)
      if (!isNaN(num)) {
        setTableNumber(num)
        setTableInput(String(num))
        setShowTableBanner(true)
      }
    } else if (tableNumber) {
      setTableInput(String(tableNumber))
      setShowTableBanner(true)
    }
  }, [searchParams])

  useEffect(() => {
    fetch('/api/trucks')
      .then(r => r.json())
      .then(data => { setTrucks(data); setLoading(false) })
  }, [])

  const filtered = trucks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.cuisine || '').toLowerCase().includes(search.toLowerCase())
  )

  function handleTableUpdate() {
    const num = parseInt(tableInput)
    if (!isNaN(num) && num > 0) {
      setTableNumber(num)
      setShowTableBanner(true)
    }
  }
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8">

      {/* ── Table banner ─────────────────────────────────────── */}
      {showTableBanner && tableNumber ? (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 ag-glass"
          style={{ borderColor: 'rgba(249,115,22,0.28)', boxShadow: '0 0 30px rgba(249,115,22,0.07)' }}
        >
          <QrCode className="h-5 w-5 text-orange-400 shrink-0 ag-float" />
          <span className="text-sm font-medium" style={{ color: '#fba06a' }}>
            Ordering for Table <strong className="text-orange-400">{tableNumber}</strong>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Input
              value={tableInput}
              onChange={e => setTableInput(e.target.value)}
              className="w-20 h-8 text-sm ag-input"
              placeholder="Table #"
            />
            <button
              onClick={handleTableUpdate}
              className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg ag-glow-btn hover:bg-orange-600 transition"
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 ag-glass"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <QrCode className="h-5 w-5 shrink-0" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            At a table? Enter your table number:
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Input
              value={tableInput}
              onChange={e => setTableInput(e.target.value)}
              className="w-20 h-8 text-sm ag-input"
              placeholder="Table #"
            />
            <button
              onClick={handleTableUpdate}
              className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg ag-glow-btn hover:bg-orange-600 transition"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative pt-2 pb-1 overflow-hidden">
        {/* Floating food emojis — desktop only */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 hidden lg:flex items-center gap-8 select-none pointer-events-none"
          style={{ opacity: 0.18 }}
        >
          {FLOATERS.map((emoji, i) => (
            <span
              key={i}
              className="text-4xl"
              style={{
                animation: `ag-float ${5 + i * 0.6}s ease-in-out ${i * 0.7}s infinite`,
                display: 'block',
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'rgba(249,115,22,0.85)' }}>
          <MapPin className="h-4 w-4" />
          <span className="font-medium tracking-wide uppercase text-xs">FoodTruck Park</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight ag-gradient-text leading-tight">
          Food Trucks Near You
        </h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
          Order from multiple trucks, delivered to your table
        </p>
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: 'rgba(255,255,255,0.28)' }} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search food trucks or cuisines…"
          className="pl-10 ag-input h-11 rounded-xl"
        />
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <span className="text-6xl ag-float-slow">🚚</span>
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <div className="text-6xl mb-4 ag-float-slow">🚚</div>
          <p className="font-semibold text-lg">No food trucks found</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Try a different search</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((truck, index) => (
            <Link key={truck.id} href={`/truck/${truck.id}`}>
              <TiltCard
                className="group ag-glass ag-glass-hover rounded-2xl overflow-hidden ag-card-rise"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Cover image */}
                <div
                  className="relative h-44 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.22) 0%, rgba(251,191,36,0.10) 100%)',
                  }}
                >
                  {truck.logo && (
                    <Image
                      src={truck.logo}
                      alt={truck.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Closed overlay */}
                  {!truck.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                      <span
                        className="text-xs font-bold px-4 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
                      >
                        Closed
                      </span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={truck.isOpen ? 'success' : 'secondary'}>
                      {truck.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>

                  {/* Gradient fade at bottom for text legibility */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-14"
                    style={{ background: 'linear-gradient(to top, rgba(12,10,7,0.85), transparent)' }}
                  />
                </div>

                {/* Info */}
                <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        className="font-bold text-white group-hover:text-orange-400 transition truncate"
                      >
                        {truck.name}
                      </h3>
                      {truck.cuisine && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                          {truck.cuisine}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 shrink-0 rounded-lg px-2 py-1" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.20)' }}>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-300">
                        {truck.rating > 0 ? truck.rating.toFixed(1) : 'New'}
                      </span>
                      {truck.totalRatings > 0 && (
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                          ({truck.totalRatings})
                        </span>
                      )}
                    </div>
                  </div>

                  {truck.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {truck.description}
                    </p>
                  )}

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 pt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5 text-orange-400" />
                      <span>{truck.avgPrepTime} min</span>
                    </div>
                    {truck.tableServiceEnabled && (
                      <span className="flex items-center gap-1 text-xs">
                        🪑 <span>Table service</span>
                      </span>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
