export default function CartLoading() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-8 bg-zinc-200 rounded-xl w-32 mb-8 animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E0D5] p-4 flex gap-4 animate-pulse">
                <div className="w-24 h-24 rounded-xl bg-zinc-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-2/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  <div className="h-5 bg-zinc-200 rounded w-20 mt-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-zinc-200 rounded w-1/2" />
              <div className="h-3 bg-zinc-100 rounded w-full" />
              <div className="h-3 bg-zinc-100 rounded w-3/4" />
              <div className="h-12 bg-zinc-200 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
