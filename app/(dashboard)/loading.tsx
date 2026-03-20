export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-xl" />
        <div className="h-4 w-36 bg-gray-100 rounded-lg" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            <div className="h-7 w-24 bg-gray-200 rounded-lg" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content blocks */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 h-64" />
        <div className="bg-white rounded-2xl border border-gray-100 h-64" />
      </div>
    </div>
  )
}
