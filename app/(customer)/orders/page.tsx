'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Clock, ChevronRight, Package } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'

const STATUS_STYLE: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:    { label: 'Pending',    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',  dot: 'bg-yellow-400 animate-pulse' },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',        dot: 'bg-blue-400' },
  PREPARING:  { label: 'Preparing',  color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',  dot: 'bg-orange-400 animate-pulse' },
  READY:      { label: 'Ready!',     color: 'bg-green-500/15 text-green-300 border-green-500/30',     dot: 'bg-green-400 animate-pulse' },
  ON_THE_WAY: { label: 'On the way', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',  dot: 'bg-purple-400' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-gray-500/15 text-gray-400 border-gray-500/30',        dot: 'bg-gray-500' },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-500/15 text-red-300 border-red-500/30',           dot: 'bg-red-400' },
}

const ACTIVE = ['PENDING','CONFIRMED','PREPARING','READY','ON_THE_WAY']

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active'|'past'>('active')

  useEffect(() => {
    fetch('/api/orders/my-orders')
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const active = orders.filter(o => ACTIVE.includes(o.status))
  const past   = orders.filter(o => !ACTIVE.includes(o.status))
  const list   = tab === 'active' ? active : past

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"/>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white">My Orders</h1>

      <div className="flex rounded-2xl p-1 gap-1" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
        {(['active','past'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-bold capitalize transition"
            style={{
              background: tab===t ? 'linear-gradient(135deg,#f97316,#ea6c00)' : 'transparent',
              color:      tab===t ? '#fff' : 'rgba(255,255,255,0.40)',
            }}>
            {t === 'active' ? `Active${active.length ? ` (${active.length})` : ''}` : 'Past Orders'}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">{tab==='active' ? '🛵' : '📋'}</div>
          <p className="text-gray-400 font-semibold">{tab==='active' ? 'No active orders' : 'No past orders yet'}</p>
          <Link href="/marketplace" className="inline-block px-6 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background:'linear-gradient(135deg,#f97316,#ea6c00)' }}>
            Browse Food Trucks
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(order => {
            const s = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING
            const isActive = ACTIVE.includes(order.status)
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="rounded-2xl p-4 transition cursor-pointer"
                  style={{
                    background: isActive ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.04)',
                    border:     isActive ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background:'rgba(249,115,22,0.15)' }}>
                      {order.foodTruck.logo
                        ? <Image src={order.foodTruck.logo} alt={order.foodTruck.name} width={44} height={44} className="object-cover w-full h-full"/>
                        : <Package className="h-5 w-5 text-orange-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm truncate">{order.foodTruck.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">#{order.orderNumber} · {order.items.length} item{order.items.length!==1?'s':''}</p>
                      <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3"/>{format(new Date(order.createdAt),'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-white text-sm">{formatCurrency(order.total)}</p>
                      <ChevronRight className="h-4 w-4 text-gray-600 ml-auto mt-1"/>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
