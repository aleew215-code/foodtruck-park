import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const COMMISSION_RATE = 0.024

export async function createPaymentIntent(
  amount: number,
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: customerId,
    automatic_payment_methods: { enabled: true },
  })
}
