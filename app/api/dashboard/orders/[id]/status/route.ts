import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'
import { sendSMS, getPreparingMessage, getReadyMessage } from '@/lib/sms'
import { sendPushNotification } from '@/lib/push'

const STATUS_PUSH: Record<string, { title: string; body: (orderNum: string, truck: string) => string }> = {
  CONFIRMED:   { title: '✅ Order Confirmed!',    body: (n, t) => `${t} has confirmed your order #${n}.` },
  PREPARING:   { title: '👨‍🍳 Being Prepared!',    body: (n, t) => `${t} is preparing your order #${n}.` },
  READY:       { title: '🎉 Order Ready!',         body: (n, t) => `Your order #${n} from ${t} is ready for pickup!` },
  ON_THE_WAY:  { title: '🚚 On the Way!',          body: (n, t) => `Your order #${n} from ${t} is on its way to your table!` },
  DELIVERED:   { title: '😋 Enjoy your meal!',     body: (n, t) => `Order #${n} from ${t} has been delivered. Bon appétit!` },
  CANCELLED:   { title: '❌ Order Cancelled',       body: (n, t) => `Your order #${n} from ${t} has been cancelled.` },
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()

  // Verify the order belongs to the authenticated truck
  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Truck not found' }, { status: 404 })

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing || existing.foodTruckId !== truck.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Calculate ETA when confirming or beginning preparation
  let estimatedReadyAt: Date | undefined
  if (status === 'CONFIRMED' || status === 'PREPARING') {
    const queueCount = await prisma.order.count({
      where: { foodTruckId: truck.id, status: { in: ['CONFIRMED', 'PREPARING'] }, id: { not: id } },
    })
    const etaMinutes = (queueCount + 1) * (truck.avgPrepTime ?? 20)
    estimatedReadyAt = new Date(Date.now() + etaMinutes * 60 * 1000)
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status, ...(estimatedReadyAt ? { estimatedReadyAt } : {}) },
    include: { customer: true, foodTruck: true },
  })

  await prisma.orderStatusHistory.create({ data: { orderId: id, status } })

  // SMS notifications (with ETA on CONFIRMED and PREPARING)
  try {
    if (order.customer.phone) {
      if (status === 'CONFIRMED' && estimatedReadyAt) {
        const etaMin = Math.max(1, Math.round((estimatedReadyAt.getTime() - Date.now()) / 60000))
        const msg = `Your order #${order.orderNumber} from ${order.foodTruck.name} is confirmed! Estimated wait: ~${etaMin} min based on current queue.`
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      } else if (status === 'PREPARING') {
        let msg = getPreparingMessage(order.orderNumber, order.foodTruck.name, order.foodTruck.smsPrepMsg)
        if (estimatedReadyAt) {
          const etaMin = Math.max(1, Math.round((estimatedReadyAt.getTime() - Date.now()) / 60000))
          msg += ` Estimated ready in ~${etaMin} min.`
        }
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      } else if (status === 'READY' || status === 'ON_THE_WAY') {
        const msg = getReadyMessage(order.orderNumber, order.foodTruck.name, order.orderType, order.tableNumber, order.foodTruck.smsReadyMsg)
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      }
    }
  } catch {}

  // Push notifications
  try {
    if (order.customer.pushSubscription && STATUS_PUSH[status]) {
      const { title, body } = STATUS_PUSH[status]
      await sendPushNotification(order.customer.pushSubscription, {
        title,
        body: body(order.orderNumber, order.foodTruck.name),
        url: `/orders/${order.id}`,
        icon: '/icons/icon-192x192.png',
      })
    }
  } catch (err: any) {
    // If subscription is expired, clear it from DB
    if (err?.message === 'SUBSCRIPTION_EXPIRED') {
      await prisma.user.update({
        where: { id: order.customerId },
        data: { pushSubscription: null },
      }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
