/**
 * /api/auth-admin/transfer
 *
 * Called by the admin layout when the user has a valid *customer* session
 * with role SUPER_ADMIN but doesn't yet have an admin-specific session cookie
 * (nap.admin).  We mint a new admin JWT from the customer session data.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()

  if (!session) redirect('/login')

  const role = (session.user as any).role
  if (role !== 'SUPER_ADMIN') redirect('/')

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('[transfer/admin] AUTH_SECRET is not set – cannot mint admin JWT')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Mint an admin-scoped JWT (salt must match the cookie name used by authAdmin)
  const token = await encode({
    token: {
      sub:          session.user.id,
      email:        session.user.email  ?? undefined,
      name:         session.user.name   ?? undefined,
      picture:      session.user.image  ?? undefined,
      role:         'SUPER_ADMIN',
      tempPassword: (session.user as any).tempPassword,
    },
    secret,
    salt:    'nap.admin',
    maxAge:  30 * 24 * 60 * 60,
  })

  const cookieStore = await cookies()
  cookieStore.set('nap.admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   30 * 24 * 60 * 60,
  })

  redirect('/admin')
}
