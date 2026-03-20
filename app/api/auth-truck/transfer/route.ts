/**
 * /api/auth-truck/transfer
 *
 * Called by the dashboard layout when the user has a valid *customer* session
 * with role FOOD_TRUCK but doesn't yet have a truck-specific session cookie
 * (nap.truck).  We mint a new truck JWT from the customer session data and set
 * the dedicated cookie so the two sessions are completely independent.
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
  if (role !== 'FOOD_TRUCK') redirect('/')

  // NextAuth v5 uses AUTH_SECRET; older setups may use NEXTAUTH_SECRET
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('[transfer] AUTH_SECRET is not set – cannot mint truck JWT')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Mint a truck-scoped JWT (salt must match the cookie name used by authTruck)
  const token = await encode({
    token: {
      sub:          session.user.id,
      email:        session.user.email  ?? undefined,
      name:         session.user.name   ?? undefined,
      picture:      session.user.image  ?? undefined,
      role:         'FOOD_TRUCK',
      tempPassword: (session.user as any).tempPassword,
    },
    secret,
    salt:    'nap.truck',
    maxAge:  30 * 24 * 60 * 60, // 30 days
  })

  const cookieStore = await cookies()
  cookieStore.set('nap.truck', token, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   30 * 24 * 60 * 60,
  })

  redirect('/dashboard')
}
