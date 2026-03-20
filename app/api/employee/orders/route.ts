import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  const truckId = role === 'EMPLOYEE'
    ? (session.user as any).employeeTruckId
    : role === 'FOOD_TRUCK'
    ? (await prisma.foodTruck.findUnique({ where: { userId: session.user.id } }))?.id
    : null

  if (!truckId) return NextResponse.json({ error: 'No truck found' }, { status: 403 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: {
      foodTruckId: truckId,
      paymentStatus: 'COMPLETED',
      createdAt: { gte: today },
    },
    include: {
      items: true,
      customer: { select: { name: true, phone: true } },
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  return NextResponse.json(orders)
}
