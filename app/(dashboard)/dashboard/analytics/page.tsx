'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Users, Star } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    fetch(`/api/dashboard/analytics?view=${view}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [view])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => setView('weekly')} className={`px-4 py-2 text-sm font-medium transition ${view === 'weekly' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Weekly</button>
          <button onClick={() => setView('monthly')} className={`px-4 py-2 text-sm font-medium transition ${view === 'monthly' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Monthly</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Avg Order Value', value: formatCurrency(data.avgOrderValue), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Repeat Customers', value: `${data.repeatCustomerRate}%`, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.chartData}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top Selling Items</h3>
        <div className="space-y-3">
          {data.topItems.map((item: any, i: number) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="w-6 text-sm font-bold text-gray-400">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-gray-500">{item.count} sold</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(item.count / data.topItems[0].count) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
          {data.topItems.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>}
        </div>
      </div>
    </div>
  )
}
