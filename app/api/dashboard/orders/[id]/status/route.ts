import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendSMS, getPreparingMessage, getReadyMessage } from '@/lib/sms'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { customer: true, foodTruck: true },
  })

  await prisma.orderStatusHistory.create({ data: { orderId: id, status } })

  // SMS notifications
  try {
    if (order.customer.phone) {
      if (status === 'PREPARING') {
        const msg = getPreparingMessage(order.orderNumber, order.foodTruck.name, order.foodTruck.smsPrepMsg)
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      } else if (status === 'READY' || status === 'ON_THE_WAY') {
        const msg = getReadyMessage(order.orderNumber, order.foodTruck.name, order.orderType, order.tableNumber, order.foodTruck.smsReadyMsg)
        await sendSMS(order.customer.phone, msg, order.foodTruck.smsFromNumber || undefined)
      }
    }
  } catch {}

  return NextResponse.json({ ok: true })
}
