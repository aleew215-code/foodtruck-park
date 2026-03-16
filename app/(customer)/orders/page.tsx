'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PREPARING: { label: 'Preparing', variant: 'warning' },
  READY: { label: 'Ready', variant: 'success' },
  ON_THE_WAY: { label: 'On the way', variant: 'default' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders/my-orders')
      .then(r => r.json())
      .then(d => { setOrders(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium">No orders yet</p>
          <Link href="/marketplace" className="mt-4 inline-block text-orange-500 text-sm hover:underline">Browse food trucks</Link>
        </div>
      ) : (
        orders.map(order => {
          const { label, variant } = STATUS_LABELS[order.status] || { label: order.status, variant: 'secondary' }
          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{order.foodTruck.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">#{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={variant}>{label}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
