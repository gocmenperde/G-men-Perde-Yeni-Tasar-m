"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Star, ThumbsUp, Camera } from "lucide-react";
import toast from "react-hot-toast";

const FAKE_REVIEWS = [
  { id: "f1", user: { name: "Mustafa A." }, rating: 5, comment: "Hem fiyat hem kalite hem hizmet kusursuz. Yeni evimize tüm ürünleri buradan aldık. Kesinlikle tavsiye ederim.", createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), helpful: 12 },
  { id: "f2", user: { name: "Ayşe K." }, rating: 5, comment: "Kargo çok hızlı geldi, ürün fotoğraftakinin birebir aynısı. Paketleme de çok özenliydi, hiç zarar görmemişti.", createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), helpful: 8 },
  { id: "f3", user: { name: "Mehmet Y." }, rating: 4, comment: "Fiyat performans açısından gayet iyi. Kalitesi beklentimin üzerinde çıktı. Bir sonraki siparişimi de buradan vereceğim.", createdAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), helpful: 5 },
  { id: "f4", user: { name: "Zeynep Ö." }, rating: 5, comment: "Çocuğum için aldım, çok sevdi. Renkleri canlı ve dayanıklı. Kesinlikle tekrar alacağım.", createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), helpful: 9 },
  { id: "f5", user: { name: "Can D." }, rating: 5, comment: "Uzun süredir bu ürünü arıyordum, sonunda burada buldum. Gerçekten harika bir kalite.", createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), helpful: 3 },
  { id: "f6", user: { name: "Fatma S." }, rating: 4, comment: "Ürün güzel ama kargo biraz gecikti. Ürün kalitesinden memnunum, tekrar sipariş veririm.", createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), helpful: 2 },
];

export default function ReviewSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: any[];
}) {
  const displayReviews = reviews.length > 0
    ? reviews
    : FAKE_REVIEWS;

  const [localReviews, setLocalReviews] = useState(displayReviews);
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ comment: string }>();

  const avgRating = localReviews.reduce((s, r) => s + r.rating, 0) / localReviews.length;

  const onSubmit = async ({ comment }: { comment: string }) => {
    if (!rating) {
      toast.error("Lütfen bir puan seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Hata");
      setLocalReviews((prev) => [payload.data, ...prev]);
      toast.success("Yorumunuz eklendi!");
      setRating(0);
      reset();
    } catch (err: any) {
      toast.error(err.message ?? "Yorum eklenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: localReviews.filter((r) => r.rating === star).length,
    pct: Math.round((localReviews.filter((r) => r.rating === star).length / localReviews.length) * 100),
  }));

  return (
    <div id="reviews" className="mt-16 scroll-mt-24 border-t border-[#E8E0D5] pt-12">
      <h2 className="text-xl font-black text-zinc-900 mb-2">Ürün Yorumları</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-black text-zinc-900">{avgRating.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
            ))}
          </div>
          <p className="text-sm text-zinc-500">{localReviews.length} değerlendirme</p>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center gap-2">
          {ratingCounts.map(({ star, pct, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-600 w-4 shrink-0">{star}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-zinc-400 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-[#E8E0D5] rounded-2xl p-6">
          <h3 className="font-bold text-zinc-900 mb-4">Yorum Yap</h3>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
              >
                <Star className={`w-8 h-8 transition-colors ${star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <textarea
              {...register("comment")}
              rows={4}
              placeholder="Bu ürün için kısa yorum yazın..."
              className="w-full px-4 py-3 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] resize-none text-sm text-zinc-700"
            />
            <button type="button" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors border border-dashed border-zinc-200 rounded-xl px-4 py-2 w-full justify-center">
              <Camera className="w-4 h-4" /> Fotoğraf Ekle — İsteğe Bağlı
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-[#B8973E] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? "Gönderiliyor..." : "✈ Yorum Gönder"}
            </button>
          </form>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {localReviews.map((r, i) => (
            <div key={r.id ?? i} className="bg-white border border-[#E8E0D5] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F0EBE3] flex items-center justify-center font-bold text-[#B8973E] text-sm">
                    {(r.user?.name ?? "U")[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{r.user?.name ?? "Anonim"}</p>
                    <p className="text-[11px] text-zinc-400">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="text-zinc-600 text-sm leading-relaxed">{r.comment}</p>
              )}
              {r.helpful != null && (
                <button className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" /> Faydalı ({r.helpful})
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
