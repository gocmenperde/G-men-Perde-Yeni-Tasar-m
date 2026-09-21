"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewSection({ productId, reviews }: { productId: string; reviews: any[] }) {
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ comment: string }>();

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
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Yorumunuz eklendi!");
      setRating(0);
      reset();
    } catch (err: any) {
      toast.error(err.message ?? "Yorum eklenemedi.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-12">
      <h2 className="text-2xl font-black dark:text-white mb-8">Değerlendirmeler ({reviews.length})</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-lg dark:text-white mb-4">Yorum Yap</h3>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(star)}>
                <Star className={`w-8 h-8 transition-colors ${star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-600 dark:text-zinc-600"}`} />
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <textarea
              {...register("comment")}
              rows={4}
              placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm"
            />
            <button type="submit" disabled={submitting} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
            </button>
          </form>
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">Henüz yorum yok. İlk yorumu sen yap!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">{(r.user?.name ?? "U")[0]}</div>
                    <span className="font-semibold text-sm dark:text-white">{r.user?.name ?? "Anonim"}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{r.comment}</p>}
                <p className="text-zinc-300 dark:text-zinc-600 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
