export default function HomeLoading() {
  return (
    <div className="bg-[#FAF7F2]">
      {/* Hero skeleton */}
      <div className="animate-pulse">
        <div className="h-[420px] lg:h-[560px] bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-300/20 via-transparent to-zinc-300/20 animate-[shimmer_2s_infinite]" />
          <div className="absolute bottom-10 left-8 right-8 md:left-16 space-y-3">
            <div className="h-4 bg-zinc-300/60 rounded-full w-32" />
            <div className="h-8 bg-zinc-300/70 rounded-xl w-64 md:w-96" />
            <div className="h-8 bg-zinc-300/50 rounded-xl w-48 md:w-72" />
            <div className="flex gap-3 mt-4">
              <div className="h-11 bg-zinc-300/70 rounded-xl w-36" />
              <div className="h-11 bg-zinc-300/40 rounded-xl w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand slider skeleton */}
      <div className="py-6 bg-white border-y border-zinc-100 overflow-hidden">
        <div className="flex gap-10 px-8 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-20 h-7 bg-zinc-100 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Category grid skeleton */}
      <div className="py-12 bg-[#FAF7F2] animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-52 bg-zinc-200 rounded-lg" />
            <div className="h-5 w-24 bg-zinc-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="group">
                <div
                  className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <div className="h-3.5 bg-zinc-200 rounded mt-2 mx-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured products skeleton */}
      <div className="py-12 bg-white animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1.5">
              <div className="h-7 w-64 bg-zinc-200 rounded-lg" />
              <div className="h-3.5 w-40 bg-zinc-100 rounded" />
            </div>
            <div className="h-8 w-28 bg-zinc-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-100"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50" />
                <div className="p-3.5 space-y-2">
                  <div className="h-2.5 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3.5 bg-zinc-200 rounded w-full" />
                  <div className="h-3.5 bg-zinc-100 rounded w-2/3" />
                  <div className="flex items-center justify-between mt-1">
                    <div className="h-5 bg-zinc-200 rounded w-16" />
                    <div className="h-4 bg-zinc-100 rounded w-10" />
                  </div>
                  <div className="h-9 bg-zinc-100 rounded-xl mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flash sale skeleton */}
      <div className="py-10 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-7 w-40 bg-zinc-700 rounded-lg" />
            <div className="h-8 w-28 bg-zinc-700 rounded-xl" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 bg-zinc-700/40 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-zinc-700/60" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-zinc-700 rounded w-3/4" />
                  <div className="h-4 bg-zinc-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New arrivals skeleton */}
      <div className="py-12 bg-[#FAF7F2] animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-56 bg-zinc-200 rounded-lg" />
            <div className="h-8 w-28 bg-zinc-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-100">
                <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3.5 bg-zinc-100 rounded w-1/2" />
                  <div className="h-5 bg-zinc-200 rounded w-20 mt-1" />
                  <div className="h-9 bg-zinc-100 rounded-xl mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
