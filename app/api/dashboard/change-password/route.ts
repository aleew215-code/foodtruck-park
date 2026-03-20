import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !user.password) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data:  { password: hashed, tempPassword: false },
  })

  return NextResponse.json({ ok: true })
}
