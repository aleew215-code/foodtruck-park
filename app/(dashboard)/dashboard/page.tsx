import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { DollarSign, ShoppingBag, Users, Star, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { LiveOrderQueue } from '@/components/dashboard/LiveOrderQueue'

export default async function DashboardOverview() {
  const session = await authTruck()
  if (!session) redirect('/login')

  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) redirect('/login')

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const [todayOrders, weekOrders, monthOrders, totalCustomers, recentOrders, activeOrders] = await Promise.all([
    prisma.order.aggregate({ where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED', createdAt: { gte: todayStart } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED', createdAt: { gte: weekStart } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED', createdAt: { gte: monthStart } }, _sum: { total: true }, _count: true }),
    prisma.order.findMany({ where: { foodTruckId: truck.id }, select: { customerId: true }, distinct: ['customerId'] }),
    prisma.order.findMany({ where: { foodTruckId: truck.id }, include: { items: true, customer: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.order.findMany({
      where: { foodTruckId: truck.id, status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY'] } },
      include: { items: true, customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const stats = [
    { label: "Today's Sales", value: formatCurrency(todayOrders._sum.total || 0), sub: `${todayOrders._count} orders`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Weekly Revenue', value: formatCurrency(weekOrders._sum.total || 0), sub: `${weekOrders._count} orders`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Monthly Revenue', value: formatCurrency(monthOrders._sum.total || 0), sub: `${monthOrders._count} orders`, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Customers', value: totalCustomers.length, sub: 'Unique customers', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">{format(now, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live Kitchen Queue */}
        <LiveOrderQueue truckId={truck.id} initialOrders={activeOrders} />

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.customer.name} · {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'h:mm a')}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <div className="px-6 py-8 text-center text-gray-400 text-sm">No orders yet today</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
