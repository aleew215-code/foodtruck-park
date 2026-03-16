import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || record.expires < new Date()) return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } })
  await prisma.verificationToken.delete({ where: { token } })
  return NextResponse.redirect(new URL('/marketplace?verified=1', req.url))
}
