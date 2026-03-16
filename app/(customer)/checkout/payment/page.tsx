'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CheckoutPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

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
        if (d.url) {
          window.location.href = d.url
        } else {
          router.replace('/orders')
        }
      })
      .catch(() => router.replace('/orders'))
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      <p className="text-gray-600 font-medium">Redirecting to secure payment...</p>
      <p className="text-sm text-gray-400">Please don't close this window</p>
    </div>
  )
}
