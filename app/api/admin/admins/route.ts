import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' }, select: { id: true, name: true, email: true, createdAt: true } })
  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, email, password } = await req.json()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.user.create({ data: { name, email, password: hashed, role: 'SUPER_ADMIN' } })
  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email, createdAt: admin.createdAt })
}
