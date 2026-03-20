'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, CheckCircle2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'

const STEPS = [
  { key:'CONFIRMED',  label:'Confirmed',  icon:'✅' },
  { key:'PREPARING',  label:'Preparing',  icon:'👨‍🍳' },
  { key:'READY',      label:'Ready',       icon:'🎉' },
  { key:'DELIVERED',  label:'Delivered',  icon:'😋' },
]

const STATUS_MSG: Record<string, { title: string; sub: string; color: string }> = {
  PENDING:    { title:'Order Received',    sub:'Waiting for the truck to confirm…',    color:'#eab308' },
  CONFIRMED:  { title:'Order Confirmed!',  sub:'The food truck has your order.',        color:'#3b82f6' },
  PREPARING:  { title:'Being Prepared',    sub:'The kitchen is working on your food.', color:'#f97316' },
  READY:      { title:'Ready for Pickup!', sub:'Your order is ready!',                 color:'#22c55e' },
  ON_THE_WAY: { title:'On the Way!',       sub:'Your order is coming to your table.',  color:'#a855f7' },
  DELIVERED:  { title:'Enjoy your meal!',  sub:'Hope you love it!',                    color:'#22c55e' },
  CANCELLED:  { title:'Order Cancelled',   sub:'This order has been cancelled.',        color:'#ef4444' },
}

const EMOJI: Record<string,string> = {
  PENDING:'🕐', CONFIRMED:'✅', PREPARING:'👨‍🍳', READY:'🎉', ON_THE_WAY:'🛵', DELIVERED:'😋', CANCELLED:'❌'
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder]       = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [reviewed, setReviewed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = () => fetch(`/api/orders/${id}`).then(r=>r.json()).then(d=>{setOrder(d);setLoading(false)})
    load()
    const iv = setInterval(load, 8000)
    return () => clearInterval(iv)
  }, [id])

  async function submitReview() {
    if (!rating) return
    setSubmitting(true)
    await fetch('/api/reviews', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ foodTruckId:order.foodTruckId, orderId:order.id, rating, comment }),
    })
    setReviewed(true); setSubmitting(false)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"/>
    </div>
  )
  if (!order?.id) return <div className="text-center py-20 text-gray-500">Order not found</div>

  const info       = STATUS_MSG[order.status] || STATUS_MSG.PENDING
  const currentIdx = STEPS.findIndex(s => s.key === order.status)
  const activeSteps = order.orderType === 'PICKUP' ? STEPS.slice(0,3) : STEPS

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition">
        <ArrowLeft className="h-4 w-4"/> My Orders
      </Link>

      <div className="rounded-3xl p-6 text-center"
        style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${info.color}30`, boxShadow:`0 0 40px ${info.color}10` }}>
        <div className="text-5xl mb-3">{EMOJI[order.status] || '🕐'}</div>
        <h2 className="text-xl font-black text-white">{info.title}</h2>
        <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.45)' }}>{info.sub}</p>
        <div className="mt-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-2"
          style={{ background:`${info.color}15`, color:info.color, border:`1px solid ${info.color}30` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:info.color }}/>
          Order #{order.orderNumber}
        </div>
      </div>

      {order.status !== 'CANCELLED' && (
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center">
            {activeSteps.map((step, i) => {
              const done = currentIdx >= i || order.status === 'DELIVERED'
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all"
                      style={{
                        background: done ? 'linear-gradient(135deg,#f97316,#ea6c00)' : 'rgba(255,255,255,0.07)',
                        boxShadow:  done ? '0 0 16px rgba(249,115,22,0.40)' : 'none',
                      }}>
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: done?'#f97316':'rgba(255,255,255,0.30)' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < activeSteps.length-1 && (
                    <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full"
                      style={{ background: currentIdx > i ? 'linear-gradient(to right,#f97316,#ea6c00)' : 'rgba(255,255,255,0.08)' }}/>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5 space-y-4" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{ background:'rgba(249,115,22,0.15)' }}>
            {order.foodTruck?.logo
              ? <Image src={order.foodTruck.logo} alt={order.foodTruck.name} width={40} height={40} className="object-cover w-full h-full"/>
              : <Package className="h-5 w-5 text-orange-400"/>}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{order.foodTruck?.name}</p>
            {order.tableNumber && (
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Table {order.tableNumber}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <span className="text-sm text-gray-300"><span className="font-bold text-orange-400">{item.quantity}x</span> {item.name}</span>
                {item.notes && <p className="text-xs text-gray-500 mt-0.5">📝 {item.notes}</p>}
              </div>
              <span className="text-sm text-gray-400 ml-4 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>Taxes & Service Fees</span><span>{formatCurrency(order.total - order.subtotal)}</span></div>
          <div className="flex justify-between font-black text-white"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>

        <p className="text-xs text-gray-600 flex items-center gap-1 pt-1">
          <Clock className="h-3 w-3"/> Ordered {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
        </p>
      </div>

      {order.status === 'DELIVERED' && !reviewed && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.20)' }}>
          <div>
            <h3 className="font-bold text-white">Rate your experience</h3>
            <p className="text-xs text-gray-500 mt-0.5">How was {order.foodTruck?.name}?</p>
          </div>
          <div className="flex gap-3">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                className="text-3xl transition-transform hover:scale-125 active:scale-95"
                style={{ opacity: rating >= n ? 1 : 0.25 }}>⭐</button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Tell us about your experience…"
            className="w-full rounded-xl p-3 text-sm resize-none focus:outline-none"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.80)' }}
            rows={3}/>
          <button onClick={submitReview} disabled={!rating || submitting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#f97316,#ea6c00)' }}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      )}

      {reviewed && (
        <div className="rounded-2xl p-5 text-center" style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.20)' }}>
          <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2"/>
          <p className="text-white font-bold">Thanks for your review!</p>
        </div>
      )}
    </div>
  )
}
