import { auth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { CartSync } from '@/components/CartSync'
import { OrbParallax } from '@/components/OrbParallax'
import { PushSetup } from '@/components/PushSetup'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  // Marketplace is public — no auth required to browse.
  // Wallet / ordering features will prompt login when needed.

  return (
    /* Deep dark warm background */
    <div className="min-h-screen relative" style={{ background: '#0c0a07' }}>

      {/* Mouse-reactive parallax (client, zero DOM) */}
      <OrbParallax />

      {/* Floating background orbs (CSS animation + mouse parallax) */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      >
        {/* Orb A wrapper — moves WITH cursor */}
        <div style={{
          position: 'absolute',
          top: '-15%', left: '-8%',
          transform: 'translate(var(--orb-x, 0px), var(--orb-y, 0px))',
        }}>
          <div style={{
            width: '680px', height: '680px',
            background: 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.06) 45%, transparent 70%)',
            borderRadius: '50%',
            animation: 'ag-orb-a 28s ease-in-out infinite',
          }} />
        </div>

        {/* Orb B wrapper — moves AGAINST cursor (depth illusion) */}
        <div style={{
          position: 'absolute',
          bottom: '-10%', right: '-8%',
          transform: 'translate(var(--orb-x2, 0px), var(--orb-y2, 0px))',
        }}>
          <div style={{
            width: '750px', height: '750px',
            background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, rgba(251,191,36,0.04) 45%, transparent 70%)',
            borderRadius: '50%',
            animation: 'ag-orb-b 34s ease-in-out infinite',
          }} />
        </div>

        {/* Orb C wrapper */}
        <div style={{
          position: 'absolute',
          top: '40%', left: '30%',
          transform: 'translate(calc(var(--orb-x, 0px) * 0.6), calc(var(--orb-y, 0px) * 0.6))',
        }}>
          <div style={{
            width: '320px', height: '320px',
            background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'ag-orb-a 22s ease-in-out 8s infinite',
          }} />
        </div>

        {/* Subtle grid overlay for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, black 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 0%, black 80%)',
        }} />
      </div>

      {/* All content sits above the background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <CartSync />
        <PushSetup />
        <Navbar />
        {/* pb-28 on mobile for bottom nav; pb-8 on desktop */}
        <main className="mx-auto max-w-7xl px-4 py-6 pb-28 lg:pb-8">{children}</main>
        <BottomNav />
        <InstallBanner />
      </div>
    </div>
  )
}
