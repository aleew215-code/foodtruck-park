import webpush from 'web-push'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.SMTP_FROM || 'noreply@foodtruckpark.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

export async function sendPushNotification(
  subscriptionJson: string,
  payload: PushPayload
) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID keys not configured, skipping push notification')
    return
  }

  try {
    const subscription = JSON.parse(subscriptionJson)
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (error: any) {
    // Subscription expired or invalid — caller should remove it
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      throw new Error('SUBSCRIPTION_EXPIRED')
    }
    console.error('[Push] Failed to send notification:', error)
  }
}
