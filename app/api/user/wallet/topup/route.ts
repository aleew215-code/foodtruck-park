import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { amount } = await req.json()
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Wallet Top-up' }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/wallet?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/wallet`,
    metadata: { userId: session.user.id, type: 'wallet_topup', amount: String(amount) },
  })
  return NextResponse.json({ url: checkoutSession.url })
}
