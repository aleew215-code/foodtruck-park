'use client'
import { useState, useEffect, useCallback } from 'react'

const STATUS_FLOW: Record<string, string | null> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'ON_THE_WAY',
  ON_THE_WAY: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
}

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  ON_THE_WAY: 'On the Way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'rgba(59,130,246,0.20)',
  PREPARING: 'rgba(249,115,22,0.20)',
  READY: 'rgba(34,197,94,0.20)',
  ON_THE_WAY: 'rgba(168,85,247,0.20)',
  DELIVERED: 'rgba(255,255,255,0.08)',
  CANCELLED: 'rgba(239,68,68,0.12)',
}

const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: '#60a5fa',
  PREPARING: '#fb923c',
  READY: '#4ade80',
  ON_THE_WAY: '#c084fc',
  DELIVERED: 'rgba(255,255,255,0.35)',
  CANCELLED: '#f87171',
}

const NEXT_BTN_LABELS: Record<string, string> = {
  CONFIRMED: '▶ Start Preparing',
  PREPARING: '✓ Mark Ready',
  READY: '🚚 On the Way',
  ON_THE_WAY: '✅ Delivered',
}

type Order = {
  id: string
  orderNumber: string
  status: string
  orderType: string
  tableNumber: number | null
  notes: string | null
  estimatedReadyAt: string | null
  createdAt: string
  customer: { name: string | null; phone: string | null }
  items: { id: string; name: string; quantity: number; price: number; notes: string | null }[]
}

export default function EmployeePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/orders')
      if (res.ok) setOrders(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 8000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function advanceStatus(orderId: string, nextStatus: string) {
    setUpdating(orderId)
    try {
      await fetch(`/api/employee/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      await fetchOrders()
    } finally {
      setUpdating(null)
    }
  }

  async function cancelOrder(orderId: string) {
    if (!confirm('Cancel this order?')) return
    setUpdating(orderId)
    try {
      await fetch(`/api/employee/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      await fetchOrders()
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading orders…</p>
        </div>
      </div>
    )
  }

  const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const done = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status))

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Active Orders</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)' }} className="text-sm mt-0.5">
            {active.length} active · Updates every 8s
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="rounded-xl px-4 py-2 text-sm font-medium"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)' }}
        >
          ↻ Refresh
        </button>
      </div>

      {active.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-bold text-white">All caught up!</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>No active orders right now</p>
        </div>
      )}

      {/* Active orders grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {active.map(order => {
          const nextStatus = STATUS_FLOW[order.status]
          const isUpdating = updating === order.id
          const eta = order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : null
          const etaMinutes = eta ? Math.max(0, Math.round((eta.getTime() - Date.now()) / 60000)) : null

          return (
            <div
              key={order.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Order header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="font-black text-white text-xl">#{order.orderNumber}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {order.orderType === 'TABLE_SERVICE' ? `Table ${order.tableNumber}` : 'Pickup'}
                    {' · '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: STATUS_COLORS[order.status], color: STATUS_TEXT[order.status] }}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Items */}
              <div className="px-5 py-3 flex-1 space-y-1.5">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black"
                        style={{ background: 'rgba(249,115,22,0.20)', color: '#fb923c' }}
                      >
                        {item.quantity}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        {item.notes && <p className="text-xs" style={{ color: 'rgba(249,115,22,0.80)' }}>⚠ {item.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}

                {order.notes && (
                  <div className="mt-2 rounded-xl px-3 py-2" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#fb923c' }}>Order note</p>
                    <p className="text-sm text-white mt-0.5">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* ETA */}
              {etaMinutes !== null && order.status !== 'READY' && order.status !== 'ON_THE_WAY' && (
                <div className="px-5 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    ⏱ ETA: <span className="text-white font-semibold">~{etaMinutes} min</span>
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="px-4 pb-4 pt-2 flex gap-2">
                {nextStatus && (
                  <button
                    onClick={() => advanceStatus(order.id, nextStatus)}
                    disabled={isUpdating}
                    className="flex-1 rounded-xl py-3.5 text-sm font-black transition active:scale-95"
                    style={{
                      background: isUpdating ? 'rgba(249,115,22,0.30)' : 'linear-gradient(135deg, #f97316, #ea6c00)',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                      opacity: isUpdating ? 0.7 : 1,
                    }}
                  >
                    {isUpdating ? '…' : NEXT_BTN_LABELS[order.status]}
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={isUpdating}
                    className="rounded-xl px-3.5 py-3.5 text-sm font-bold transition active:scale-95"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.20)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Completed orders */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>COMPLETED TODAY</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {done.slice(0, 10).map((order, i) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">#{order.orderNumber}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: STATUS_COLORS[order.status], color: STATUS_TEXT[order.status] }}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
