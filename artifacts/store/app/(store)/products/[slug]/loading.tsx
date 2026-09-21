export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          {[80, 60, 120, 90].map((w, i) => (
            <span key={i} className="flex items-center gap-2">
              <div className="skeleton h-3 rounded" style={{ width: w }} />
              {i < 3 && <div className="skeleton h-2 w-2 rounded-full" />}
            </span>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: Gallery */}
          <div className="space-y-3">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-16 w-16 flex-shrink-0 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="space-y-5 py-2">
            {/* Brand badge */}
            <div className="skeleton h-5 w-24 rounded-full" />

            {/* Product name */}
            <div className="space-y-2">
              <div className="skeleton h-7 w-full rounded-lg" />
              <div className="skeleton h-7 w-3/4 rounded-lg" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-4 w-4 rounded" />)}
              </div>
              <div className="skeleton h-4 w-20 rounded" />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="skeleton h-9 w-36 rounded-lg" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>

            {/* Stock/SKU */}
            <div className="skeleton h-4 w-32 rounded" />

            {/* Qty + Add to cart */}
            <div className="flex gap-3">
              <div className="skeleton h-12 w-28 rounded-xl" />
              <div className="skeleton h-12 flex-1 rounded-xl" />
              <div className="skeleton h-12 w-12 rounded-xl" />
            </div>

            {/* Description */}
            <div className="space-y-2 border-t border-[var(--line)] pt-2">
              {[100, 90, 80, 60].map((w, i) => (
                <div key={i} className="skeleton h-3.5 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-16">
          <div className="skeleton mb-6 h-6 w-48 rounded-lg" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
