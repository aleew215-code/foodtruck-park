import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { id } = await params
  // Make sure the employee belongs to this truck
  const employee = await prisma.user.findUnique({ where: { id } })
  if (!employee || employee.employeeTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { isActive } = await req.json()
  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { id } = await params
  const employee = await prisma.user.findUnique({ where: { id } })
  if (!employee || employee.employeeTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
