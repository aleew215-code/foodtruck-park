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
    <nav className="ag-nav sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-lg blur-md"
              style={{ background: 'rgba(249,115,22,0.45)', transform: 'scale(1.2)' }}
            />
            <div
              className="relative flex items-center justify-center rounded-lg p-1.5"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea6c00 100%)' }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
          <span style={{
            background: 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            FoodTruck Park
          </span>
        </Link>

        {/* ── Right side ────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Cart icon */}
              {role === 'CUSTOMER' && (
                <Link href="/cart" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-300 hover:text-white transition"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ag-glow-btn"
                        style={{ background: '#f97316' }}
                      >
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full px-2 py-1 transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  <ChevronDown
                    className="h-4 w-4 transition-transform"
                    style={{ color: 'rgba(255,255,255,0.5)', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="ag-dropdown absolute right-0 top-12 w-56 rounded-2xl z-50 overflow-hidden animate-fadeIn">
                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="font-semibold text-sm text-white truncate">{session.user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{session.user?.email}</p>
                    </div>

                    {role === 'CUSTOMER' && (
                      <>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <ShoppingCart className="h-4 w-4 text-orange-400" /> My Orders
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="text-orange-400 text-base">💳</span> Wallet
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-orange-400" /> Profile
                        </Link>
                      </>
                    )}

                    {role === 'FOOD_TRUCK' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: 'rgba(255,255,255,0.65)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 text-orange-400" /> Dashboard
                      </Link>
                    )}

                    {role === 'SUPER_ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: 'rgba(255,255,255,0.65)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 text-orange-400" /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-300 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="ag-glow-btn text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea6c00 100%)' }}
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
