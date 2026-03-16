import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status !== 'paid') return NextResponse.json({ received: true })

    // Wallet top-up
    if (session.metadata?.type === 'wallet_topup' && session.metadata?.userId) {
      const userId = session.metadata.userId
      const amount = parseFloat(session.metadata.amount)

      if (!isNaN(amount) && amount > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: amount } },
        })
        await prisma.walletTransaction.create({
          data: { userId, amount, type: 'credit', description: `Wallet top-up via Stripe` },
        })
        console.log(`Wallet top-up: +$${amount} for user ${userId}`)
      }
    }

    // Order payment
    if (session.metadata?.type === 'order_payment' && session.metadata?.orderIds) {
      const orderIds = session.metadata.orderIds.split(',').filter(Boolean)
      await prisma.order.updateMany({
        where: { id: { in: orderIds }, paymentStatus: 'PENDING' },
        data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED', stripePaymentId: session.id },
      })
      console.log(`Orders confirmed via webhook: ${orderIds.join(', ')}`)
    }
  }

  return NextResponse.json({ received: true })
}
