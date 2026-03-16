import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const order = await prisma.order.findFirst({
    where: { id, customerId: session.user.id },
    include: { foodTruck: { select: { name: true, logo: true, smsFromNumber: true } }, items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
