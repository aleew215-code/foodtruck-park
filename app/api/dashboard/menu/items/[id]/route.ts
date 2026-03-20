import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

async function getTruck(userId: string) {
  return prisma.foodTruck.findUnique({ where: { userId } })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const truck = await getTruck(session.user.id)
  if (!truck) return NextResponse.json({ error: 'Truck not found' }, { status: 404 })

  // Verify item belongs to this truck via foodTruckId (category may be null)
  const existing = await prisma.menuItem.findUnique({ where: { id } })
  if (!existing || existing.foodTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()
  const item = await prisma.menuItem.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const truck = await getTruck(session.user.id)
  if (!truck) return NextResponse.json({ error: 'Truck not found' }, { status: 404 })

  // Verify item belongs to this truck via foodTruckId (category may be null)
  const existing = await prisma.menuItem.findUnique({ where: { id } })
  if (!existing || existing.foodTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.menuItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
