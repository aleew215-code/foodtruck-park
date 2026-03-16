import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendWelcomeEmailToFoodTruck } from '@/lib/email'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const trucks = await prisma.foodTruck.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(trucks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, email, cuisine, phone } = await req.json()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  const tempPassword = crypto.randomBytes(8).toString('hex')
  const hashed = await bcrypt.hash(tempPassword, 12)
  const user = await prisma.user.create({ data: { name, email, password: hashed, role: 'FOOD_TRUCK', tempPassword: true, phone: phone || null } })
  const truck = await prisma.foodTruck.create({ data: { userId: user.id, name, email, cuisine: cuisine || null } })
  try { await sendWelcomeEmailToFoodTruck(email, name, tempPassword) } catch {}
  return NextResponse.json({ truck: { ...truck, user: { email } } })
}
