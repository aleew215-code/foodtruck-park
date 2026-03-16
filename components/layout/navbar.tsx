'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Settings, ChevronDown, Truck, LayoutDashboard } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()

  const role = (session?.user as any)?.role

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          <Truck className="h-6 w-6" />
          <span>FoodTruck Park</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              {role === 'CUSTOMER' && (
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-50 transition"
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="font-medium text-sm text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    {role === 'CUSTOMER' && (
                      <>
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <ShoppingCart className="h-4 w-4 text-gray-400" /> My Orders
                        </Link>
                        <Link href="/wallet" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <span className="text-gray-400 text-base">💳</span> Wallet
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          <Settings className="h-4 w-4 text-gray-400" /> Profile
                        </Link>
                      </>
                    )}
                    {role === 'FOOD_TRUCK' && (
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> Dashboard
                      </Link>
                    )}
                    {role === 'SUPER_ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                      className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm">Sign Up</Button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
