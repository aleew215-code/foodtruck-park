import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { name, description, price, categoryId, image, isAvailable, isPopular } = await req.json()
  const item = await prisma.menuItem.create({ data: { foodTruckId: truck.id, name, description, price, categoryId: categoryId || null, image: image || null, isAvailable, isPopular } })
  return NextResponse.json(item)
}
