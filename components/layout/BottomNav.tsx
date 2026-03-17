'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

const NAV_ITEMS = [
  { href: '/marketplace', icon: Home,          label: 'Home'   },
  { href: '/cart',        icon: ShoppingCart,  label: 'Cart'   },
  { href: '/orders',      icon: ClipboardList, label: 'Orders' },
  { href: '/profile',     icon: User,          label: 'Profile' },
]

export function BottomNav() {
  const pathname  = usePathname()
  const { itemCount } = useCart()

  return (
    <nav
      className="ag-bottom-nav fixed bottom-0 left-0 right-0 z-40 flex lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/marketplace' && pathname.startsWith(href))
        const isCart   = href === '/cart'

        return (
          <Link
            key={href}
            href={href}
            className={`ag-bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="relative">
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={isActive ? 2.2 : 1.7}
              />
              {/* Cart badge */}
              {isCart && itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: '#f97316', boxShadow: '0 0 8px rgba(249,115,22,0.65)' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
