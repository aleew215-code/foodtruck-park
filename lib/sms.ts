import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, body: string, from?: string) {
  try {
    await client.messages.create({
      body,
      from: from || process.env.TWILIO_PHONE_NUMBER!,
      to,
    })
  } catch (error) {
    console.error('SMS error:', error)
  }
}

export function getOrderConfirmMessage(
  orderNumber: string,
  truckName: string,
  custom?: string | null
): string {
  if (custom) return custom.replace('{order}', orderNumber).replace('{truck}', truckName)
  return `Your order ${orderNumber} has been confirmed by ${truckName}! We'll notify you when it's ready.`
}

export function getPreparingMessage(
  orderNumber: string,
  truckName: string,
  custom?: string | null
): string {
  if (custom) return custom.replace('{order}', orderNumber).replace('{truck}', truckName)
  return `Great news! ${truckName} is now preparing your order ${orderNumber}.`
}

export function getReadyMessage(
  orderNumber: string,
  truckName: string,
  orderType: string,
  tableNumber?: number | null,
  custom?: string | null
): string {
  if (custom) return custom.replace('{order}', orderNumber).replace('{truck}', truckName)
  if (orderType === 'TABLE_SERVICE' && tableNumber)
    return `Your order ${orderNumber} from ${truckName} is on its way to Table ${tableNumber}!`
  return `Your order ${orderNumber} from ${truckName} is ready for pickup!`
}
