import { redirect } from 'next/navigation'
import { authTruck } from '@/lib/auth-truck'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { PushSetup } from '@/components/PushSetup'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Check for truck-specific session cookie (nap.truck)
  const truckSession = await authTruck()

  if (!truckSession) {
    // No truck cookie yet — check if the user just logged in via the main login
    // page (which sets the shared customer cookie).  If so, mint the truck cookie
    // transparently and redirect back here.
    const customerSession = await auth()
    if (customerSession && (customerSession.user as any).role === 'FOOD_TRUCK') {
      redirect('/api/auth-truck/transfer')
    }
    redirect('/login')
  }

  const tempPassword = (truckSession.user as any).tempPassword

  const truck = await prisma.foodTruck.findUnique({
    where:  { userId: truckSession.user.id },
    select: { id: true, name: true, logo: true, isOpen: true },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PushSetup />
      <DashboardNav truckName={truck?.name ?? null} truckLogo={truck?.logo ?? null} />

      {/* Main content — offset for sidebar on desktop, top bar on mobile */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        {/* Temporary password warning banner */}
        {tempPassword && (
          <Link
            href="/dashboard/change-password"
            className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl text-sm font-medium transition hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.15))',
              border: '1px solid rgba(251,191,36,0.30)',
              color: '#b45309',
            }}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              You&apos;re using a temporary password.{' '}
              <span className="underline font-semibold">Click here to set a permanent one</span>
              {' '}before you get locked out.
            </span>
          </Link>
        )}
        {children}
      </main>
    </div>
  )
}
