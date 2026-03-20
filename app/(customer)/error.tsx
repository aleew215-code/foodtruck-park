'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-6">
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.20)' }}
      >
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#f97316,#ea6c00)' }}
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/marketplace"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
        >
          Marketplace
        </Link>
      </div>
    </div>
  )
}
