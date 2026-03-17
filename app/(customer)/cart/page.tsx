'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, tableNumber, updateQuantity, removeItem, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)

  // Group by food truck
  const trucks = Array.from(new Set(items.map(i => i.foodTruckId))).map(truckId => ({
    truckId,
    truckName: items.find(i => i.foodTruckId === truckId)!.foodTruckName,
    items: items.filter(i => i.foodTruckId === truckId),
  }))

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 ag-page-enter">
        <div className="text-7xl mb-6 ag-float-slow">🛒</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Your cart is empty
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Browse food trucks and add items to get started
        </p>
        <Link href="/marketplace">
          <Button size="lg" className="px-8">Browse Food Trucks</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 ag-page-enter">

      {/* Back link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm transition"
        style={{ color: 'rgba(255,255,255,0.45)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: '#fff' }}
      >
        Your Cart
      </h1>

      {/* Table service banner */}
      {tableNumber && (
        <div
          className="ag-glass rounded-2xl px-4 py-3 flex items-center gap-3 text-sm font-medium"
          style={{ borderColor: 'rgba(249,115,22,0.28)', color: '#fba06a' }}
        >
          <span>🪑</span>
          <span>
            Ordering for Table{' '}
            <strong className="text-orange-400">{tableNumber}</strong>
          </span>
        </div>
      )}

      {/* Truck groups */}
      {trucks.map(({ truckId, truckName, items: truckItems }) => (
        <div
          key={truckId}
          className="ag-glass rounded-2xl overflow-hidden"
        >
          {/* Truck header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(249,115,22,0.06)',
              borderLeft: '3px solid rgba(249,115,22,0.60)',
            }}
          >
            <span className="text-lg">🚚</span>
            <h3 className="font-bold text-white text-sm">{truckName}</h3>
          </div>

          {/* Items */}
          <div>
            {truckItems.map((item, index) => (
              <div
                key={`${item.id}-${item.foodTruckId}`}
                className="px-4 py-4 flex gap-3 items-center"
                style={{
                  borderBottom: index < truckItems.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                }}
              >
                {/* Image */}
                {item.image && (
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'rgba(255,255,255,0.90)' }}>
                    {item.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(249,115,22,0.80)' }}>
                    {formatCurrency(item.price)} each
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) removeItem(item.id, truckId)
                      else updateQuantity(item.id, truckId, item.quantity - 1)
                    }}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition ag-press"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: item.quantity <= 1 ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.60)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = item.quantity <= 1
                        ? 'rgba(239,68,68,0.60)' : 'rgba(249,115,22,0.55)'
                      e.currentTarget.style.color = item.quantity <= 1
                        ? 'rgba(239,68,68,1)' : '#f97316'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                      e.currentTarget.style.color = item.quantity <= 1
                        ? 'rgba(239,68,68,0.75)' : 'rgba(255,255,255,0.60)'
                    }}
                  >
                    {item.quantity <= 1
                      ? <Trash2 className="h-3.5 w-3.5" />
                      : <Minus className="h-3.5 w-3.5" />
                    }
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, truckId, item.quantity + 1)}
                    className="h-7 w-7 rounded-full flex items-center justify-center transition ag-press"
                    style={{
                      background: 'rgba(249,115,22,0.15)',
                      border: '1px solid rgba(249,115,22,0.35)',
                      color: '#f97316',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(249,115,22,0.28)'
                      e.currentTarget.style.borderColor = 'rgba(249,115,22,0.65)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(249,115,22,0.15)'
                      e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Line total */}
                <span
                  className="font-bold w-16 text-right text-sm"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="ag-glass rounded-2xl p-5 space-y-4">
        <div
          className="flex justify-between text-sm"
          style={{ color: 'rgba(255,255,255,0.50)' }}
        >
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{formatCurrency(total)}</span>
        </div>

        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-extrabold text-lg text-white">Total</span>
          <span
            className="font-extrabold text-xl"
            style={{ color: '#f97316' }}
          >
            {formatCurrency(total)}
          </span>
        </div>

        <Link href="/checkout">
          <Button className="w-full" size="lg">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
