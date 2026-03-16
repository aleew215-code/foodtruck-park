'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'

export function CartSync() {
  const { data: session } = useSession()
  const { cartUserId, setCartUserId, clearCart } = useCart()

  useEffect(() => {
    const userId = (session?.user as any)?.id ?? null
    if (!userId) return

    if (cartUserId && cartUserId !== userId) {
      // Different user logged in — clear previous user's cart
      clearCart()
    }
    setCartUserId(userId)
  }, [(session?.user as any)?.id])

  return null
}
