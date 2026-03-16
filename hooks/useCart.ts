'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  foodTruckId: string
  foodTruckName: string
  menuItemId?: string
  comboId?: string
  name: string
  price: number
  quantity: number
  notes?: string
  image?: string
}

interface CartStore {
  items: CartItem[]
  tableNumber: number | null
  cartUserId: string | null
  addItem: (item: CartItem) => void
  removeItem: (id: string, foodTruckId: string) => void
  updateQuantity: (id: string, foodTruckId: string, quantity: number) => void
  clearCart: () => void
  clearTruckItems: (foodTruckId: string) => void
  setTableNumber: (n: number | null) => void
  setCartUserId: (id: string | null) => void
  itemCount: number
  total: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      cartUserId: null,
      itemCount: 0,
      total: 0,
      setTableNumber: (n) => set({ tableNumber: n }),
      setCartUserId: (id) => set({ cartUserId: id }),
      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.id === item.id && i.foodTruckId === item.foodTruckId)
        let newItems: CartItem[]
        if (existing) {
          newItems = items.map((i) =>
            i.id === item.id && i.foodTruckId === item.foodTruckId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          newItems = [...items, item]
        }
        set({
          items: newItems,
          itemCount: newItems.reduce((s, i) => s + i.quantity, 0),
          total: newItems.reduce((s, i) => s + i.price * i.quantity, 0),
        })
      },
      removeItem: (id, foodTruckId) => {
        const newItems = get().items.filter((i) => !(i.id === id && i.foodTruckId === foodTruckId))
        set({ items: newItems, itemCount: newItems.reduce((s, i) => s + i.quantity, 0), total: newItems.reduce((s, i) => s + i.price * i.quantity, 0) })
      },
      updateQuantity: (id, foodTruckId, quantity) => {
        const newItems = quantity <= 0
          ? get().items.filter((i) => !(i.id === id && i.foodTruckId === foodTruckId))
          : get().items.map((i) => i.id === id && i.foodTruckId === foodTruckId ? { ...i, quantity } : i)
        set({ items: newItems, itemCount: newItems.reduce((s, i) => s + i.quantity, 0), total: newItems.reduce((s, i) => s + i.price * i.quantity, 0) })
      },
      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
      clearTruckItems: (foodTruckId) => {
        const newItems = get().items.filter((i) => i.foodTruckId !== foodTruckId)
        set({ items: newItems, itemCount: newItems.reduce((s, i) => s + i.quantity, 0), total: newItems.reduce((s, i) => s + i.price * i.quantity, 0) })
      },
    }),
    { name: 'cart-storage' }
  )
)
