import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const categories = await prisma.menuCategory.findMany({
    where: { foodTruckId: truck.id },
    include: { menuItems: { orderBy: { name: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  const uncategorized = await prisma.menuItem.findMany({ where: { foodTruckId: truck.id, categoryId: null }, orderBy: { name: 'asc' } })
  return NextResponse.json({ categories, uncategorized })
}
