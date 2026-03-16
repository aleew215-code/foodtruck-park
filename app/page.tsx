import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>
}) {
  const params = await searchParams
  const session = await auth()

  if (!session) {
    const redirectTo = params.table ? `/login?table=${params.table}` : '/login'
    redirect(redirectTo)
  }

  const role = (session.user as any).role
  if (role === 'SUPER_ADMIN') redirect('/admin')
  if (role === 'FOOD_TRUCK') redirect('/dashboard')

  const marketplaceUrl = params.table ? `/marketplace?table=${params.table}` : '/marketplace'
  redirect(marketplaceUrl)
}
