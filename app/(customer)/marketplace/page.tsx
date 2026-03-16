'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Star, Clock, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
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

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const { setTableNumber, tableNumber } = useCart()
  const [trucks, setTrucks] = useState<FoodTruck[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tableInput, setTableInput] = useState<string>('')
  const [showTableBanner, setShowTableBanner] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Table Banner */}
      {showTableBanner && tableNumber && (
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
          <QrCode className="h-5 w-5 text-orange-500 shrink-0" />
          <span className="text-sm font-medium text-orange-800">Ordering for Table <strong>{tableNumber}</strong></span>
          <div className="ml-auto flex items-center gap-2">
            <Input value={tableInput} onChange={e => setTableInput(e.target.value)} className="w-20 h-8 text-sm" placeholder="Table #" />
            <button onClick={handleTableUpdate} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition">Update</button>
          </div>
        </div>
      )}

      {!showTableBanner && (
        <div className="flex items-center gap-3 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <QrCode className="h-5 w-5 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-600">At a table? Enter your table number:</span>
          <div className="ml-auto flex items-center gap-2">
            <Input value={tableInput} onChange={e => setTableInput(e.target.value)} className="w-20 h-8 text-sm" placeholder="Table #" />
            <button onClick={handleTableUpdate} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition">Set</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <MapPin className="h-4 w-4" />
          <span>FoodTruck Park</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Food Trucks Near You</h1>
        <p className="text-gray-500 mt-1">Order from multiple trucks, delivered to your table</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food trucks or cuisines..." className="pl-10" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🚚</div>
          <p className="font-medium">No food trucks found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(truck => (
            <Link key={truck.id} href={`/truck/${truck.id}`}>
              <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                {/* Cover */}
                <div className="relative h-36 bg-gradient-to-br from-orange-100 to-amber-50">
                  {truck.logo && (
                    <Image src={truck.logo} alt={truck.name} fill className="object-cover" />
                  )}
                  {!truck.isOpen && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Closed</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={truck.isOpen ? 'success' : 'secondary'}>
                      {truck.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition">{truck.name}</h3>
                      {truck.cuisine && <p className="text-sm text-gray-500">{truck.cuisine}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{truck.rating > 0 ? truck.rating.toFixed(1) : 'New'}</span>
                      {truck.totalRatings > 0 && <span className="text-gray-400">({truck.totalRatings})</span>}
                    </div>
                  </div>
                  {truck.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{truck.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{truck.avgPrepTime} min</span>
                    </div>
                    {truck.tableServiceEnabled && (
                      <span className="flex items-center gap-1">🪑 Table service</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
