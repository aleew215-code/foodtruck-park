import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Derive truck from the authenticated session — never trust client-supplied truckId
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Truck not found' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: { foodTruckId: truck.id, status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY'] } },
    include: { items: true, customer: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(orders)
}
