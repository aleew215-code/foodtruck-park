'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#0c0a07' }}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }} className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div
            className="h-20 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            An unexpected error occurred. Try refreshing the page or go back to the marketplace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c00)',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.70)',
            }}
          >
            <Home className="h-4 w-4" />
            Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
