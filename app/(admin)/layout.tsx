import { redirect } from 'next/navigation'
import { authAdmin } from '@/lib/auth-admin'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Truck, Users, Settings, LogOut, DollarSign, QrCode } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check for admin-specific session cookie (nap.admin)
  const adminSession = await authAdmin()

  if (!adminSession) {
    // No admin cookie yet — check if the user just logged in via the main login
    // page.  If so, mint the admin cookie transparently and redirect back here.
    const customerSession = await auth()
    if (customerSession && (customerSession.user as any).role === 'SUPER_ADMIN') {
      redirect('/api/auth-admin/transfer')
    }
    redirect('/login')
  }

  const role = (adminSession.user as any).role
  if (role !== 'SUPER_ADMIN') redirect('/')

  const navItems = [
    { href: '/admin',             icon: LayoutDashboard, label: 'Overview'     },
    { href: '/admin/food-trucks', icon: Truck,           label: 'Food Trucks'  },
    { href: '/admin/customers',   icon: Users,           label: 'Customers'    },
    { href: '/admin/tables',      icon: QrCode,          label: 'Tables & QR'  },
    { href: '/admin/revenue',     icon: DollarSign,      label: 'Revenue'      },
    { href: '/admin/admins',      icon: Settings,        label: 'Admins'       },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">Platform Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition group"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {/* Navigate to signout route — clears both nap.admin and customer cookie */}
          <a
            href="/api/auth-admin/signout"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </a>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
