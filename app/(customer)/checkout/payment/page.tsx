'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { ArrowLeft, Truck, Lock } from 'lucide-react'
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
        if (d.clientSecret) {
          setClientSecret(d.clientSecret)
        } else {
          setError(d.error || 'Failed to initialize payment')
        }
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
    // Break out of the layout's px-4 py-6 pb-32 padding
    <div className="-mx-4 -mt-6 -mb-32 min-h-screen flex flex-col">

      {/* Branded header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/checkout"
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Truck className="h-6 w-6" />
            <span>FoodTruck Park</span>
          </div>

          <div className="h-5 w-px bg-gray-200 mx-1" />

          <span className="text-sm text-gray-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-green-500" />
            Secure Checkout
          </span>
        </div>
      </div>

      {/* Stripe — full width, no container wrapper */}
      <div className="flex-1">
        {!clientSecret ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading secure payment form...</p>
          </div>
        ) : (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </div>
    </div>
  )
}
