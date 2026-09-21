export default function CheckoutLoading() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-8 bg-zinc-200 rounded-xl w-32 mb-8 animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">
            {["Teslimat Bilgileri", "Ödeme Yöntemi"].map((label) => (
              <div key={label} className="bg-white rounded-2xl border border-[#E8E0D5] p-6 animate-pulse">
                <div className="h-5 bg-zinc-200 rounded w-40 mb-5" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 bg-zinc-100 rounded w-1/3" />
                      <div className="h-10 bg-zinc-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-zinc-200 rounded w-1/2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-zinc-100 rounded w-1/2" />
                  <div className="h-3 bg-zinc-100 rounded w-16" />
                </div>
              ))}
              <div className="h-px bg-zinc-100 my-2" />
              <div className="flex justify-between">
                <div className="h-5 bg-zinc-200 rounded w-16" />
                <div className="h-5 bg-zinc-200 rounded w-20" />
              </div>
              <div className="h-12 bg-zinc-200 rounded-xl mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
