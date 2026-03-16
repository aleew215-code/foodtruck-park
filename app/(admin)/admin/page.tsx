import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Users, Truck, ShoppingBag, DollarSign } from 'lucide-react'

export default async function AdminOverviewPage() {
  const [totalCustomers, totalTrucks, totalOrders, revenueData, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.foodTruck.count(),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED' }, _sum: { commission: true, total: true } }),
    prisma.order.findMany({ include: { customer: { select: { name: true } }, foodTruck: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const stats = [
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Food Trucks', value: totalTrucks, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Platform Revenue', value: formatCurrency(revenueData._sum.commission || 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Recent Orders</h2></div>
        <div className="divide-y divide-gray-50">
          {recentOrders.map(order => (
            <div key={order.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-gray-500">{order.customer.name} → {order.foodTruck.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                <p className="text-xs text-green-500">+{formatCurrency(order.commission)} fee</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
