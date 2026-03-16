import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.expires < new Date()) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed, tempPassword: false } })
  await prisma.passwordResetToken.delete({ where: { token } })
  return NextResponse.json({ ok: true })
}
