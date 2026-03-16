'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { ArrowLeft } from 'lucide-react'
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
    <div className="max-w-2xl lg:max-w-5xl mx-auto space-y-4 pb-10">
      <Link href="/checkout" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to checkout
      </Link>
      <h1 className="text-2xl font-bold">Payment</h1>

      {!clientSecret ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading secure payment form...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>
  )
}
