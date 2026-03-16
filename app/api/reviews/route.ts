import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { foodTruckId, orderId, rating, comment } = await req.json()
  await prisma.review.create({ data: { customerId: session.user.id, foodTruckId, orderId, rating, comment } })
  // Update truck rating
  const reviews = await prisma.review.findMany({ where: { foodTruckId }, select: { rating: true } })
  const avg = reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
  await prisma.foodTruck.update({ where: { id: foodTruckId }, data: { rating: avg, totalRatings: reviews.length } })
  return NextResponse.json({ ok: true })
}
