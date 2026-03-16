import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth, startOfWeek } from 'date-fns'

export default async function AdminRevenuePage() {
  const now = new Date()
  const [allTime, thisMonth, thisWeek, byTruck] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED' }, _sum: { commission: true, total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfMonth(now) } }, _sum: { commission: true, total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfWeek(now) } }, _sum: { commission: true, total: true }, _count: true }),
    prisma.order.groupBy({ by: ['foodTruckId'], where: { paymentStatus: 'COMPLETED' }, _sum: { total: true, commission: true }, _count: true }),
  ])

  const trucks = await prisma.foodTruck.findMany({ select: { id: true, name: true } })
  const truckMap = new Map(trucks.map(t => [t.id, t.name]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Revenue</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'All-Time Platform Revenue', value: formatCurrency(allTime._sum.commission || 0), sub: `${allTime._count} total orders` },
          { label: 'This Month', value: formatCurrency(thisMonth._sum.commission || 0), sub: `${thisMonth._count} orders · ${format(startOfMonth(now), 'MMMM yyyy')}` },
          { label: 'This Week', value: formatCurrency(thisWeek._sum.commission || 0), sub: `${thisWeek._count} orders` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold">Revenue by Food Truck</h2></div>
        <div className="divide-y divide-gray-50">
          {byTruck.sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0)).map(row => (
            <div key={row.foodTruckId} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{truckMap.get(row.foodTruckId) || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{row._count} orders</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(row._sum.total || 0)}</p>
                <p className="text-xs text-green-500">+{formatCurrency(row._sum.commission || 0)} fee</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
