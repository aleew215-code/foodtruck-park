import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const cat = await prisma.menuCategory.update({ where: { id }, data })
  return NextResponse.json(cat)
}
