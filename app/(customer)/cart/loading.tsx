export default function CartLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="h-8 w-24 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex gap-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="h-16 w-16 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        </div>
      ))}
      {/* Order summary */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        ))}
        <div className="h-12 rounded-2xl mt-4" style={{ background: 'rgba(249,115,22,0.20)' }} />
      </div>
    </div>
  )
}
