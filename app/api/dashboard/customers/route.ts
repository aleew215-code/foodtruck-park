import { NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: { foodTruckId: truck.id, paymentStatus: 'COMPLETED' },
    include: { customer: true, items: true },
  })

  const customerMap = new Map<string, any>()
  for (const order of orders) {
    const c = order.customer
    if (!customerMap.has(c.id)) {
      customerMap.set(c.id, { id: c.id, name: c.name, email: c.email, phone: c.phone, image: c.image, allergies: c.allergies, orderCount: 0, totalSpent: 0, itemCounts: new Map() })
    }
    const entry = customerMap.get(c.id)
    entry.orderCount++
    entry.totalSpent += order.total
    for (const item of order.items) {
      entry.itemCounts.set(item.name, (entry.itemCounts.get(item.name) || 0) + item.quantity)
    }
  }

  const customers = Array.from(customerMap.values()).map(c => ({
    ...c,
    favoriteItems: Array.from(c.itemCounts.entries() as Iterable<[string, number]>).map(([name, count]) => ({ name, count })).sort((a: any, b: any) => b.count - a.count).slice(0, 5),
    itemCounts: undefined,
  }))

  return NextResponse.json(customers.sort((a, b) => b.orderCount - a.orderCount))
}
