import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { PushSetup } from '@/components/PushSetup'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'FOOD_TRUCK') redirect('/')

  const truck = await prisma.foodTruck.findUnique({
    where: { userId: session.user.id },
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
