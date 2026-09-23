"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Ticket, Power, Info } from "lucide-react";
import toast from "react-hot-toast";

type Option = { id: string; name: string };
type ProductOption = Option & { price: number };

type CouponForm = {
  code: string;
  type: string;
  value: number;
  scope: string;
  targetId: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  freeProductId: string;
  freeProductQuantity: number;
  buyQuantity: number;
  getQuantity: number;
  premiumOnly: boolean;
};

const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400";

export default function AdminCouponsClient({
  coupons: initial,
  categories,
  brands,
  products,
}: {
  coupons: any[];
  categories: Option[];
  brands: Option[];
  products: ProductOption[];
}) {
  const [coupons, setCoupons] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<CouponForm>({
    defaultValues: {
      type: "PERCENTAGE",
      scope: "ALL",
      freeProductQuantity: 1,
      buyQuantity: 1,
      getQuantity: 1,
      premiumOnly: false,
    },
  });
  const type = watch("type");
  const scope = watch("scope");

  const onSubmit = async (data: CouponForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ruleType: "DISCOUNT" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCoupons((prev) => [result.data, ...prev]);
      toast.success("Kupon oluşturuldu.");
      reset({ type: "PERCENTAGE", scope: "ALL", freeProductQuantity: 1, buyQuantity: 1, getQuantity: 1, premiumOnly: false });
    } catch (err: any) {
      toast.error(err.message ?? "Kupon oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCoupon = async (coupon: any) => {
    const res = await fetch(`/api/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    if (!res.ok) return toast.error("Kupon durumu değiştirilemedi.");
    setCoupons((prev) => prev.map((item) => item.id === coupon.id ? { ...item, isActive: !coupon.isActive } : item));
    toast.success(coupon.isActive ? "Kupon pasife alındı." : "Kupon aktifleştirildi.");
  };

  const onDelete = async (id: string) => {
    if (!confirm("Kuponu silmek istiyor musunuz?")) return;
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Silinemedi.");
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Kupon silindi.");
  };

  const targetOptions = scope === "PRODUCT" ? products : scope === "CATEGORY" ? categories : brands;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Kupon & Kampanya Merkezi</h1>
        <p className="mt-1 text-sm text-zinc-400">Ürün, kategori, marka ve Premium üyelik kurallarını tek kuponda yönetin.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400"><Ticket className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold text-white">Yeni kupon / kampanya oluştur</h2>
            <p className="mt-1 text-xs text-zinc-500">Hedef seçilmezse tüm sepet için geçerli olur.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className={labelClass}>Kupon kodu *</label><input {...register("code", { required: true })} placeholder="ÖRN: GOCMEN20" className={`${inputClass} uppercase font-mono`} /></div>
          <div><label className={labelClass}>Kampanya tipi *</label><select {...register("type")} className={inputClass}>
            <option value="PERCENTAGE">Yüzde indirim (%)</option>
            <option value="FIXED">Sabit indirim (₺)</option>
            <option value="FREE_SHIPPING">Ücretsiz kargo</option>
            <option value="FREE_PRODUCT">Ücretsiz ürün</option>
            <option value="BUY_X_GET_Y">X al Y öde</option>
          </select></div>
          {(type === "PERCENTAGE" || type === "FIXED") && <div><label className={labelClass}>İndirim değeri *</label><input {...register("value", { valueAsNumber: true })} type="number" min="0.01" step="0.01" placeholder={type === "PERCENTAGE" ? "20" : "100"} className={inputClass} /></div>}
          <div><label className={labelClass}>Hedef kapsamı</label><select {...register("scope")} className={inputClass}>
            <option value="ALL">Tüm ürünler</option><option value="PRODUCT">Tek ürün</option><option value="CATEGORY">Kategori</option><option value="BRAND">Marka</option>
          </select></div>
          {scope !== "ALL" && <div><label className={labelClass}>Hedef seçimi *</label><select {...register("targetId")} className={inputClass}><option value="">Seçiniz</option>{targetOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>}
          {(type === "FREE_PRODUCT") && <div><label className={labelClass}>Ücretsiz ürün *</label><select {...register("freeProductId")} className={inputClass}><option value="">Ürün seçiniz</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} · ₺{item.price.toLocaleString("tr-TR")}</option>)}</select></div>}
          {(type === "FREE_PRODUCT") && <div><label className={labelClass}>Ücretsiz adet</label><input {...register("freeProductQuantity", { valueAsNumber: true })} type="number" min="1" className={inputClass} /></div>}
          {(type === "BUY_X_GET_Y") && <><div><label className={labelClass}>Alınacak adet</label><input {...register("buyQuantity", { valueAsNumber: true })} type="number" min="1" className={inputClass} /></div><div><label className={labelClass}>Bedava adet</label><input {...register("getQuantity", { valueAsNumber: true })} type="number" min="1" className={inputClass} /></div></>}
          <div><label className={labelClass}>Minimum sipariş (₺)</label><input {...register("minOrderAmount", { valueAsNumber: true })} type="number" min="0" step="0.01" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Maksimum sipariş (₺)</label><input {...register("maxOrderAmount", { valueAsNumber: true })} type="number" min="0" step="0.01" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Toplam kullanım limiti</label><input {...register("maxUses", { valueAsNumber: true })} type="number" min="1" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Son kullanım tarihi</label><input {...register("expiresAt")} type="date" className={inputClass} /></div>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-300"><input {...register("premiumOnly")} type="checkbox" className="h-4 w-4 accent-amber-500" /> Yalnızca Premium üyeler</label>
          <div className="flex items-center gap-2 lg:col-span-4">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50"><Plus className="h-4 w-4" /> {isSubmitting ? "Oluşturuluyor..." : "Kupon oluştur"}</button>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500"><Info className="h-3.5 w-3.5" /> İndirimler sipariş anında sunucuda tekrar hesaplanır.</span>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {coupons.length === 0 ? <div className="py-14 text-center text-sm text-zinc-500"><Ticket className="mx-auto mb-2 h-10 w-10 text-zinc-700" />Henüz kupon oluşturulmadı.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800">{["Kod", "Kural", "Hedef", "Limit", "Durum", "İşlem"].map((heading) => <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-zinc-800">{coupons.map((coupon) => (
              <tr key={coupon.id} className="transition-colors hover:bg-zinc-800/50">
                <td className="px-5 py-4"><span className="rounded-lg bg-amber-900/20 px-2.5 py-1 font-mono text-sm font-bold text-amber-400">{coupon.code}</span>{coupon.premiumOnly && <span className="ml-2 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-400">PREMİUM</span>}</td>
                <td className="px-5 py-4 text-zinc-200">{coupon.type === "PERCENTAGE" ? `%${coupon.value}` : coupon.type === "FIXED" ? `₺${Number(coupon.value).toLocaleString("tr-TR")}` : coupon.type === "FREE_SHIPPING" ? "Ücretsiz kargo" : coupon.type === "FREE_PRODUCT" ? "Ücretsiz ürün" : `${coupon.buyQuantity} al ${coupon.getQuantity} bedava`}</td>
                <td className="px-5 py-4 text-xs text-zinc-400">{coupon.scope === "ALL" ? "Tüm sepet" : coupon.scope === "PRODUCT" ? "Ürün" : coupon.scope === "CATEGORY" ? "Kategori" : "Marka"}{coupon.targetId ? <span className="block text-zinc-600">{coupon.targetId.slice(-8)}</span> : null}</td>
                <td className="px-5 py-4 text-xs text-zinc-400">{coupon.minOrderAmount ? `₺${Number(coupon.minOrderAmount).toLocaleString("tr-TR")} altı` : "Alt limit yok"}<span className="block">{coupon.usedCount} / {coupon.maxUses ?? "∞"} kullanım</span></td>
                <td className="px-5 py-4"><button onClick={() => toggleCoupon(coupon)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${coupon.isActive ? "bg-green-900/30 text-green-400" : "bg-zinc-800 text-zinc-500"}`}><Power className="h-3 w-3" />{coupon.isActive ? "Aktif" : "Pasif"}</button></td>
                <td className="px-5 py-4"><button onClick={() => onDelete(coupon.id)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-950/30 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}