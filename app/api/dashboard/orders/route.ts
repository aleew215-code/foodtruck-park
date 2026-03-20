import { NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const orders = await prisma.order.findMany({
    where: { foodTruckId: truck.id },
    include: { items: true, customer: { select: { name: true, phone: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(orders)
}
