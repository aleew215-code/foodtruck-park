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
        <Link href="/" className="flex items-center gap-3 font-black text-xl select-none">
          {/* 3D logo icon */}
          <div className="relative">
            {/* Glow halo */}
            <div
              className="absolute inset-0 rounded-xl blur-lg"
              style={{ background: 'rgba(249,115,22,0.55)', transform: 'scale(1.3)', zIndex: 0 }}
            />
            {/* Icon face */}
            <div
              className="relative z-10 flex items-center justify-center rounded-xl p-2"
              style={{
                background: 'linear-gradient(145deg, #f97316 0%, #c2520e 55%, #7c3210 100%)',
                boxShadow: '0 4px 16px rgba(249,115,22,0.50), 0 1px 0 rgba(255,255,255,0.28) inset, 0 -1px 0 rgba(0,0,0,0.30) inset',
                transform: 'perspective(300px) rotateX(6deg)',
              }}
            >
              <Truck className="h-5 w-5 text-white drop-shadow" />
            </div>
          </div>

          <span
            style={{
              background: 'linear-gradient(90deg, #f97316 0%, #fbbf24 50%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            FoodTruck Park
          </span>
        </Link>

        {/* ── Right side ────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Cart icon */}
              {(!role || role === 'CUSTOMER') && (
                <Link href="/cart" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <ShoppingCart className="h-5 w-5 text-white/70" />
                    {itemCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ag-pop"
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ea6c00)',
                          boxShadow: '0 0 10px rgba(249,115,22,0.65)',
                        }}
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
                  className="flex items-center gap-2 rounded-full px-2 py-1 transition ag-press"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  <ChevronDown
                    className="h-4 w-4 transition-transform duration-300"
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="ag-dropdown absolute right-0 top-12 w-56 rounded-2xl z-50 overflow-hidden animate-fadeIn">
                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="font-bold text-sm text-white truncate">{session.user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {session.user?.email}
                      </p>
                    </div>

                    {(!role || role === 'CUSTOMER') && (
                      <>
                        {[
                          { href: '/orders',  icon: ShoppingCart, label: 'My Orders' },
                          { href: '/wallet',  icon: null,         label: '💳 Wallet' },
                          { href: '/profile', icon: Settings,     label: 'Profile'   },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                            style={{ color: 'rgba(255,255,255,0.60)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => setMenuOpen(false)}
                          >
                            {Icon
                              ? <Icon className="h-4 w-4 text-orange-400" />
                              : <span className="text-base">{label.split(' ')[0]}</span>
                            }
                            {Icon ? label : label.split(' ').slice(1).join(' ')}
                          </Link>
                        ))}
                      </>
                    )}

                    {role === 'FOOD_TRUCK' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: 'rgba(255,255,255,0.60)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
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
                        style={{ color: 'rgba(255,255,255,0.60)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 text-orange-400" /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')}
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
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
