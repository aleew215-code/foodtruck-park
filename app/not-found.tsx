'use client'
import Link from 'next/link'
import { Truck, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#0c0a07' }}
    >
      {/* Background orb */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }} className="space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="h-24 w-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f97316, #c2520e)',
              boxShadow: '0 8px 40px rgba(249,115,22,0.40)',
            }}
          >
            <Truck className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div>
          <p
            className="text-8xl font-black"
            style={{
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            404
          </p>
          <h1 className="text-2xl font-bold text-white mt-3">Page not found</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Looks like this food truck drove away. The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c00)',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            }}
          >
            <Home className="h-4 w-4" />
            Go to Marketplace
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.70)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
