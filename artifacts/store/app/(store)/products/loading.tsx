export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="store-surface rounded-2xl p-5 space-y-4">
              <div className="skeleton h-4 w-1/2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton h-3.5 w-3.5" />
                  <div className="skeleton h-3 flex-1" />
                </div>
              ))}
              <div className="my-2 h-px bg-[var(--line)]" />
              <div className="skeleton h-4 w-2/3" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton h-3.5 w-3.5" />
                  <div className="skeleton h-3 flex-1" />
                </div>
              ))}
              <div className="my-2 h-px bg-[var(--line)]" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-8 rounded-xl" />
            </div>
          </aside>

          <div className="flex-1">
            {/* Toolbar skeleton */}
            <div className="mb-6 flex items-center justify-between">
              <div className="skeleton h-4 w-32" />
              <div className="flex gap-2">
                <div className="skeleton h-9 w-36 rounded-xl" />
                <div className="skeleton h-9 w-20 rounded-xl" />
              </div>
            </div>

            {/* Product grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Image area */}
                  <div className="skeleton aspect-square rounded-none" />

                  {/* Info area */}
                  <div className="flex flex-col flex-1 p-3.5 space-y-2">
                    <div className="skeleton h-2.5 w-1/3" />
                    <div className="skeleton h-3.5 w-full" />
                    <div className="skeleton h-3.5 w-2/3" />
                    <div className="flex items-center justify-between mt-1">
                      <div className="skeleton h-5 w-16" />
                      <div className="skeleton h-4 w-12" />
                    </div>
                    {/* Button slot */}
                    <div className="skeleton mt-auto h-9 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
