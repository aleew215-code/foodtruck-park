'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Star, Clock, QrCode, Zap, X, Check, Navigation, Camera, CameraOff, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { TiltCard } from '@/components/ui/tilt-card'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import Link from 'next/link'

interface FoodTruck {
  id: string; name: string; description: string | null; logo: string | null
  cuisine: string | null; rating: number; totalRatings: number
  avgPrepTime: number; isOpen: boolean; tableServiceEnabled: boolean
}

const US_CITIES = [
  'Miami, FL','Fort Lauderdale, FL','Orlando, FL','Tampa, FL','Jacksonville, FL',
  'Los Angeles, CA','San Francisco, CA','San Diego, CA','Sacramento, CA',
  'New York, NY','Brooklyn, NY','Queens, NY',
  'Houston, TX','Dallas, TX','Austin, TX','San Antonio, TX','El Paso, TX',
  'Chicago, IL','Atlanta, GA','Phoenix, AZ','Las Vegas, NV',
  'Seattle, WA','Portland, OR','Denver, CO','Nashville, TN','Charlotte, NC',
  'Boston, MA','Philadelphia, PA','Washington, DC','Baltimore, MD',
  'Minneapolis, MN','Detroit, MI','Cleveland, OH','Columbus, OH',
  'New Orleans, LA','Baton Rouge, LA','Memphis, TN','Louisville, KY',
]

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const { setTableNumber, tableNumber } = useCart()
  const [trucks, setTrucks]   = useState<FoodTruck[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [tableInput, setTableInput]           = useState('')
  const [showTableBanner, setShowTableBanner] = useState(false)
  const [activePanel, setActivePanel]         = useState<'scan'|'location'|null>(null)
  const [cityInput, setCityInput]             = useState('')
  const [cityConfirmed, setCityConfirmed]     = useState('')
  const filteredCities = US_CITIES.filter(c =>
    c.toLowerCase().includes(cityInput.toLowerCase())
  ).slice(0, 7)

  const [cameraPermission, setCameraPermission] = useState<'idle'|'requesting'|'granted'|'denied'>('idle')
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream|null>(null)

  const [geoStatus, setGeoStatus]   = useState<'idle'|'requesting'|'granted'|'denied'>('idle')
  const [nearbyCity, setNearbyCity] = useState('')

  useEffect(() => {
    const table = searchParams.get('table')
    if (table) {
      const num = parseInt(table)
      if (!isNaN(num)) { setTableNumber(num); setTableInput(String(num)); setShowTableBanner(true) }
    } else if (tableNumber) { setTableInput(String(tableNumber)); setShowTableBanner(true) }
  }, [searchParams])

  useEffect(() => {
    fetch('/api/trucks').then(r => r.json()).then(d => { setTrucks(d); setLoading(false) })
  }, [])

  useEffect(() => {
    if (activePanel !== 'scan') {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setCameraPermission('idle')
    }
  }, [activePanel])

  useEffect(() => {
    document.body.style.overflow = activePanel ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activePanel])

  const filtered = trucks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.cuisine || '').toLowerCase().includes(search.toLowerCase())
  )

  async function requestCamera() {
    setCameraPermission('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraPermission('granted')
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      }, 80)
    } catch { setCameraPermission('denied') }
  }

  async function requestGeolocation() {
    if (!navigator.geolocation) { setGeoStatus('denied'); return }
    setGeoStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setGeoStatus('granted')
        let city = ''
        if (lat>25&&lat<27&&lng>-81&&lng<-79)         city='Miami, FL'
        else if (lat>26&&lat<27.5&&lng>-80.5&&lng<-80) city='Fort Lauderdale, FL'
        else if (lat>28&&lat<29&&lng>-81.5&&lng<-81)   city='Orlando, FL'
        else if (lat>27&&lat<28.5&&lng>-82.8&&lng<-82) city='Tampa, FL'
        else if (lat>33&&lat<34.5&&lng>-118.7&&lng<-117.5) city='Los Angeles, CA'
        else if (lat>37&&lat<38&&lng>-122.6&&lng<-122) city='San Francisco, CA'
        else if (lat>29&&lat<30.5&&lng>-96&&lng<-94.5) city='Houston, TX'
        else if (lat>32&&lat<33.5&&lng>-97.5&&lng<-96) city='Dallas, TX'
        else if (lat>30&&lat<30.8&&lng>-98&&lng<-97)   city='Austin, TX'
        else if (lat>40&&lat<41&&lng>-74.5&&lng<-73.5) city='New York, NY'
        else if (lat>41&&lat<42.5&&lng>-88&&lng<-87)   city='Chicago, IL'
        else city='your area'
        setNearbyCity(city); setCityConfirmed(city); setActivePanel(null)
      },
      () => setGeoStatus('denied'),
      { timeout: 10000 }
    )
  }

  return (
    <div className="space-y-6 ag-page-enter">

      {/* ══════════════════════════════════════════════════════
          FULL-SCREEN CAMERA — no boxes, pure premium
      ══════════════════════════════════════════════════════ */}
      {activePanel === 'scan' && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          {/* Live camera — fills everything */}
          {cameraPermission === 'granted' && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />
          )}

          {/* Dark vignette overlay — no boxes */}
          {cameraPermission === 'granted' && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)',
            }} />
          )}

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4"
            style={{ background: cameraPermission === 'granted' ? 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, transparent 100%)' : 'transparent' }}>
            <div>
              <p className="text-white font-black text-lg leading-tight tracking-tight">Scan QR Code</p>
              {cameraPermission === 'granted' && (
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Move slowly to the QR code</p>
              )}
            </div>
            <button onClick={() => setActivePanel(null)}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">

            {/* IDLE */}
            {cameraPermission === 'idle' && (
              <div className="text-center space-y-8 w-full max-w-xs">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(249,115,22,0.20)', animationDuration: '2s' }} />
                  <div className="absolute inset-3 rounded-full" style={{ background: 'rgba(249,115,22,0.12)', border: '1.5px solid rgba(249,115,22,0.35)' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-orange-400" style={{ filter: 'drop-shadow(0 0 16px rgba(249,115,22,0.60))' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">Allow Camera</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    We need your camera to scan the food truck's QR code instantly.
                  </p>
                </div>
                <button onClick={requestCamera}
                  className="w-full h-14 rounded-2xl font-bold text-base text-white ag-press"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c00)', boxShadow: '0 0 40px rgba(249,115,22,0.50)' }}>
                  Allow Camera Access
                </button>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>Only used for QR scanning</p>
              </div>
            )}

            {/* REQUESTING */}
            {cameraPermission === 'requesting' && (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full border-4 mx-auto animate-spin"
                  style={{ borderColor: 'rgba(249,115,22,0.20)', borderTopColor: '#f97316' }} />
                <p className="text-white font-semibold text-lg">Opening camera…</p>
              </div>
            )}

            {/* GRANTED — just a subtle pulse ring, no boxes */}
            {cameraPermission === 'granted' && (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                {/* Subtle pulsing ring — guides without boxing */}
                <div className="relative w-56 h-56">
                  <div className="absolute inset-0 rounded-full border-2 border-orange-500/40 animate-ping"
                    style={{ animationDuration: '2.5s' }} />
                  <div className="absolute inset-4 rounded-full border border-orange-400/25" />
                </div>
              </div>
            )}

            {/* DENIED */}
            {cameraPermission === 'denied' && (
              <div className="text-center space-y-6 w-full max-w-xs">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
                  style={{ background: 'rgba(239,68,68,0.10)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
                  <CameraOff className="h-10 w-10 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white">Camera Blocked</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Allow camera in your browser settings, then tap Try Again.
                  </p>
                </div>
                <button onClick={() => setCameraPermission('idle')}
                  className="w-full h-12 rounded-2xl font-bold text-white ag-press"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Bottom hint when camera is live */}
          {cameraPermission === 'granted' && (
            <div className="relative z-10 pb-16 text-center"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 100%)' }}>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Point your camera at the truck's QR code
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          LOCATION MODAL — centered, premium
      ══════════════════════════════════════════════════════ */}
      {activePanel === 'location' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
          onClick={e => { if (e.target === e.currentTarget) setActivePanel(null) }}
        >
          <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-fadeIn"
            style={{
              background: 'rgba(14,10,6,0.98)',
              border: '1px solid rgba(249,115,22,0.18)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.80), 0 0 80px rgba(249,115,22,0.05)',
              maxHeight: '90vh', overflowY: 'auto',
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sticky top-0"
              style={{ background: 'rgba(14,10,6,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="text-white font-black text-lg">Your Location</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Find trucks near you</p>
              </div>
              <button onClick={() => setActivePanel(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center ag-press"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* GPS */}
              <button onClick={requestGeolocation} disabled={geoStatus==='requesting'}
                className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-between px-5 ag-press transition"
                style={{
                  background: geoStatus==='granted' ? 'rgba(34,197,94,0.10)' : 'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(249,115,22,0.06))',
                  border: geoStatus==='granted' ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(249,115,22,0.30)',
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: geoStatus==='granted' ? 'rgba(34,197,94,0.18)' : 'rgba(249,115,22,0.18)' }}>
                    {geoStatus==='requesting'
                      ? <div className="w-4 h-4 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin"/>
                      : geoStatus==='granted' ? <Check className="h-4 w-4 text-green-400"/>
                      : <Navigation className="h-4 w-4 text-orange-400"/>}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm leading-tight">
                      {geoStatus==='requesting' ? 'Detecting location…'
                        : geoStatus==='granted' ? (nearbyCity||'Location found')
                        : geoStatus==='denied' ? 'Location unavailable'
                        : 'Use my current location'}
                    </p>
                    {geoStatus==='idle' && <p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>Detect automatically</p>}
                  </div>
                </div>
                {geoStatus==='idle' && <ChevronRight className="h-4 w-4" style={{color:'rgba(255,255,255,0.30)'}}/>}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.07)'}}/>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{color:'rgba(255,255,255,0.22)'}}>or search</span>
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.07)'}}/>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4" style={{color:'rgba(249,115,22,0.55)'}}/>
                <Input value={cityInput} onChange={e=>setCityInput(e.target.value)}
                  placeholder="Miami, Houston, Los Angeles…"
                  className="pl-10 ag-input rounded-2xl h-12" autoFocus/>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.06)'}}>
                {(cityInput.length>0 ? filteredCities : US_CITIES.slice(0,6)).map((city,i,arr)=>(
                  <button key={city}
                    onClick={()=>{ setCityConfirmed(city); setCityInput(''); setActivePanel(null) }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between ag-press transition"
                    style={{ color:'rgba(255,255,255,0.75)', borderBottom: i<arr.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(249,115,22,0.07)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0"/>
                      <span className="text-sm font-medium">{city}</span>
                    </div>
                    {cityConfirmed===city && <Check className="h-3.5 w-3.5 text-orange-400"/>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MAIN PAGE CONTENT
      ══════════════════════════════════════════════════════ */}

      {/* Action buttons — stack on very small screens */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={()=>setActivePanel('scan')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ag-press flex-1 max-w-[160px]"
          style={{ background:'rgba(249,115,22,0.10)', border:'1.5px solid rgba(249,115,22,0.35)', color:'#f97316' }}>
          <QrCode className="h-4 w-4 shrink-0"/>
          <span>Scan QR</span>
        </button>

        <button onClick={()=>setActivePanel('location')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ag-press flex-1 max-w-[160px]"
          style={{
            background: cityConfirmed ? 'linear-gradient(135deg,#f97316,#ea6c00)' : 'rgba(249,115,22,0.10)',
            border: cityConfirmed ? 'none' : '1.5px solid rgba(249,115,22,0.35)',
            color: cityConfirmed ? '#fff' : '#f97316',
            boxShadow: cityConfirmed ? '0 0 24px rgba(249,115,22,0.40)' : 'none',
          }}>
          <MapPin className="h-4 w-4 shrink-0"/>
          <span className="truncate">{cityConfirmed ? cityConfirmed.split(',')[0] : 'Location'}</span>
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Floating emojis — desktop only */}
        <div aria-hidden="true" className="absolute right-0 top-0 hidden lg:flex items-center gap-5 select-none pointer-events-none">
          {[
            {emoji:'🌮',color:'rgba(249,115,22,0.55)',delay:0},
            {emoji:'🍔',color:'rgba(234,88,12,0.50)',delay:0.7},
            {emoji:'🌯',color:'rgba(251,191,36,0.45)',delay:1.4},
            {emoji:'🍕',color:'rgba(249,115,22,0.50)',delay:0.4},
            {emoji:'🥙',color:'rgba(234,88,12,0.45)',delay:1.1},
            {emoji:'🍜',color:'rgba(251,191,36,0.40)',delay:1.8},
          ].map(({emoji,color,delay},i)=>(
            <div key={i} style={{position:'relative',animation:`ag-float ${5+i*0.55}s ease-in-out ${delay}s infinite`}}>
              <div style={{position:'absolute',inset:'-8px',borderRadius:'50%',background:`radial-gradient(circle,${color} 0%,transparent 70%)`,filter:'blur(8px)',zIndex:0}}/>
              <div style={{position:'relative',zIndex:1,width:'48px',height:'48px',borderRadius:'14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',transform:`perspective(300px) rotateX(${i%2===0?10:-8}deg) rotateY(${i%3===0?8:-6}deg)`,boxShadow:'0 8px 24px rgba(0,0,0,0.55)'}}>
                <span style={{fontSize:'24px',lineHeight:1,filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.60))'}}>{emoji}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2" style={{color:'rgba(249,115,22,0.80)'}}>
          <MapPin className="h-3.5 w-3.5"/>
          <span className="font-semibold tracking-widest uppercase text-xs">{cityConfirmed||'FoodTruck Park'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight ag-gradient-text leading-tight">
          Food Trucks Near You
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{color:'rgba(255,255,255,0.38)'}}>
          Order from multiple trucks, delivered to your table
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4" style={{color:'rgba(255,255,255,0.25)'}}/>
        <Input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search food trucks or cuisines…"
          className="pl-10 ag-input h-11 sm:h-12 rounded-2xl text-sm sm:text-base"/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-5xl ag-float-slow">🚚</span><Spinner size="lg"/>
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20" style={{color:'rgba(255,255,255,0.35)'}}>
          <div className="text-5xl mb-4 ag-float-slow">🚚</div>
          <p className="font-bold text-lg">No food trucks found</p>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.22)'}}>Try a different search</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((truck,index)=>(
            <Link key={truck.id} href={`/truck/${truck.id}`}>
              <TiltCard
                className="group ag-glass ag-glass-hover ag-inner-shine relative rounded-2xl overflow-hidden ag-card-rise cursor-pointer"
                style={{animationDelay:`${index*0.07}s`,boxShadow:'0 8px 30px rgba(0,0,0,0.50),0 1px 0 rgba(255,255,255,0.07) inset'}}>
                {/* Image */}
                <div className="relative overflow-hidden" style={{height:'160px',background:'linear-gradient(135deg,rgba(249,115,22,0.25) 0%,rgba(251,191,36,0.12) 100%)'}}>
                  {truck.logo && <Image src={truck.logo} alt={truck.name} fill className="object-cover" style={{transition:'transform 0.7s cubic-bezier(0.22,1,0.36,1)'}}/>}
                  {!truck.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{background:'rgba(0,0,0,0.60)'}}>
                      <span className="text-xs font-bold px-4 py-1.5 rounded-full" style={{background:'rgba(255,255,255,0.10)',border:'1px solid rgba(255,255,255,0.18)',color:'rgba(255,255,255,0.80)',backdropFilter:'blur(8px)'}}>Closed</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant={truck.isOpen?'success':'secondary'}>{truck.isOpen?'Open':'Closed'}</Badge>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-16" style={{background:'linear-gradient(to top,rgba(10,8,6,0.95),transparent)'}}/>
                  {truck.isOpen && (
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full" style={{background:'rgba(249,115,22,0.20)',border:'1px solid rgba(249,115,22,0.40)',backdropFilter:'blur(8px)'}}>
                      <Zap className="h-3 w-3 text-orange-400"/>
                      <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">{truck.avgPrepTime} min</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3.5 sm:p-4 space-y-2" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-white group-hover:text-orange-300 transition truncate tracking-tight text-sm sm:text-base">{truck.name}</h3>
                      {truck.cuisine && <p className="text-xs mt-0.5" style={{color:'rgba(249,115,22,0.65)'}}>{truck.cuisine}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 rounded-xl px-2 py-1" style={{background:'rgba(251,191,36,0.10)',border:'1px solid rgba(251,191,36,0.22)'}}>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400"/>
                      <span className="text-xs font-extrabold text-yellow-300">{truck.rating>0?truck.rating.toFixed(1):'New'}</span>
                    </div>
                  </div>
                  {truck.description && <p className="text-xs line-clamp-2" style={{color:'rgba(255,255,255,0.36)'}}>{truck.description}</p>}
                  <div className="flex items-center gap-3" style={{color:'rgba(255,255,255,0.35)'}}>
                    <div className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3 text-orange-500"/><span>{truck.avgPrepTime} min</span></div>
                    {truck.tableServiceEnabled && <span className="text-xs">🪑 Table service</span>}
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
