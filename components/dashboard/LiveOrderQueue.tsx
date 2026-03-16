'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Clock, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_NEXT: Record<string, string> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'ON_THE_WAY',
  ON_THE_WAY: 'DELIVERED',
}

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PREPARING: { label: 'Preparing', variant: 'warning' },
  READY: { label: 'Ready', variant: 'success' },
  ON_THE_WAY: { label: 'On the Way', variant: 'default' },
}

export function LiveOrderQueue({ truckId, initialOrders }: { truckId: string; initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/dashboard/orders/active?truckId=${truckId}`)
        .then(r => r.json())
        .then(setOrders)
    }, 8000)
    return () => clearInterval(interval)
  }, [truckId])

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    await fetch(`/api/dashboard/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setOrders(prev => newStatus === 'DELIVERED'
      ? prev.filter(o => o.id !== orderId)
      : prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    )
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Live Kitchen Queue</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">{orders.length} active</span>
        </div>
      </div>
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No active orders 🎉</div>
        ) : (
          orders.map(order => {
            const { label, variant } = STATUS_LABELS[order.status] || { label: order.status, variant: 'secondary' }
            const nextStatus = STATUS_NEXT[order.status]
            return (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">#{order.orderNumber}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.customer.name}</span>
                      {order.tableNumber && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Table {order.tableNumber}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(order.createdAt), 'h:mm a')}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-orange-500">{formatCurrency(order.total)}</span>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                </div>
                {nextStatus && (
                  <Button size="sm" onClick={() => updateStatus(order.id, nextStatus)} disabled={updating === order.id} className="text-xs h-8">
                    {updating === order.id ? 'Updating...' : `Mark as ${nextStatus.replace('_', ' ')}`}
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
