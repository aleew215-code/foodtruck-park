import { NextRequest, NextResponse } from 'next/server'
import { authAdmin } from '@/lib/auth-admin'
import { prisma } from '@/lib/db'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authAdmin()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.table.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
