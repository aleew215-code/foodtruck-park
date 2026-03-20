/**
 * /api/auth-admin/signout
 *
 * Clears both the admin session cookie (nap.admin) and the shared customer
 * session cookie so the user is fully signed out.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

const EXPIRED = { value: '', maxAge: 0, path: '/' }

export async function GET() {
  const cookieStore = await cookies()

  const isProd = process.env.NODE_ENV === 'production'

  const names = [
    'nap.truck',
    'nap.admin',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
  ]
  for (const name of names) {
    try {
      cookieStore.set(name, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
      })
    } catch {}
  }

  redirect('/login')
}
