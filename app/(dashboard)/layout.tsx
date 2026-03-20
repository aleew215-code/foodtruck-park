import { redirect } from 'next/navigation'
import { authTruck } from '@/lib/auth-truck'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { PushSetup } from '@/components/PushSetup'

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
        {children}
      </main>
    </div>
  )
}
