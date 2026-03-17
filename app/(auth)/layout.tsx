'use client'
import { useEffect, useRef } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080604' }}
    >
      {/* ── Background orbs ────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>

        {/* Primary orange orb — top left */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0.06) 45%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-a 26s ease-in-out infinite',
        }} />

        {/* Amber orb — bottom right */}
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '650px', height: '650px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.16) 0%, rgba(251,191,36,0.04) 45%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-b 32s ease-in-out infinite',
        }} />

        {/* Small center orb */}
        <div style={{
          position: 'absolute', top: '35%', left: '35%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-a 20s ease-in-out 6s infinite',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, transparent 10%, black 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 10%, black 80%)',
        }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,3,2,0.70) 100%)',
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
