import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
    return NextResponse.json({ error: 'Payment system not configured yet.' }, { status: 503 })
  }
  const { amount } = await req.json()
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'payment',
    // Omitting payment_method_types lets Stripe use all methods enabled in the Dashboard
    // (Apple Pay, Google Pay, Link, card, etc.)
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Wallet Top-up' }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/wallet?success=1`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/wallet`,
    metadata: { userId: session.user.id, type: 'wallet_topup', amount: String(amount) },
  })
  return NextResponse.json({ url: checkoutSession.url })
}
