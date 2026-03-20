import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { sendSMS, getOrderConfirmMessage } from '@/lib/sms'
import { sendPushNotification } from '@/lib/push'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { foodTruckId, items, orderType, tableNumber, pickupTime, notes, paymentMethod } = await req.json()

  try {
    // ── Server-side price verification ──────────────────────────────────
    // Never trust client-supplied prices. Fetch authoritative prices from DB.
    const menuItemIds = items.filter((i: any) => i.menuItemId).map((i: any) => i.menuItemId)
    const dbItems = menuItemIds.length
      ? await prisma.menuItem.findMany({ where: { id: { in: menuItemIds }, foodTruckId }, select: { id: true, name: true, price: true } })
      : []
    const priceMap = new Map(dbItems.map((i) => [i.id, i]))

    const verifiedItems = items.map((i: any) => {
      const dbItem = i.menuItemId ? priceMap.get(i.menuItemId) : null
      const price = dbItem ? dbItem.price : (i.price ?? 0) // fallback for combos / custom items
      return { menuItemId: i.menuItemId || null, comboId: i.comboId || null, name: dbItem?.name ?? i.name, price, quantity: i.quantity ?? 1, notes: i.notes || null }
    })

    const subtotal = verifiedItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const taxAmount = subtotal * 0.07
    const total = subtotal + taxAmount
    const commission = subtotal * 0.024

    // For wallet payments: ensure sufficient balance before creating the order
    if (paymentMethod === 'WALLET') {
      const userRecord = await prisma.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } })
      if (!userRecord || userRecord.walletBalance < total) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 402 })
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: session.user.id,
        foodTruckId,
        orderType,
        tableNumber: tableNumber || null,
        pickupTime: pickupTime ? new Date(`1970-01-01T${pickupTime}`) : null,
        notes,
        subtotal,
        commission,
        total,
        paymentMethod: paymentMethod === 'WALLET' ? 'WALLET' : 'CARD',
        paymentStatus: paymentMethod === 'WALLET' ? 'COMPLETED' : 'PENDING',
        status: paymentMethod === 'WALLET' ? 'CONFIRMED' : 'PENDING',
        items: { create: verifiedItems },
      },
      include: { foodTruck: { include: { user: true } }, items: true },
    })

    // Deduct from wallet if wallet payment
    if (paymentMethod === 'WALLET') {
      await prisma.user.update({ where: { id: session.user.id }, data: { walletBalance: { decrement: total } } })
      await prisma.walletTransaction.create({ data: { userId: session.user.id, amount: -total, type: 'debit', description: `Order #${order.orderNumber}` } })
    }

    // SMS to customer
    try {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (user?.phone) {
        const msg = getOrderConfirmMessage(order.orderNumber, order.foodTruck.name, order.foodTruck.smsOrderConfirmMsg)
        await sendSMS(user.phone, msg, order.foodTruck.smsFromNumber || undefined)
      }
    } catch {}

    // Push notification to food truck owner for new order
    try {
      const truckOwner = order.foodTruck.user
      if (truckOwner?.pushSubscription) {
        const locationLabel = tableNumber ? `Table ${tableNumber}` : 'Pickup'
        await sendPushNotification(truckOwner.pushSubscription, {
          title: '🔔 New Order!',
          body: `Order #${order.orderNumber} · ${locationLabel} · $${total.toFixed(2)}`,
          url: '/dashboard/orders',
          icon: '/icons/icon-192x192.png',
        })
      }
    } catch {}

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
