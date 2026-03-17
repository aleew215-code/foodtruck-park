import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { CartSync } from '@/components/CartSync'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role === 'FOOD_TRUCK') redirect('/dashboard')
  if (role === 'SUPER_ADMIN') redirect('/admin')

  return (
    /* ── Deep dark warm background ─────────────────────────── */
    <div className="min-h-screen relative" style={{ background: '#0c0a07' }}>

      {/* ── Floating background orbs (pure CSS, zero JS) ─────── */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      >
        {/* Orb A — large warm orange, top-left */}
        <div style={{
          position: 'absolute',
          top: '-15%', left: '-8%',
          width: '680px', height: '680px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.06) 45%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-a 28s ease-in-out infinite',
        }} />

        {/* Orb B — amber, bottom-right */}
        <div style={{
          position: 'absolute',
          bottom: '-10%', right: '-8%',
          width: '750px', height: '750px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, rgba(251,191,36,0.04) 45%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-b 34s ease-in-out infinite',
        }} />

        {/* Orb C — small soft orange, center-left */}
        <div style={{
          position: 'absolute',
          top: '40%', left: '30%',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'ag-orb-a 22s ease-in-out 8s infinite',
        }} />

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

      {/* ── All content sits above the orbs ─────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <CartSync />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-32">{children}</main>
        <InstallBanner />
      </div>
    </div>
  )
}
