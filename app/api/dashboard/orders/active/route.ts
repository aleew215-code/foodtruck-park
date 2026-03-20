import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truckId = req.nextUrl.searchParams.get('truckId')
  const orders = await prisma.order.findMany({
    where: { foodTruckId: truckId!, status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY'] } },
    include: { items: true, customer: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(orders)
}
