import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendSMS, getPreparingMessage, getReadyMessage } from '@/lib/sms'
import { sendPushNotification } from '@/lib/push'

const STATUS_PUSH: Record<string, { title: string; body: (n: string, t: string) => string }> = {
  CONFIRMED:  { title: '✅ Order Confirmed!',   body: (n, t) => `${t} has confirmed your order #${n}.` },
  PREPARING:  { title: '👨‍🍳 Being Prepared!',   body: (n, t) => `${t} is preparing your order #${n}.` },
  READY:      { title: '🎉 Order Ready!',        body: (n, t) => `Your order #${n} from ${t} is ready for pickup!` },
  ON_THE_WAY: { title: '🚚 On the Way!',         body: (n, t) => `Your order #${n} from ${t} is on its way to your table!` },
  DELIVERED:  { title: '😋 Enjoy your meal!',    body: (n, t) => `Order #${n} from ${t} has been delivered. Bon appétit!` },
  CANCELLED:  { title: '❌ Order Cancelled',      body: (n, t) => `Your order #${n} from ${t} has been cancelled.` },
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'EMPLOYEE' && role !== 'FOOD_TRUCK') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  // Resolve the truck this user belongs to
  const truckId = role === 'EMPLOYEE'
    ? (session.user as any).employeeTruckId as string
    : (await prisma.foodTruck.findUnique({ where: { userId: session.user.id } }))?.id

  if (!truckId) return NextResponse.json({ error: 'No truck found' }, { status: 403 })

  // Verify order belongs to this truck
  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing || existing.foodTruckId !== truckId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Calculate ETA when confirming or preparing
  let estimatedReadyAt: Date | undefined
  if (status === 'CONFIRMED' || status === 'PREPARING') {
    const truck = await prisma.foodTruck.findUnique({ where: { id: truckId }, select: { avgPrepTime: true } })
    const avgPrepTime = truck?.avgPrepTime ?? 20

    // Count orders ahead in the queue (CONFIRMED or PREPARING, excluding this order)
    const queueCount = await prisma.order.count({
      where: {
        foodTruckId: truckId,
        status: { in: ['CONFIRMED', 'PREPARING'] },
        id: { not: id },
      },
    })

    const etaMinutes = (queueCount + 1) * avgPrepTime
    estimatedReadyAt = new Date(Date.now() + etaMinutes * 60 * 1000)
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(estimatedReadyAt ? { estimatedReadyAt } : {}),
    },
    include: { customer: true, foodTruck: true },
  })

  await prisma.orderStatusHistory.create({ data: { orderId: id, status } })

  // SMS notifications with ETA
  try {
    if (order.customer.phone) {
      if (status === 'PREPARING') {
        let msg = getPreparingMessage(order.orderNumber, order.foodTruck.name, order.foodTruck.smsPrepMsg)
        if (estimatedReadyAt) {
          const etaMin = Math.max(1, Math.round((estimatedReadyAt.getTime() - Date.now()) / 60000))
          msg += ` Estimated ready in ~${etaMin} min.`
        }
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      } else if (status === 'READY' || status === 'ON_THE_WAY') {
        const msg = getReadyMessage(order.orderNumber, order.foodTruck.name, order.orderType, order.tableNumber, order.foodTruck.smsReadyMsg)
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      } else if (status === 'CONFIRMED') {
        if (estimatedReadyAt) {
          const etaMin = Math.max(1, Math.round((estimatedReadyAt.getTime() - Date.now()) / 60000))
          const msg = `Your order #${order.orderNumber} from ${order.foodTruck.name} is confirmed! Estimated wait: ~${etaMin} min based on current queue.`
          await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
        }
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
    if (err?.message === 'SUBSCRIPTION_EXPIRED') {
      await prisma.user.update({ where: { id: order.customerId }, data: { pushSubscription: null } }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
