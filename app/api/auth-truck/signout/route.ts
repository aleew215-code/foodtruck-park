/**
 * /api/auth-truck/signout
 *
 * Clears both the truck session cookie (nap.truck) and the shared customer
 * session cookie so the user is fully signed out and won't be auto-transferred
 * back into the dashboard on next visit.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

const EXPIRED = { value: '', maxAge: 0, path: '/' }

export async function GET() {
  const cookieStore = await cookies()

  // Force-expire every possible variant of each session cookie.
  // Using set(name, '', { maxAge: 0 }) is more reliable than delete()
  // in production because it matches the original Set-Cookie attributes.
  const isProd = process.env.NODE_ENV === 'production'

  const names = [
    'nap.truck',
    'nap.admin',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
  ]
  for (const name of names) {
    // Set with the same security attributes used when the cookie was created
    // so the browser recognises it as the same cookie and expires it.
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
