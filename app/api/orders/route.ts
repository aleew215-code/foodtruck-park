import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { sendSMS, getOrderConfirmMessage } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { foodTruckId, items, orderType, tableNumber, pickupTime, notes, paymentMethod, subtotal } = await req.json()

  try {
    const commission = subtotal * 0.024
    const total = subtotal

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
        items: { create: items.map((i: any) => ({ menuItemId: i.menuItemId || null, comboId: i.comboId || null, name: i.name, price: i.price, quantity: i.quantity })) },
      },
      include: { foodTruck: true, items: true },
    })

    // Deduct from wallet if wallet payment
    if (paymentMethod === 'WALLET') {
      await prisma.user.update({ where: { id: session.user.id }, data: { walletBalance: { decrement: total } } })
      await prisma.walletTransaction.create({ data: { userId: session.user.id, amount: -total, type: 'debit', description: `Order #${order.orderNumber}` } })
    }

    // SMS
    try {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (user?.phone) {
        const msg = getOrderConfirmMessage(order.orderNumber, order.foodTruck.name, order.foodTruck.smsOrderConfirmMsg)
        await sendSMS(user.phone, msg, order.foodTruck.smsFromNumber || undefined)
      }
    } catch {}

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
