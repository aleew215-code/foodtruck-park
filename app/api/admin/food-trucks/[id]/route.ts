import { NextRequest, NextResponse } from 'next/server'
import { authAdmin } from '@/lib/auth-admin'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authAdmin()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  const truck = await prisma.foodTruck.update({ where: { id }, data })
  return NextResponse.json(truck)
}
