'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users,
  BarChart3, Settings, Truck, LogOut, Menu, X,
} from 'lucide-react'

interface DashboardNavProps {
  truckName: string | null
  truckLogo: string | null
}

const NAV_ITEMS = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Overview'   },
  { href: '/dashboard/orders',     icon: ShoppingBag,     label: 'Orders'     },
  { href: '/dashboard/menu',       icon: UtensilsCrossed, label: 'Menu'       },
  { href: '/dashboard/customers',  icon: Users,           label: 'Customers'  },
  { href: '/dashboard/analytics',  icon: BarChart3,       label: 'Analytics'  },
  { href: '/dashboard/settings',   icon: Settings,        label: 'Settings'   },
]

export function DashboardNav({ truckName, truckLogo }: DashboardNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const NavContent = () => (
    <>
      {/* Truck header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 overflow-hidden">
            {truckLogo
              ? <img src={truckLogo} alt="" className="h-full w-full object-cover" />
              : <Truck className="h-5 w-5 text-white" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{truckName || 'My Truck'}</p>
            <p className="text-xs text-gray-500">Food Truck Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition"
              style={{
                background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                color: active ? '#ea6c00' : '#6b7280',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(249,115,22,0.05)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? '#f97316' : '#9ca3af' }}
              />
              {label}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#f97316' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 transition"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col fixed inset-y-0 z-30">
        <NavContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">{truckName || 'Dashboard'}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-40 flex flex-col shadow-2xl transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <NavContent />
      </aside>
    </>
  )
}
