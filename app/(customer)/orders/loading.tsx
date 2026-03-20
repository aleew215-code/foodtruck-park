export default function OrdersLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="h-8 w-36 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }} />

      {/* Tab bar */}
      <div className="h-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Order cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl p-5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex justify-between">
            <div className="h-4 w-28 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-6 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div className="h-3 w-40 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      ))}
    </div>
  )
}
