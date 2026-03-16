'use client'
import { useState, useEffect } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/customers')
      .then(r => r.json())
      .then(d => { setCustomers(d); setLoading(false) })
  }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customer CRM</h1>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="pl-10" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition">
              <Avatar src={c.image} name={c.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500 truncate">{c.email}</p>
                {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{c.orderCount} orders</p>
                <p className="text-xs text-gray-500">{formatCurrency(c.totalSpent)}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">No customers found</div>}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar src={selected.image} name={selected.name} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
            </div>
            {selected.phone && <div><p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p><p className="text-sm font-medium">{selected.phone}</p></div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-orange-500">{selected.orderCount}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(selected.totalSpent)}</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
            {selected.allergies?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium text-amber-700">Allergies</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selected.allergies.map((a: string) => <span key={a} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-200">{a}</span>)}
                </div>
              </div>
            )}
            {selected.favoriteItems?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Favorite Items</p>
                {selected.favoriteItems.map((item: any) => (
                  <div key={item.name} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-400">×{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
