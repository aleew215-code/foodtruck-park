import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderIds, sessionId } = await req.json()
  if (!orderIds?.length || !sessionId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  try {
    // Verify with Stripe that payment was actually completed
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId)

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    // Update orders to CONFIRMED + COMPLETED
    const orders = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        customerId: session.user.id,
        paymentStatus: 'PENDING',
      },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        stripePaymentId: sessionId,
      },
    })

    // Get order numbers to show in UI
    const updatedOrders = await prisma.order.findMany({
      where: { id: { in: orderIds }, customerId: session.user.id },
      select: { orderNumber: true },
    })

    return NextResponse.json({
      success: true,
      orderNumbers: updatedOrders.map(o => o.orderNumber),
    })
  } catch (err: any) {
    console.error('Verify payment error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
