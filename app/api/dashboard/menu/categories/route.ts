import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { name, description } = await req.json()
  const cat = await prisma.menuCategory.create({ data: { foodTruckId: truck.id, name, description } })
  return NextResponse.json(cat)
}
