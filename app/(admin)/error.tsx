'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-1 text-sm text-gray-500">An unexpected error occurred in the admin panel.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 transition"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
          Admin Home
        </Link>
      </div>
    </div>
  )
}
