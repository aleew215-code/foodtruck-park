export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-28 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }} />
      {/* Avatar */}
      <div className="flex justify-center">
        <div className="h-24 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
      {/* Fields */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
        <div className="h-10 rounded-xl mt-2" style={{ background: 'rgba(249,115,22,0.20)' }} />
      </div>
    </div>
  )
}
