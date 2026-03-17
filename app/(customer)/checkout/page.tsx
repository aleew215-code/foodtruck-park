'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Wallet, Clock, Loader2, CheckCircle2 } from 'lucide-react'
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

  if (items.length === 0) return (
    <div className="text-center py-20 ag-page-enter">
      <Link href="/marketplace" className="text-orange-400 hover:text-orange-300 transition">
        Go back to marketplace
      </Link>
    </div>
  )

  /* ── Shared panel style ─────────────────────────────────────── */
  const panelStyle = {
    borderRadius: '16px',
    overflow: 'hidden' as const,
  }

  /* ── Selection card helpers ─────────────────────────────────── */
  function selectionCard(isActive: boolean) {
    return {
      border: isActive ? '1.5px solid rgba(249,115,22,0.65)' : '1px solid rgba(255,255,255,0.08)',
      background: isActive ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.03)',
      boxShadow: isActive ? '0 0 18px rgba(249,115,22,0.14), inset 0 0 12px rgba(249,115,22,0.04)' : 'none',
      borderRadius: '12px',
      transition: 'all 0.22s ease',
      cursor: 'pointer',
      padding: '16px',
      textAlign: 'left' as const,
      width: '100%',
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 ag-page-enter">

      {/* Back link */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm transition"
        style={{ color: 'rgba(255,255,255,0.45)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight text-white">Checkout</h1>

      {/* ── Order Type ────────────────────────────────────────── */}
      <div className="ag-glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-white">How would you like your order?</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setOrderType('PICKUP')} style={selectionCard(orderType === 'PICKUP')}>
            <div className="text-2xl mb-2">🏃</div>
            <p className="font-bold text-sm text-white">Pickup</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Pick up at the truck window
            </p>
            {orderType === 'PICKUP' && (
              <CheckCircle2 className="h-4 w-4 text-orange-400 mt-2" />
            )}
          </button>
          <button onClick={() => setOrderType('TABLE_SERVICE')} style={selectionCard(orderType === 'TABLE_SERVICE')}>
            <div className="text-2xl mb-2">🪑</div>
            <p className="font-bold text-sm text-white">Table Service</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Delivered to your table
            </p>
            {orderType === 'TABLE_SERVICE' && (
              <CheckCircle2 className="h-4 w-4 text-orange-400 mt-2" />
            )}
          </button>
        </div>

        {orderType === 'TABLE_SERVICE' && (
          <div className="mt-2">
            <Label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>Table Number</Label>
            <Input
              value={table}
              onChange={e => setTable(e.target.value)}
              placeholder="e.g. 12"
              type="number"
              className="mt-1 max-w-xs ag-input"
            />
          </div>
        )}

        {orderType === 'PICKUP' && (
          <div className="mt-2">
            <Label className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
              <Clock className="h-4 w-4 text-orange-400" />
              Pickup Time
            </Label>
            <Input
              type="time"
              value={pickupTime}
              onChange={e => setPickupTime(e.target.value)}
              className="mt-1 max-w-xs ag-input"
            />
          </div>
        )}
      </div>

      {/* ── Payment Method ───────────────────────────────────── */}
      <div className="ag-glass rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-white">Payment Method</h2>
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('CARD')}
            style={selectionCard(paymentMethod === 'CARD')}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <CreditCard className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Card / Apple Pay / Google Pay</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  Secure payment via Stripe
                </p>
              </div>
              {paymentMethod === 'CARD' && (
                <CheckCircle2 className="h-4 w-4 text-orange-400 ml-auto shrink-0" />
              )}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('WALLET')}
            style={selectionCard(paymentMethod === 'WALLET')}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
              >
                <Wallet className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Wallet Balance</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  Available: {formatCurrency(walletBalance)}
                </p>
              </div>
              {paymentMethod === 'WALLET' && walletBalance < total && (
                <span className="ml-auto text-xs text-red-400 font-semibold shrink-0">Insufficient</span>
              )}
              {paymentMethod === 'WALLET' && walletBalance >= total && (
                <CheckCircle2 className="h-4 w-4 text-orange-400 ml-auto shrink-0" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* ── Special Instructions ─────────────────────────────── */}
      <div className="ag-glass rounded-2xl p-5">
        <Label style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
          Special Instructions{' '}
          <span style={{ color: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>(optional)</span>
        </Label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Allergies, special requests..."
          rows={3}
          className="mt-2 w-full rounded-xl p-3 text-sm resize-none outline-none transition ag-input"
          style={{ minHeight: '80px' }}
        />
      </div>

      {/* ── Order Summary ────────────────────────────────────── */}
      <div className="ag-glass rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-white">Order Summary</h2>

        {/* Items */}
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={`${item.id}-${item.foodTruckId}`}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.60)' }}>
                  {item.quantity}× {item.name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.80)' }}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
              {item.notes && (
                <p className="text-xs mt-0.5 ml-3" style={{ color: 'rgba(249,115,22,0.70)' }}>
                  📝 {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          className="space-y-2 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalBeforeTax)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
            <span>Taxes &amp; Service Fees</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        </div>

        {/* Grand total */}
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-extrabold text-lg text-white">Total</span>
          <span className="font-extrabold text-2xl" style={{ color: '#f97316' }}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* CTA */}
        <Button
          onClick={handleCheckout}
          className="w-full mt-2"
          size="lg"
          disabled={loading}
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {paymentMethod === 'CARD' ? 'Continue to Payment' : `Pay ${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  )
}
