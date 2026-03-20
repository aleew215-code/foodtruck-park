export default function WalletLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-5 animate-pulse">
      <div className="h-8 w-32 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }} />
      {/* Balance card skeleton */}
      <div className="rounded-2xl h-36" style={{ background: 'rgba(249,115,22,0.20)' }} />
      {/* Transactions skeleton */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-5 w-40 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="h-9 w-9 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-2.5 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-4 w-14 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
