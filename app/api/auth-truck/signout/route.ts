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

export async function GET() {
  const cookieStore = await cookies()

  // Clear truck-specific cookie
  cookieStore.delete('nap.truck')

  // Clear customer session cookies (dev name + production __Secure- prefix)
  cookieStore.delete('next-auth.session-token')
  cookieStore.delete('__Secure-next-auth.session-token')

  redirect('/login')
}
