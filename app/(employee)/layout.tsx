import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  const role = (session.user as any).role
  if (role !== 'EMPLOYEE') {
    if (role === 'FOOD_TRUCK') redirect('/dashboard')
    if (role === 'SUPER_ADMIN') redirect('/admin')
    redirect('/marketplace')
  }

  const employeeTruckId = (session.user as any).employeeTruckId
  const truck = employeeTruckId
    ? await prisma.foodTruck.findUnique({ where: { id: employeeTruckId }, select: { name: true, logo: true } })
    : null

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(15,15,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          {truck?.logo && (
            <img src={truck.logo} alt="" className="h-9 w-9 rounded-xl object-cover" />
          )}
          <div>
            <p className="font-bold text-white text-lg leading-tight">{truck?.name ?? 'Food Truck'}</p>
            <p className="text-xs" style={{ color: 'rgba(249,115,22,0.85)' }}>Employee Terminal</p>
          </div>
        </div>
        <a
          href="/api/auth/signout?callbackUrl=/login"
          className="rounded-xl px-4 py-2 text-sm font-medium transition"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Sign Out
        </a>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  )
}
