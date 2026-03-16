'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orders = searchParams.get('orders')
    if (!orders) { router.replace('/cart'); return }

    const orderIds = orders.split(',').filter(Boolean)

    fetch('/api/checkout/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.clientSecret) setClientSecret(d.clientSecret)
        else setError(d.error || 'Failed to initialize payment')
      })
      .catch(() => setError('Failed to connect to payment service'))
  }, [])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-3">
        <p className="text-red-500 font-medium">{error}</p>
        <Link href="/cart" className="text-orange-500 hover:underline text-sm">← Back to cart</Link>
      </div>
    )
  }

  return (
    /* Break out of layout padding entirely — take the full viewport */
    <div className="-mx-4 -mt-6 -mb-32 min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* ── Minimal top bar (back + secure badge, no logo duplication) ── */}
      <div className="relative z-10" style={{ background: '#111111', borderBottom: '1px solid #1f1f1f' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/checkout"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
            <span>256-bit SSL · Powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* ── Stripe embedded checkout ── */}
      <div className="flex-1 flex flex-col">
        {!clientSecret ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-32">
            <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading secure payment form…</p>
          </div>
        ) : (
          <>
            {/* On desktop → constrain width and center so no ugly side gaps */}
            <div className="hidden lg:flex flex-1 items-start justify-center py-8 px-6">
              <div
                className="w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ maxWidth: '960px', boxShadow: '0 0 0 1px #222, 0 25px 60px rgba(0,0,0,0.8)' }}
              >
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>

            {/* On mobile/tablet → full width, no extra padding */}
            <div className="lg:hidden flex-1">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </>
        )}
      </div>

      {/* ── Footer trust bar ── */}
      <div className="py-4 flex items-center justify-center gap-6 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> End-to-end encrypted
        </span>
        <span className="w-px h-3 bg-gray-700" />
        <span>No card details stored</span>
        <span className="w-px h-3 bg-gray-700" />
        <span>Cancel anytime before pickup</span>
      </div>
    </div>
  )
}
