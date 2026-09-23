"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Ticket, Power, Info, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadAdminImage } from "@/components/admin/media-upload";

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
  payQuantity: number;
  getQuantity: number;
  buyRule: string;
  buyAmount: number;
  payAmount: number;
  audience: string;
  premiumOnly: boolean;
};

const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400";
const emptyForm: CouponForm = {
  code: "",
  type: "PERCENTAGE",
  value: 0,
  scope: "ALL",
  targetId: "",
  minOrderAmount: undefined,
  maxOrderAmount: undefined,
  maxUses: undefined,
  expiresAt: "",
  freeProductId: "",
  freeProductQuantity: 1,
  buyQuantity: 1,
  payQuantity: 1,
  getQuantity: 1,
  buyRule: "QUANTITY",
  buyAmount: 0,
  payAmount: 0,
  audience: "ALL",
  premiumOnly: false,
};

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const { register, handleSubmit, reset, watch } = useForm<CouponForm>({
    defaultValues: emptyForm,
  });
  const type = watch("type");
  const scope = watch("scope");
  const buyRule = watch("buyRule");

  const onSubmit = async (data: CouponForm) => {
    const currentEdit = editingCoupon;
    setIsSubmitting(true);
    try {
      const imageUrl = imageFile
        ? await uploadAdminImage(imageFile)
        : currentEdit?.imageUrl ?? "";
      const res = await fetch(currentEdit ? `/api/coupons/${currentEdit.id}` : "/api/coupons", {
        method: currentEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, imageUrl, ruleType: "DISCOUNT" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCoupons((prev) => currentEdit
        ? prev.map((item) => item.id === currentEdit.id ? result.data : item)
        : [result.data, ...prev]);
      toast.success(currentEdit ? "Kampanya güncellendi." : "Kupon oluşturuldu.");
      setEditingCoupon(null);
      reset(emptyForm);
      setImageFile(null);
      setImagePreview("");
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

  const startEditing = (coupon: any) => {
    setEditingCoupon(coupon);
    setImageFile(null);
    setImagePreview(coupon.imageUrl ?? "");
    reset({
      ...emptyForm,
      code: coupon.code ?? "",
      type: coupon.type ?? "PERCENTAGE",
      value: Number(coupon.value ?? 0),
      scope: coupon.scope ?? "ALL",
      targetId: coupon.targetId ?? "",
      minOrderAmount: coupon.minOrderAmount == null ? undefined : Number(coupon.minOrderAmount),
      maxOrderAmount: coupon.maxOrderAmount == null ? undefined : Number(coupon.maxOrderAmount),
      maxUses: coupon.maxUses == null ? undefined : Number(coupon.maxUses),
      expiresAt: coupon.expiresAt ? String(coupon.expiresAt).slice(0, 10) : "",
      freeProductId: coupon.freeProductId ?? "",
      freeProductQuantity: Number(coupon.freeProductQuantity ?? 1),
      buyQuantity: Number(coupon.buyQuantity ?? 1),
      payQuantity: Number(coupon.payQuantity ?? Math.max(1, Number(coupon.buyQuantity ?? 1) - Number(coupon.getQuantity ?? 1))),
      getQuantity: Number(coupon.getQuantity ?? 1),
      buyRule: coupon.buyRule ?? "QUANTITY",
      buyAmount: coupon.buyAmount == null ? 0 : Number(coupon.buyAmount),
      payAmount: coupon.payAmount == null ? 0 : Number(coupon.payAmount),
      audience: coupon.audience ?? (coupon.premiumOnly ? "PREMIUM_ONLY" : "ALL"),
      premiumOnly: Boolean(coupon.premiumOnly),
    });
  };

  const cancelEditing = () => {
    setEditingCoupon(null);
    setImageFile(null);
    setImagePreview("");
    reset(emptyForm);
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
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-white">{editingCoupon ? "Kampanyayı düzenle" : "Yeni kupon / kampanya oluştur"}</h2>
              {editingCoupon && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400">Düzenleme modu</span>}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{editingCoupon ? "Değişiklikleri kaydedin veya düzenlemeyi iptal edin." : "Hedef seçilmezse tüm sepet için geçerli olur."}</p>
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
          {type === "BUY_X_GET_Y" && <div><label className={labelClass}>Kampanya ölçüsü</label><select {...register("buyRule")} className={inputClass}><option value="QUANTITY">Adet: X adet al, Y adet öde</option><option value="AMOUNT">TL: X TL al, Y TL öde</option></select></div>}
          {type === "BUY_X_GET_Y" && buyRule === "QUANTITY" && <><div><label className={labelClass}>Toplam kampanya adedi</label><input {...register("buyQuantity", { valueAsNumber: true })} type="number" min="2" className={inputClass} placeholder="9" /></div><div><label className={labelClass}>Ödenecek adet</label><input {...register("payQuantity", { valueAsNumber: true })} type="number" min="1" className={inputClass} placeholder="8" /></div></>}
          {type === "BUY_X_GET_Y" && buyRule === "AMOUNT" && <><div><label className={labelClass}>Alış tutarı (₺)</label><input {...register("buyAmount", { valueAsNumber: true })} type="number" min="0.01" step="0.01" placeholder="2000" className={inputClass} /></div><div><label className={labelClass}>Ödenecek tutar (₺)</label><input {...register("payAmount", { valueAsNumber: true })} type="number" min="0" step="0.01" placeholder="1500" className={inputClass} /></div></>}
          <div><label className={labelClass}>Minimum sipariş (₺)</label><input {...register("minOrderAmount", { valueAsNumber: true })} type="number" min="0" step="0.01" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Maksimum sipariş (₺)</label><input {...register("maxOrderAmount", { valueAsNumber: true })} type="number" min="0" step="0.01" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Toplam kullanım limiti</label><input {...register("maxUses", { valueAsNumber: true })} type="number" min="1" placeholder="Sınırsız" className={inputClass} /></div>
          <div><label className={labelClass}>Son kullanım tarihi</label><input {...register("expiresAt")} type="date" className={inputClass} /></div>
          <div><label className={labelClass}>Hedef kitle</label><select {...register("audience")} className={inputClass}><option value="ALL">Bütün üyeler</option><option value="PREMIUM_ONLY">Yalnızca Premium üyeler</option><option value="NORMAL_ONLY">Yalnızca normal üyeler</option></select></div>
          <div><label className={labelClass}>Kupon görseli</label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={`${inputClass} file:mr-2 file:rounded-lg file:border-0 file:bg-amber-500 file:px-2 file:py-1 file:text-xs file:font-bold file:text-zinc-900`} onChange={(event) => { const file = event.target.files?.[0] ?? null; setImageFile(file); setImagePreview(file ? URL.createObjectURL(file) : ""); }} />{imagePreview && <img src={imagePreview} alt="Kupon önizleme" className="mt-2 h-14 w-24 rounded-lg object-cover" />}</div>
          <div className="flex items-center gap-2 lg:col-span-4">
             {editingCoupon && <button type="button" onClick={cancelEditing} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"><X className="h-4 w-4" /> İptal</button>}
             <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50">{editingCoupon ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {isSubmitting ? "Kaydediliyor..." : editingCoupon ? "Değişiklikleri kaydet" : "Kupon oluştur"}</button>
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
                 <td className="px-5 py-4">{coupon.imageUrl && <img src={coupon.imageUrl} alt="" className="mb-2 h-10 w-16 rounded-md object-cover" />}<span className="rounded-lg bg-amber-900/20 px-2.5 py-1 font-mono text-sm font-bold text-amber-400">{coupon.code}</span>{(coupon.audience === "PREMIUM_ONLY" || coupon.premiumOnly) && <span className="ml-2 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-400">PREMİUM</span>}{coupon.audience === "NORMAL_ONLY" && <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-400">NORMAL</span>}</td>
                 <td className="px-5 py-4 text-zinc-200">{coupon.type === "PERCENTAGE" ? `%${coupon.value}` : coupon.type === "FIXED" ? `₺${Number(coupon.value).toLocaleString("tr-TR")}` : coupon.type === "FREE_SHIPPING" ? "Ücretsiz kargo" : coupon.type === "FREE_PRODUCT" ? "Ücretsiz ürün" : coupon.buyRule === "AMOUNT" ? `₺${Number(coupon.buyAmount).toLocaleString("tr-TR")} al ₺${Number(coupon.payAmount).toLocaleString("tr-TR")} öde` : `${coupon.buyQuantity} adet al ${coupon.payQuantity ?? Number(coupon.buyQuantity) - Number(coupon.getQuantity ?? 1)} adet öde`}</td>
                <td className="px-5 py-4 text-xs text-zinc-400">{coupon.scope === "ALL" ? "Tüm sepet" : coupon.scope === "PRODUCT" ? "Ürün" : coupon.scope === "CATEGORY" ? "Kategori" : "Marka"}{coupon.targetId ? <span className="block text-zinc-600">{coupon.targetId.slice(-8)}</span> : null}</td>
                <td className="px-5 py-4 text-xs text-zinc-400">{coupon.minOrderAmount ? `₺${Number(coupon.minOrderAmount).toLocaleString("tr-TR")} altı` : "Alt limit yok"}<span className="block">{coupon.usedCount} / {coupon.maxUses ?? "∞"} kullanım</span></td>
                 <td className="px-5 py-4"><button onClick={() => toggleCoupon(coupon)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${coupon.isActive ? "bg-green-900/30 text-green-400" : "bg-zinc-800 text-zinc-500"}`}><Power className="h-3 w-3" />{coupon.isActive ? "Aktif" : "Pasif"}</button></td>
                 <td className="px-5 py-4"><div className="flex items-center gap-1"><button type="button" onClick={() => startEditing(coupon)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 px-2.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/10" aria-label={`${coupon.code} kampanyasını düzenle`} title="Düzenle"><Pencil className="h-3.5 w-3.5" />Düzenle</button><button type="button" onClick={() => onDelete(coupon.id)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-950/30 hover:text-red-400" aria-label={`${coupon.code} kampanyasını sil`} title="Sil"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}