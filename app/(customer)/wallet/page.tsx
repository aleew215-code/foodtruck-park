'use client'
import { useState, useEffect } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/toast'

export default function WalletPage() {
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)
  const [showTopup, setShowTopup] = useState(false)

  useEffect(() => {
    fetch('/api/user/wallet')
      .then(r => r.json())
      .then(d => { setBalance(d.balance); setTransactions(d.transactions); setLoading(false) })
  }, [])

  async function handleTopup() {
    const amt = parseFloat(amount)
    if (!amt || amt < 5) { toast('Minimum top-up is $5', 'error'); return }
    setAdding(true)
    try {
      const res = await fetch('/api/user/wallet/topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amt }) })
      const d = await res.json()
      if (d.url) window.location.href = d.url
    } finally { setAdding(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <p className="text-orange-100 text-sm mb-1">Available Balance</p>
        <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
        <Button onClick={() => setShowTopup(!showTopup)} variant="outline" size="sm" className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30">
          <Plus className="h-4 w-4 mr-1" /> Add Funds
        </Button>
      </div>

      {/* Top-up Form */}
      {showTopup && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add Funds</h3>
          <div className="flex gap-2 mb-3">
            {[10, 25, 50, 100].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${amount === String(v) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-700 hover:border-orange-300'}`}>${v}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Custom amount" className="flex-1" min="5" />
            <Button onClick={handleTopup} disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Minimum $5. Powered by Stripe.</p>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-6 py-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.description || (tx.type === 'credit' ? 'Funds added' : 'Payment')}</p>
                  <p className="text-xs text-gray-400">{format(new Date(tx.createdAt), 'MMM d, h:mm a')}</p>
                </div>
                <span className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
