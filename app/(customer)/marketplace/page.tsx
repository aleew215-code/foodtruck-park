'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Star, Clock, QrCode, Zap, X, Check } from 'lucide-react'
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

const FLOATERS = ['🌮', '🍔', '🌯', '🍕', '🥙', '🍜']

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const { setTableNumber, tableNumber } = useCart()
  const [trucks, setTrucks] = useState<FoodTruck[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tableInput, setTableInput] = useState<string>('')
  const [showTableBanner, setShowTableBanner] = useState(false)

  // Action button state
  const [activePanel, setActivePanel] = useState<'scan' | 'zip' | null>(null)
  const [zipInput, setZipInput] = useState('')
  const [zipConfirmed, setZipConfirmed] = useState('')

  /* ── All original logic preserved ────────────────────────── */
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

  function handleZipConfirm() {
    if (zipInput.trim().length >= 4) {
      setZipConfirmed(zipInput.trim())
      setActivePanel(null)
    }
  }
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-8 ag-page-enter">

      {/* ── Action Buttons Row ───────────────────────────────── */}
      <div className="relative">
        {/* Two centered buttons */}
        <div className="flex items-center justify-center gap-4">

          {/* Scan QR button */}
          <button
            onClick={() => setActivePanel(activePanel === 'scan' ? null : 'scan')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition ag-press"
            style={{
              background: activePanel === 'scan'
                ? 'linear-gradient(135deg, #f97316, #ea6c00)'
                : 'rgba(249,115,22,0.10)',
              border: activePanel === 'scan'
                ? 'none'
                : '1.5px solid rgba(249,115,22,0.35)',
              color: activePanel === 'scan' ? '#fff' : '#f97316',
              boxShadow: activePanel === 'scan'
                ? '0 0 28px rgba(249,115,22,0.50), 0 4px 16px rgba(0,0,0,0.40)'
                : '0 0 0px transparent',
              minWidth: '148px',
            }}
          >
            <QrCode className="h-4 w-4" />
            Scan QR
          </button>

          {/* Zip code button */}
          <button
            onClick={() => setActivePanel(activePanel === 'zip' ? null : 'zip')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition ag-press"
            style={{
              background: (activePanel === 'zip' || zipConfirmed)
                ? 'linear-gradient(135deg, #f97316, #ea6c00)'
                : 'rgba(249,115,22,0.10)',
              border: (activePanel === 'zip' || zipConfirmed)
                ? 'none'
                : '1.5px solid rgba(249,115,22,0.35)',
              color: (activePanel === 'zip' || zipConfirmed) ? '#fff' : '#f97316',
              boxShadow: (activePanel === 'zip' || zipConfirmed)
                ? '0 0 28px rgba(249,115,22,0.50), 0 4px 16px rgba(0,0,0,0.40)'
                : '0 0 0px transparent',
              minWidth: '148px',
            }}
          >
            <MapPin className="h-4 w-4" />
            {zipConfirmed ? zipConfirmed : 'Zipcode'}
          </button>
        </div>

        {/* ── Scan Panel ─────────────────────────────────────── */}
        {activePanel === 'scan' && (
          <div
            className="absolute left-1/2 top-16 z-30 w-80 rounded-2xl overflow-hidden animate-fadeIn"
            style={{
              transform: 'translateX(-50%)',
              background: 'rgba(14,10,6,0.97)',
              border: '1px solid rgba(249,115,22,0.25)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.70), 0 0 40px rgba(249,115,22,0.08)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-orange-400" />
                <span className="font-bold text-sm text-white">Scan QR Code</span>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="h-6 w-6 rounded-full flex items-center justify-center ag-press transition"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scanarea */}
            <div className="p-4 space-y-3">
              <div
                className="relative rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  height: '180px',
                  background: 'rgba(0,0,0,0.60)',
                  border: '1.5px dashed rgba(249,115,22,0.40)',
                }}
              >
                {/* Corner markers */}
                {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-5 h-5`}
                    style={{
                      borderTop: i < 2 ? '2.5px solid #f97316' : 'none',
                      borderBottom: i >= 2 ? '2.5px solid #f97316' : 'none',
                      borderLeft: i % 2 === 0 ? '2.5px solid #f97316' : 'none',
                      borderRight: i % 2 === 1 ? '2.5px solid #f97316' : 'none',
                      borderRadius: '2px',
                    }}
                  />
                ))}
                {/* Scan line animation */}
                <div
                  className="absolute inset-x-4"
                  style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #f97316, transparent)',
                    animation: 'ag-float-slow 2s ease-in-out infinite',
                    boxShadow: '0 0 8px rgba(249,115,22,0.80)',
                  }}
                />
                <div className="text-center">
                  <QrCode className="h-10 w-10 mx-auto mb-2" style={{ color: 'rgba(249,115,22,0.30)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    Point camera at a QR code
                  </p>
                </div>
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Scan a truck's QR to go directly to its menu
              </p>
            </div>
          </div>
        )}

        {/* ── Zip Panel ──────────────────────────────────────── */}
        {activePanel === 'zip' && (
          <div
            className="absolute left-1/2 top-16 z-30 w-80 rounded-2xl overflow-hidden animate-fadeIn"
            style={{
              transform: 'translateX(-50%)',
              background: 'rgba(14,10,6,0.97)',
              border: '1px solid rgba(249,115,22,0.25)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.70), 0 0 40px rgba(249,115,22,0.08)',
              backdropFilter: 'blur(32px)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span className="font-bold text-sm text-white">Enter Zipcode</span>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="h-6 w-6 rounded-full flex items-center justify-center ag-press transition"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Find food trucks near your location
              </p>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 h-4 w-4"
                  style={{ color: 'rgba(249,115,22,0.60)' }}
                />
                <Input
                  value={zipInput}
                  onChange={e => setZipInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleZipConfirm()}
                  placeholder="e.g. 33101"
                  maxLength={10}
                  className="pl-9 ag-input rounded-xl h-11"
                  autoFocus
                />
              </div>
              <button
                onClick={handleZipConfirm}
                className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 ag-glow-btn ag-press transition"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c00)' }}
              >
                <Check className="h-4 w-4" />
                Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative pt-2 pb-1 overflow-hidden">
        {/* Floating food emojis 3D — desktop only */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 hidden lg:flex items-center gap-6 select-none pointer-events-none"
        >
          {[
            { emoji: '🌮', color: 'rgba(249,115,22,0.55)', delay: 0 },
            { emoji: '🍔', color: 'rgba(234,88,12,0.50)',  delay: 0.7 },
            { emoji: '🌯', color: 'rgba(251,191,36,0.45)', delay: 1.4 },
            { emoji: '🍕', color: 'rgba(249,115,22,0.50)', delay: 0.4 },
            { emoji: '🥙', color: 'rgba(234,88,12,0.45)',  delay: 1.1 },
            { emoji: '🍜', color: 'rgba(251,191,36,0.40)', delay: 1.8 },
          ].map(({ emoji, color, delay }, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                animation: `ag-float ${5 + i * 0.55}s ease-in-out ${delay}s infinite`,
              }}
            >
              {/* Glow halo behind */}
              <div style={{
                position:     'absolute',
                inset:        '-8px',
                borderRadius: '50%',
                background:   `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter:       'blur(8px)',
                zIndex:       0,
              }} />
              {/* Glass bubble */}
              <div style={{
                position:        'relative',
                zIndex:          1,
                width:           '52px',
                height:          '52px',
                borderRadius:    '16px',
                background:      'rgba(255,255,255,0.06)',
                border:          '1px solid rgba(255,255,255,0.12)',
                backdropFilter:  'blur(8px)',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                transform:       `perspective(300px) rotateX(${i % 2 === 0 ? 10 : -8}deg) rotateY(${i % 3 === 0 ? 8 : -6}deg)`,
                boxShadow:       `
                  0 8px 24px rgba(0,0,0,0.55),
                  0 2px 6px rgba(0,0,0,0.40),
                  0 0 0 1px rgba(255,255,255,0.07) inset,
                  0 1px 0 rgba(255,255,255,0.18) inset
                `,
              }}>
                <span style={{
                  fontSize:   '26px',
                  lineHeight: 1,
                  filter:     `drop-shadow(0 3px 6px rgba(0,0,0,0.60)) drop-shadow(0 1px 2px rgba(0,0,0,0.80))`,
                  transform:  'translateZ(4px)',
                  display:    'block',
                }}>
                  {emoji}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'rgba(249,115,22,0.80)' }}>
          <MapPin className="h-4 w-4" />
          <span className="font-semibold tracking-widest uppercase text-xs">FoodTruck Park</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight ag-gradient-text leading-tight">
          Food Trucks Near You
        </h1>
        <p className="mt-3 text-base" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Order from multiple trucks, delivered to your table
        </p>
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search food trucks or cuisines…"
          className="pl-10 ag-input h-12 rounded-2xl text-base"
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
          <p className="font-bold text-lg">No food trucks found</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Try a different search</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((truck, index) => (
            <Link key={truck.id} href={`/truck/${truck.id}`}>
              <TiltCard
                className="group ag-glass ag-glass-hover ag-inner-shine relative rounded-2xl overflow-hidden ag-card-rise cursor-pointer"
                style={{
                  animationDelay: `${index * 0.07}s`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.07) inset',
                }}
              >
                {/* Cover image */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: '188px',
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(251,191,36,0.12) 100%)',
                  }}
                >
                  {truck.logo && (
                    <Image
                      src={truck.logo}
                      alt={truck.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-108"
                      style={{ transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1)' }}
                    />
                  )}

                  {/* Closed overlay */}
                  {!truck.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.60)' }}>
                      <span
                        className="text-xs font-bold px-4 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.10)',
                          border: '1px solid rgba(255,255,255,0.18)',
                          color: 'rgba(255,255,255,0.80)',
                          backdropFilter: 'blur(8px)',
                        }}
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

                  {/* Gradient fade at bottom */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-20"
                    style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95), transparent)' }}
                  />

                  {/* Quick-order sparkle on open trucks */}
                  {truck.isOpen && (
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(249,115,22,0.20)',
                        border: '1px solid rgba(249,115,22,0.40)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Zap className="h-3 w-3 text-orange-400" />
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                        {truck.avgPrepTime} min
                      </span>
                    </div>
                  )}
                </div>

                {/* Info panel */}
                <div className="p-4 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-white group-hover:text-orange-300 transition truncate tracking-tight text-base">
                        {truck.name}
                      </h3>
                      {truck.cuisine && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(249,115,22,0.65)' }}>
                          {truck.cuisine}
                        </p>
                      )}
                    </div>

                    {/* Rating badge */}
                    <div
                      className="flex items-center gap-1 shrink-0 rounded-xl px-2 py-1"
                      style={{
                        background: 'rgba(251,191,36,0.10)',
                        border: '1px solid rgba(251,191,36,0.22)',
                        boxShadow: '0 0 12px rgba(251,191,36,0.08)',
                      }}
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-extrabold text-yellow-300">
                        {truck.rating > 0 ? truck.rating.toFixed(1) : 'New'}
                      </span>
                      {truck.totalRatings > 0 && (
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          ({truck.totalRatings})
                        </span>
                      )}
                    </div>
                  </div>

                  {truck.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'rgba(255,255,255,0.36)' }}>
                      {truck.description}
                    </p>
                  )}

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 pt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      <span>{truck.avgPrepTime} min</span>
                    </div>
                    {truck.tableServiceEnabled && (
                      <span className="flex items-center gap-1 text-xs">
                        🪑 <span>Table service</span>
                      </span>
                    )}
                  </div>

                  {/* Hover CTA */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: '0', opacity: 0 }}
                    ref={el => {
                      if (!el) return
                      const parent = el.closest('.group')
                      if (parent) {
                        parent.addEventListener('mouseenter', () => {
                          el.style.maxHeight = '40px'
                          el.style.opacity = '1'
                          el.style.marginTop = '8px'
                        })
                        parent.addEventListener('mouseleave', () => {
                          el.style.maxHeight = '0'
                          el.style.opacity = '0'
                          el.style.marginTop = '0'
                        })
                      }
                    }}
                  >
                    <div
                      className="w-full text-center py-2 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(249,115,22,0.10))',
                        border: '1px solid rgba(249,115,22,0.30)',
                      }}
                    >
                      View Menu →
                    </div>
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
