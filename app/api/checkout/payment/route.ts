import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderIds } = await req.json()
  if (!orderIds?.length) return NextResponse.json({ error: 'No orders provided' }, { status: 400 })

  // Fetch orders and verify they belong to this user
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, customerId: session.user.id, paymentStatus: 'PENDING' },
    include: { foodTruck: true, items: true },
  })

  if (!orders.length) return NextResponse.json({ error: 'Orders not found' }, { status: 404 })

  // Build line items including taxes per order
  const lineItems = orders.flatMap(order => {
    const items = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: `${item.name} (${order.foodTruck.name})` },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Add taxes & service fees as a separate line item
    const taxAmount = order.total - order.subtotal
    if (taxAmount > 0.005) {
      items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Taxes & Service Fees' },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      })
    }

    return items
  })

  const returnUrl = `${process.env.NEXTAUTH_URL}/checkout/success?orders=${orderIds.join(',')}&session_id={CHECKOUT_SESSION_ID}`

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    line_items: lineItems,
    return_url: returnUrl,
    payment_method_types: ['card', 'link'],
    metadata: {
      userId: session.user.id,
      type: 'order_payment',
      orderIds: orderIds.join(','),
    },
  })

  return NextResponse.json({ clientSecret: checkoutSession.client_secret })
}
