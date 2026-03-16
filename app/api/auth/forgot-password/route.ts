import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  // Always return 200 to avoid user enumeration
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email } })
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: { email, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
      })
      try { await sendPasswordResetEmail(email, token) } catch {}
    }
  } catch {}
  return NextResponse.json({ ok: true })
}
