import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const trucks = await prisma.foodTruck.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, description: true, logo: true,
      cuisine: true, rating: true, totalRatings: true,
      avgPrepTime: true, isOpen: true, tableServiceEnabled: true,
    },
    orderBy: { rating: 'desc' },
  })
  return NextResponse.json(trucks)
}
