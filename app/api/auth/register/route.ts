import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, allergies } = await req.json()
    if (!email || !password || !name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone: phone || null, allergies: allergies || [], role: 'CUSTOMER' },
    })
    // Send verification email
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })
    try { await sendVerificationEmail(email, token) } catch {}
    return NextResponse.json({ id: user.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
