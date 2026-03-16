import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const truck = await prisma.foodTruck.findUnique({
    where: { id },
    include: {
      menuCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { menuItems: { where: { isAvailable: true }, orderBy: { name: 'asc' } } },
      },
      menuItems: { where: { categoryId: null, isAvailable: true } },
      combos: { where: { isAvailable: true } },
      promotions: { where: { isActive: true, endDate: { gte: new Date() } } },
    },
  })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...truck,
    categories: truck.menuCategories.map(c => ({ id: c.id, name: c.name, items: c.menuItems })),
    uncategorized: truck.menuItems,
  })
}
