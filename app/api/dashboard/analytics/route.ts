import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'
import { startOfWeek, startOfMonth, subDays, subMonths, format, eachDayOfInterval, eachWeekOfInterval } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const view = req.nextUrl.searchParams.get('view') || 'weekly'
  const now = new Date()
  const startDate = view === 'weekly' ? subDays(now, 7) : subMonths(now, 1)

  const orders = await prisma.order.findMany({
    where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED', createdAt: { gte: startDate } },
    include: { items: true },
  })

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Repeat customers
  const allOrders = await prisma.order.findMany({ where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED' }, select: { customerId: true } })
  const custCounts = new Map<string, number>()
  for (const o of allOrders) custCounts.set(o.customerId, (custCounts.get(o.customerId) || 0) + 1)
  const repeats = Array.from(custCounts.values()).filter(v => v > 1).length
  const repeatCustomerRate = custCounts.size > 0 ? Math.round((repeats / custCounts.size) * 100) : 0

  // Top items
  const itemCounts = new Map<string, number>()
  for (const o of orders) for (const i of o.items) itemCounts.set(i.name, (itemCounts.get(i.name) || 0) + i.quantity)
  const topItems = Array.from(itemCounts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)

  // Chart data
  const days = eachDayOfInterval({ start: startDate, end: now })
  const chartData = days.map(day => {
    const label = format(day, view === 'weekly' ? 'EEE' : 'MMM d')
    const revenue = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).reduce((s, o) => s + o.total, 0)
    return { label, revenue }
  })

  return NextResponse.json({ totalRevenue, totalOrders, avgOrderValue, repeatCustomerRate, topItems, chartData })
}
