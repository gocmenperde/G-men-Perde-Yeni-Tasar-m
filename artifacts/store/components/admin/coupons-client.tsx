"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Ticket } from "lucide-react";
import toast from "react-hot-toast";

interface CouponForm {
  code: string;
  type: string;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}

export default function AdminCouponsClient({ coupons: initial }: { coupons: any[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponForm>();

  const onSubmit = async (data: CouponForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCoupons((prev) => [result.data, ...prev]);
      toast.success("Kupon oluşturuldu!");
      reset();
    } catch (err: any) {
      toast.error(err.message ?? "Oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Kuponu silmek istiyor musunuz?")) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white">Kuponlar</h1>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h2 className="font-semibold text-white mb-5">Yeni Kupon Oluştur</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Kupon Kodu *</label>
            <input {...register("code", { required: true })} placeholder="ÖRN: YAZA20" className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 uppercase font-mono placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Tür *</label>
            <select {...register("type", { required: true })} className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm">
              <option value="PERCENTAGE">Yüzde (%)</option>
              <option value="FIXED">Sabit Tutar (₺)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Değer *</label>
            <input {...register("value", { required: true, min: 0.01 })} type="number" step="0.01" placeholder="20" className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Min. Sipariş (₺)</label>
            <input {...register("minOrderAmount")} type="number" step="0.01" placeholder="0" className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Maks. Kullanım</label>
            <input {...register("maxUses")} type="number" placeholder="Sınırsız" className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Son Kullanma</label>
            <input {...register("expiresAt")} type="date" className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors">
              <Plus className="w-4 h-4" /> Kupon Oluştur
            </button>
          </div>
        </form>
      </div>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="py-12 text-center">
            <Ticket className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-400 text-sm">Henüz kupon yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Kod", "Tür / Değer", "Min. Sipariş", "Kullanım", "Son Tarih", "İşlem"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-amber-400 bg-amber-900/20 px-2.5 py-1 rounded-lg text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-200 font-semibold">
                      {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `₺${Number(coupon.value).toLocaleString("tr-TR")}`}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {Number(coupon.minOrderAmount) > 0 ? `₺${Number(coupon.minOrderAmount).toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{coupon.usedCount} / {coupon.maxUses ?? "∞"}</td>
                    <td className="px-5 py-4 text-zinc-400 text-xs">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("tr-TR") : "Süresiz"}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => onDelete(coupon.id)} className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-zinc-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
