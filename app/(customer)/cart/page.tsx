'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse food trucks and add items to get started</p>
        <Link href="/marketplace"><Button>Browse Food Trucks</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="text-2xl font-bold">Your Cart</h1>

      {tableNumber && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm font-medium text-orange-800">
          🪑 Ordering for Table <strong>{tableNumber}</strong>
        </div>
      )}

      {trucks.map(({ truckId, truckName, items: truckItems }) => (
        <div key={truckId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">{truckName}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {truckItems.map(item => (
              <div key={`${item.id}-${item.foodTruckId}`} className="px-4 py-4 flex gap-3 items-center">
                {item.image && (
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (item.quantity <= 1) removeItem(item.id, truckId); else updateQuantity(item.id, truckId, item.quantity - 1) }} className="h-7 w-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition">
                    {item.quantity <= 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  </button>
                  <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, truckId, item.quantity + 1)} className="h-7 w-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-semibold text-gray-900 w-16 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Link href="/checkout">
          <Button className="w-full mt-2" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
