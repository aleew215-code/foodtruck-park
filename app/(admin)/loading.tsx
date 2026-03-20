export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-xl" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            <div className="h-7 w-24 bg-gray-200 rounded-lg" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 h-80" />
    </div>
  )
}
