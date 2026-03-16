'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, CheckCircle, ChefHat, Package, Truck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

const STATUS_STEPS = ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED']

const STATUS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: 'Order Received', icon: Clock, color: 'text-gray-500' },
  CONFIRMED: { label: 'Order Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  PREPARING: { label: 'Being Prepared', icon: ChefHat, color: 'text-yellow-500' },
  READY: { label: 'Ready!', icon: Package, color: 'text-green-500' },
  ON_THE_WAY: { label: 'On the Way', icon: Truck, color: 'text-orange-500' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', icon: Clock, color: 'text-red-500' },
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => { setOrder(d); setLoading(false) })

    // Poll for status updates
    const interval = setInterval(() => {
      fetch(`/api/orders/${id}`)
        .then(r => r.json())
        .then(d => setOrder(d))
    }, 10000)
    return () => clearInterval(interval)
  }, [id])

  async function submitReview() {
    if (!rating) return
    setReviewing(true)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodTruckId: order.foodTruckId, orderId: order.id, rating, comment }),
    })
    setReviewing(false)
    setOrder((o: any) => ({ ...o, reviewed: true }))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>

  const info = STATUS_INFO[order.status] || STATUS_INFO.PENDING
  const Icon = info.icon
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> My Orders
      </Link>

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-3 ${info.color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{info.label}</h2>
        <p className="text-gray-500 text-sm mt-1">Order #{order.orderNumber}</p>
        {order.estimatedReadyAt && order.status !== 'DELIVERED' && (
          <p className="text-sm text-orange-500 font-medium mt-2 flex items-center justify-center gap-1">
            <Clock className="h-4 w-4" /> Est. ready: {format(new Date(order.estimatedReadyAt), 'h:mm a')}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center">
            {STATUS_STEPS.slice(0, order.orderType === 'PICKUP' ? 4 : 5).map((step, i, arr) => {
              const done = currentStep >= i
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                  {i < arr.length - 1 && <div className={`h-1 flex-1 mx-1 rounded ${currentStep > i ? 'bg-orange-500' : 'bg-gray-100'}`} />}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Confirmed</span>
            <span>Preparing</span>
            <span>Ready</span>
            {order.orderType === 'TABLE_SERVICE' && <span>On way</span>}
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{order.foodTruck.name}</h3>
          {order.tableNumber && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" /> Table {order.tableNumber}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}x {item.name}</span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span><span className="text-orange-500">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Ordered {format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
        </div>
      </div>

      {/* Review */}
      {order.status === 'DELIVERED' && !order.reviewed && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Rate your experience</h3>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${rating >= n ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..." className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} />
          <button onClick={submitReview} disabled={!rating || reviewing} className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50">
            {reviewing ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}
    </div>
  )
}
