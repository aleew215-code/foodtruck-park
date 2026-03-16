import { prisma } from '@/lib/db'
import { format } from 'date-fns'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Customers ({customers.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {customers.map(c => (
            <div key={c.id} className="px-6 py-4 flex items-center gap-4">
              <Avatar src={c.image} name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{c.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500 truncate">{c.email}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{c._count.orders} orders</span>
                <Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                <span className="text-xs text-gray-400">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
