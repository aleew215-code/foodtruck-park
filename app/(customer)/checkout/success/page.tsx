'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verified, setVerified] = useState(false)
  const [orderNumbers, setOrderNumbers] = useState<string[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    const orders = searchParams.get('orders')
    const sessionId = searchParams.get('session_id')

    if (!orders || !sessionId) { router.replace('/orders'); return }

    // Verify payment with backend
    fetch('/api/checkout/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: orders.split(','), sessionId }),
    })
      .then(r => r.json())
      .then(d => {
        setOrderNumbers(d.orderNumbers || [])
        setVerified(true)
        setTimeout(() => setShow(true), 100)
      })
      .catch(() => {
        setVerified(true)
        setShow(true)
      })
  }, [])

  if (!verified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <p className="text-gray-500 text-sm">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div
        className="flex flex-col items-center text-center px-6"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out',
        }}
      >
        {/* Animated green circle checkmark */}
        <div
          className="relative mb-8"
          style={{
            animation: show ? 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none',
          }}
        >
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes drawCheck {
              0% { stroke-dashoffset: 100; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes ripple {
              0% { transform: scale(1); opacity: 0.4; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>

          {/* Ripple effect */}
          <div
            className="absolute inset-0 rounded-full bg-green-400"
            style={{ animation: show ? 'ripple 1s ease-out 0.3s forwards' : 'none', opacity: 0 }}
          />

          {/* Green circle */}
          <div className="h-28 w-28 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <svg
              className="h-14 w-14 text-white"
              viewBox="0 0 52 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M14 27l9 9 16-18"
                strokeDasharray="100"
                strokeDashoffset="100"
                style={{ animation: show ? 'drawCheck 0.5s ease-out 0.4s forwards' : 'none' }}
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ transitionDelay: '0.3s', opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}
        >
          ¡Orden Confirmada!
        </h1>
        <p
          className="text-gray-500 text-lg mb-2"
          style={{ transitionDelay: '0.4s', opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}
        >
          Tu pago fue procesado exitosamente
        </p>

        {orderNumbers.length > 0 && (
          <div
            className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-3 mb-8 mt-2"
            style={{ transitionDelay: '0.5s', opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.5s' }}
          >
            <p className="text-sm text-gray-500">
              {orderNumbers.length === 1 ? 'Orden' : 'Órdenes'} #
              {orderNumbers.join(', #')}
            </p>
          </div>
        )}

        <div
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
          style={{ transitionDelay: '0.6s', opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
        >
          <Link href="/orders" className="flex-1">
            <Button className="w-full" size="lg">Ver mis órdenes</Button>
          </Link>
          <Link href="/marketplace" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
