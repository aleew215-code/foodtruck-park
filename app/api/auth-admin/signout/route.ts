/**
 * /api/auth-admin/signout
 *
 * Clears both the admin session cookie (nap.admin) and the shared customer
 * session cookie so the user is fully signed out.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

export async function GET() {
  const cookieStore = await cookies()

  // Clear admin-specific cookie
  cookieStore.delete('nap.admin')

  // Clear customer session cookies (dev name + production __Secure- prefix)
  cookieStore.delete('next-auth.session-token')
  cookieStore.delete('__Secure-next-auth.session-token')

  redirect('/login')
}
