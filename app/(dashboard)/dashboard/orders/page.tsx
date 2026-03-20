'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ChevronDown, ChevronUp, Clock, User,
  CheckCircle2, ChefHat, Bell, BellOff, Zap,
  RefreshCw, TableIcon, ShoppingBag, XCircle
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  CONFIRMED:  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  PREPARING:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  READY:      'bg-green-500/15 text-green-300 border-green-500/30',
  ON_THE_WAY: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  DELIVERED:  'bg-gray-500/15 text-gray-400 border-gray-500/30',
  CANCELLED:  'bg-red-500/15 text-red-300 border-red-500/30',
}

const STATUS_FLOW = [
  { from: 'PENDING',   action: 'Accept Order',   next: 'CONFIRMED', icon: CheckCircle2, color: 'bg-blue-500 hover:bg-blue-600' },
  { from: 'CONFIRMED', action: 'Start Preparing', next: 'PREPARING', icon: ChefHat,      color: 'bg-orange-500 hover:bg-orange-600' },
  { from: 'PREPARING', action: 'Mark as Ready',   next: 'READY',     icon: Bell,         color: 'bg-green-500 hover:bg-green-600' },
  { from: 'READY',     action: 'Mark Delivered',  next: 'DELIVERED', icon: CheckCircle2, color: 'bg-gray-500 hover:bg-gray-600' },
]

const FILTERS = ['ACTIVE','PENDING','PREPARING','READY','DELIVERED','CANCELLED']
const ACTIVE_STATUSES = ['PENDING','CONFIRMED','PREPARING','READY','ON_THE_WAY']

export default function OrdersPage() {
  const [orders, setOrders]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [filter, setFilter]           = useState('ACTIVE')
  const [updatingId, setUpdatingId]   = useState<string | null>(null)
  const [soundOn, setSoundOn]         = useState(true)
  const [newAlert, setNewAlert]       = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const audioCtx = useRef<AudioContext | null>(null)

  const playAlert = useCallback(() => {
    if (!soundOn) return
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext()
      const ctx = audioCtx.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [soundOn])

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/dashboard/orders')
      const data = await res.json()
      if (!Array.isArray(data)) return
      setOrders(prev => {
        const prevPending = prev.filter(o => o.status === 'PENDING').length
        const newPending  = data.filter((o: any) => o.status === 'PENDING').length
        if (newPending > prevPending && prev.length > 0) {
          playAlert(); setNewAlert(true); setTimeout(() => setNewAlert(false), 4000)
        }
        return data
      })
      setLastRefresh(new Date())
    } catch {}
    if (!silent) setLoading(false)
  }, [playAlert])

  useEffect(() => {
    fetchOrders()
    const id = setInterval(() => fetchOrders(true), 6000)
    return () => clearInterval(id)
  }, [fetchOrders])

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId)
    await fetch(`/api/dashboard/orders/${orderId}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setUpdatingId(null)
    // Always switch to ACTIVE so the order stays visible after status change
    setFilter('ACTIVE')
  }

  const filtered     = orders.filter(o => filter === 'ACTIVE' ? ACTIVE_STATUSES.includes(o.status) : o.status === filter)
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const prepCount    = orders.filter(o => ['PREPARING','CONFIRMED'].includes(o.status)).length
  const readyCount   = orders.filter(o => o.status === 'READY').length
  const todayTotal   = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.paymentStatus === 'COMPLETED')
    .reduce((s, o) => s + o.total, 0)

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"/>
      <p className="text-gray-400 text-sm">Loading orders…</p>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* New order alert */}
      {newAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-bold shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea6c00)', boxShadow: '0 0 40px rgba(249,115,22,0.7)' }}>
            <Bell className="h-5 w-5"/> 🔔 New order incoming!
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">Auto-refresh every 6s · {format(lastRefresh, 'h:mm:ss a')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundOn(s => !s)}
            className="p-2.5 rounded-xl transition"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            {soundOn ? <Bell className="h-4 w-4 text-orange-400"/> : <BellOff className="h-4 w-4 text-gray-500"/>}
          </button>
          <button onClick={() => fetchOrders()}
            className="p-2.5 rounded-xl transition"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <RefreshCw className="h-4 w-4 text-gray-400"/>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending',          val: pendingCount,               icon: Clock,        color: '#eab308', bg: '#fefce8', border: '#fde68a' },
          { label: 'In Kitchen',       val: prepCount,                  icon: ChefHat,      color: '#ea6c00', bg: '#fff7ed', border: '#fed7aa' },
          { label: 'Ready',            val: readyCount,                 icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: "Today's Revenue",  val: formatCurrency(todayTotal), icon: Zap,          color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
        ].map(({ label, val, icon: Icon, color, bg, border }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{label}</span>
              <Icon className="h-4 w-4" style={{ color }}/>
            </div>
            <p className="text-2xl font-black" style={{ color: '#111827' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="relative px-4 py-1.5 rounded-full text-sm font-bold transition"
            style={{
              background: filter === f ? 'linear-gradient(135deg,#f97316,#ea6c00)' : '#f3f4f6',
              color:      filter === f ? '#fff' : '#6b7280',
              border:     filter === f ? 'none' : '1px solid #e5e7eb',
            }}>
            {f}
            {f === 'PENDING' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-400 font-medium">No orders found</p>
          </div>
        )}

        {filtered.map(order => {
          const flow       = STATUS_FLOW.find(s => s.from === order.status)
          const isExpanded = expanded === order.id
          return (
            <div key={order.id} className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: order.status === 'PENDING' ? 'rgba(234,179,8,0.06)' : 'rgba(255,255,255,0.04)',
                border:     order.status === 'PENDING' ? '1px solid rgba(234,179,8,0.30)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow:  order.status === 'PENDING' ? '0 0 24px rgba(234,179,8,0.08)' : 'none',
              }}>

              {/* Row */}
              <div className="px-5 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : order.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    order.status === 'PENDING'   ? 'bg-yellow-400 animate-pulse' :
                    ['PREPARING','CONFIRMED'].includes(order.status) ? 'bg-orange-400' :
                    order.status === 'READY'     ? 'bg-green-400' : 'bg-gray-600'}`}/>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 font-black text-sm">#{order.orderNumber}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status.replace('_',' ')}
                      </span>
                      {order.tableNumber && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.50)' }}>
                          <TableIcon className="h-2.5 w-2.5"/> Table {order.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3"/> {order.customer?.name || 'Guest'}</span>
                      <span>{format(new Date(order.createdAt), 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-900 font-black">{formatCurrency(order.total)}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500"/> : <ChevronDown className="h-4 w-4 text-gray-500"/>}
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="pt-3 space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div>
                          <span className="text-sm text-gray-300">
                            <span className="font-bold text-orange-400">{item.quantity}×</span> {item.name}
                          </span>
                          {item.notes && <p className="text-xs text-gray-500 mt-0.5">📝 {item.notes}</p>}
                        </div>
                        <span className="text-sm font-semibold text-gray-300 ml-4 shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm font-black text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.customer?.phone && <p className="text-xs text-gray-500">📞 {order.customer.phone}</p>}

                  <div className="flex gap-2 flex-wrap">
                    {flow && (
                      <button disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, flow.next)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition ${flow.color}`}>
                        {updatingId === order.id
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                          : <flow.icon className="h-4 w-4"/>}
                        {flow.action}
                      </button>
                    )}
                    {!['CANCELLED','DELIVERED'].includes(order.status) && (
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        <XCircle className="h-4 w-4"/> Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
