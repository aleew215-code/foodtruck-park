'use client'
import { usePushSubscription } from '@/hooks/usePushSubscription'

/** Drop this into any layout to auto-subscribe the user to push notifications. */
export function PushSetup() {
  usePushSubscription()
  return null
}
