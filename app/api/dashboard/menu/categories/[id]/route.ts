import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  // Verify the category belongs to the authenticated truck
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Truck not found' }, { status: 404 })

  const existing = await prisma.menuCategory.findUnique({ where: { id } })
  if (!existing || existing.foodTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()
  const cat = await prisma.menuCategory.update({ where: { id }, data })
  return NextResponse.json(cat)
}
