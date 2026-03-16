'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Wallet, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { items, tableNumber, clearCart } = useCart()
  const [orderType, setOrderType] = useState<'PICKUP' | 'TABLE_SERVICE'>('PICKUP')
  const [pickupTime, setPickupTime] = useState('')
  const [table, setTable] = useState(String(tableNumber || ''))
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'WALLET'>('CARD')
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [truckDetails, setTruckDetails] = useState<Record<string, any>>({})

  const FL_TAX_RATE = 0.07 // Florida state (6%) + county (1%) sales tax
  const trucks = Array.from(new Set(items.map(i => i.foodTruckId)))
  const subtotalBeforeTax = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const taxAmount = subtotalBeforeTax * FL_TAX_RATE
  const total = subtotalBeforeTax + taxAmount

  useEffect(() => {
    fetch('/api/user/wallet').then(r => r.json()).then(d => setWalletBalance(d.balance || 0))
    trucks.forEach(id => {
      fetch(`/api/trucks/${id}`).then(r => r.json()).then(d => setTruckDetails(prev => ({ ...prev, [id]: d })))
    })
  }, [])

  async function handleCheckout() {
    if (orderType === 'TABLE_SERVICE' && !table) { toast('Please enter your table number', 'error'); return }
    if (orderType === 'PICKUP' && !pickupTime) { toast('Please select a pickup time', 'error'); return }
    if (paymentMethod === 'WALLET' && walletBalance < total) { toast(`Insufficient wallet balance. Need ${formatCurrency(total)}`, 'error'); return }

    setLoading(true)
    try {
      // Create one order per food truck
      const orderPromises = trucks.map(truckId => {
        const truckItems = items.filter(i => i.foodTruckId === truckId)
        const truckSubtotal = truckItems.reduce((s, i) => s + i.price * i.quantity, 0)
        const truckTax = truckSubtotal * FL_TAX_RATE
        return fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodTruckId: truckId,
            items: truckItems.map(i => ({ menuItemId: i.menuItemId, comboId: i.comboId, name: i.name, price: i.price, quantity: i.quantity, notes: i.notes })),
            orderType,
            tableNumber: orderType === 'TABLE_SERVICE' ? parseInt(table) : null,
            pickupTime: orderType === 'PICKUP' ? pickupTime : null,
            notes,
            paymentMethod,
            subtotal: truckSubtotal,
            tax: truckTax,
          }),
        }).then(r => r.json())
      })

      const results = await Promise.all(orderPromises)
      const failed = results.find(r => r.error)
      if (failed) { toast(failed.error, 'error'); return }

      clearCart()
      if (paymentMethod === 'CARD') {
        // Redirect to payment
        router.push(`/checkout/payment?orders=${results.map(r => r.id).join(',')}`)
      } else {
        toast('Order placed successfully!')
        router.push('/orders')
      }
    } catch {
      toast('Failed to place order', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return <div className="text-center py-20"><Link href="/marketplace" className="text-orange-500">Go back to marketplace</Link></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Order Type */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">How would you like your order?</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setOrderType('PICKUP')} className={`rounded-xl border-2 p-4 text-left transition ${orderType === 'PICKUP' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="text-2xl mb-2">🏃</div>
            <p className="font-semibold text-sm">Pickup</p>
            <p className="text-xs text-gray-500 mt-1">Pick up at the truck window</p>
          </button>
          <button onClick={() => setOrderType('TABLE_SERVICE')} className={`rounded-xl border-2 p-4 text-left transition ${orderType === 'TABLE_SERVICE' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="text-2xl mb-2">🪑</div>
            <p className="font-semibold text-sm">Table Service</p>
            <p className="text-xs text-gray-500 mt-1">Delivered to your table</p>
          </button>
        </div>

        {orderType === 'TABLE_SERVICE' && (
          <div className="mt-4">
            <Label>Table Number</Label>
            <Input value={table} onChange={e => setTable(e.target.value)} placeholder="e.g. 12" type="number" className="mt-1 max-w-xs" />
          </div>
        )}

        {orderType === 'PICKUP' && (
          <div className="mt-4">
            <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Pickup Time</Label>
            <Input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="mt-1 max-w-xs" />
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
        <div className="space-y-3">
          <button onClick={() => setPaymentMethod('CARD')} className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${paymentMethod === 'CARD' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <CreditCard className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-sm">Card / Apple Pay / Google Pay</p>
              <p className="text-xs text-gray-500">Secure payment via Stripe</p>
            </div>
          </button>
          <button onClick={() => setPaymentMethod('WALLET')} className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${paymentMethod === 'WALLET' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <Wallet className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-sm">Wallet Balance</p>
              <p className="text-xs text-gray-500">Available: {formatCurrency(walletBalance)}</p>
            </div>
            {paymentMethod === 'WALLET' && walletBalance < total && (
              <span className="ml-auto text-xs text-red-500 font-medium">Insufficient</span>
            )}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <Label>Special Instructions <span className="text-gray-400 font-normal">(optional)</span></Label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, special requests..." className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
        {items.map(item => (
          <div key={`${item.id}-${item.foodTruckId}`} className="py-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}x {item.name}</span>
              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.notes && (
              <p className="text-xs text-orange-600 mt-0.5 ml-3">📝 {item.notes}</p>
            )}
          </div>
        ))}
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalBeforeTax)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              FL Sales Tax <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-md font-medium">7%</span>
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(total)}</span>
          </div>
        </div>
        <Button onClick={handleCheckout} className="w-full mt-4" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {paymentMethod === 'CARD' ? 'Continue to Payment' : `Pay ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  )
}
