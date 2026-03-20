'use client'
import { useState, useEffect } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/toast'

export default function WalletPage() {
  const { toast } = useToast()
  const [balance, setBalance]           = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [amount, setAmount]             = useState('')
  const [adding, setAdding]             = useState(false)
  const [showTopup, setShowTopup]       = useState(false)

  useEffect(() => {
    fetch('/api/user/wallet')
      .then(r => r.json())
      .then(d => { setBalance(d.balance); setTransactions(d.transactions); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleTopup() {
    const amt = parseFloat(amount)
    if (!amt || amt < 5) { toast('Minimum top-up is $5', 'error'); return }
    setAdding(true)
    try {
      const res = await fetch('/api/user/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      })
      const d = await res.json()
      if (d.url) {
        window.location.href = d.url
      } else {
        toast(d.error || 'Payment is not configured yet. Please contact support.', 'error')
      }
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    } finally { setAdding(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-orange-500 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Title */}
      <h1 className="text-2xl font-bold text-white">My Wallet</h1>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #c2520e 60%, #7c3210 100%)',
          boxShadow: '0 0 40px rgba(249,115,22,0.30)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10" style={{ background: 'white' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-orange-200" />
            <p className="text-orange-200 text-sm font-medium">Available Balance</p>
          </div>
          <p className="text-4xl font-black text-white mb-4">{formatCurrency(balance)}</p>
          <button
            onClick={() => setShowTopup(!showTopup)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition"
            style={{ background: 'rgba(255,255,255,0.20)', color: '#fff', border: '1px solid rgba(255,255,255,0.30)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.30)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.20)')}
          >
            <Plus className="h-4 w-4" /> Add Funds
          </button>
        </div>
      </div>

      {/* Top-up Form */}
      {showTopup && (
        <div className="ag-glass rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white">Add Funds</h3>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(v => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition"
                style={{
                  background: amount === String(v) ? 'linear-gradient(135deg,#f97316,#ea6c00)' : 'rgba(255,255,255,0.06)',
                  color:      amount === String(v) ? '#fff' : 'rgba(255,255,255,0.60)',
                  border:     amount === String(v) ? 'none' : '1px solid rgba(255,255,255,0.10)',
                }}
              >
                ${v}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Custom amount"
              min="5"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
            <button
              onClick={handleTopup}
              disabled={adding}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea6c00)' }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </button>
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Minimum $5 · Powered by Stripe · Secure payment
          </p>
        </div>
      )}

      {/* Transactions */}
      <div className="ag-glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-bold text-white">Transaction History</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No transactions yet</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: tx.type === 'credit' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color:      tx.type === 'credit' ? '#4ade80' : '#f87171',
                  }}
                >
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="h-4 w-4" />
                    : <ArrowUpRight className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {tx.description || (tx.type === 'credit' ? 'Funds added' : 'Payment')}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <span
                  className="font-bold text-sm shrink-0"
                  style={{ color: tx.type === 'credit' ? '#4ade80' : '#f87171' }}
                >
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
