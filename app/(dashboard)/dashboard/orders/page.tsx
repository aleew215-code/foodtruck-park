'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_VARIANTS: Record<string, any> = {
  PENDING: 'secondary', CONFIRMED: 'default', PREPARING: 'warning',
  READY: 'success', ON_THE_WAY: 'default', DELIVERED: 'success', CANCELLED: 'destructive',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then(r => r.json())
      .then(d => { setOrders(d); setLoading(false) })
  }, [])

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/dashboard/orders/${orderId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.customer?.name} · {format(new Date(order.createdAt), 'MMM d, h:mm a')}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[order.status] || 'secondary'}>{order.status}</Badge>
                {order.tableNumber && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">Table {order.tableNumber}</span>}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                {expanded === order.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
            {expanded === order.id && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="space-y-1 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['CONFIRMED','PREPARING','READY','ON_THE_WAY','DELIVERED','CANCELLED'].map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${order.status === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-400'}`}>{s.replace('_',' ')}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">No orders found</div>}
      </div>
    </div>
  )
}
