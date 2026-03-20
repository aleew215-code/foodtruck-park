export default function MarketplaceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search bar */}
      <div className="h-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Truck cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="h-40" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 w-2/3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
