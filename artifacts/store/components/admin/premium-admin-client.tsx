"use client";

import { useState } from "react";
import { Crown, Save, Users, Truck, Tag, Check } from "lucide-react";
import toast from "react-hot-toast";

type PremiumSettings = {
  premiumEnabled: boolean;
  premiumPrice: number;
  premiumDiscountType: string;
  premiumDiscountValue: number;
  premiumFreeShipping: boolean;
  premiumLogoText: string;
};

export default function PremiumAdminClient({
  initialSettings,
  stats,
}: {
  initialSettings: PremiumSettings;
  stats: { activeMembers: number; totalMembers: number };
}) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof PremiumSettings, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!Number.isFinite(Number(form.premiumPrice)) || Number(form.premiumPrice) <= 0) {
      toast.error("Premium aylık ücretini geçerli girin.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          premiumEnabled: form.premiumEnabled,
          premiumPrice: Number(form.premiumPrice),
          premiumDiscountType: form.premiumDiscountType,
          premiumDiscountValue: Number(form.premiumDiscountValue),
          premiumFreeShipping: form.premiumFreeShipping,
          premiumLogoText: form.premiumLogoText.trim() || "Göçmen Premium Üyesi",
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Ayarlar kaydedilemedi.");
      toast.success("Premium ayarları kaydedildi.");
    } catch (error: any) {
      toast.error(error.message ?? "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-black text-white"><Crown className="h-7 w-7 text-amber-400" /> Premium Üyelik</h1>
          <p className="mt-1 text-sm text-zinc-400">Aylık üyelik fiyatını, müşteriye sunulan avantajları ve hesap rozetini yönetin.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Kaydediliyor..." : "Kaydet"}</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="rounded-xl bg-amber-500/10 p-3 text-amber-400"><Users className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Aktif Premium müşteri</p><p className="text-2xl font-black text-white">{stats.activeMembers}</p></div></div>
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><div className="rounded-xl bg-blue-500/10 p-3 text-blue-400"><Tag className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Başarılı Premium üyelik ödemesi</p><p className="text-2xl font-black text-white">{stats.totalMembers}</p></div></div>
      </div>

      <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <label className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <span><span className="block font-bold text-white">Premium üyeliği satışa aç</span><span className="mt-1 block text-xs text-zinc-500">Kapalı olduğunda yeni üyelik başlatılamaz, mevcut üyelikler çalışmaya devam eder.</span></span>
          <button type="button" onClick={() => set("premiumEnabled", !form.premiumEnabled)} className={`relative h-6 w-12 rounded-full transition ${form.premiumEnabled ? "bg-amber-500" : "bg-zinc-700"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${form.premiumEnabled ? "left-6" : "left-0.5"}`} /></button>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Aylık ücret (₺)</label><input value={form.premiumPrice} onChange={(e) => set("premiumPrice", Number(e.target.value))} type="number" min="1" step="0.01" className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-amber-500 focus:outline-none" /></div>
          <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Hesap rozeti metni</label><input value={form.premiumLogoText} onChange={(e) => set("premiumLogoText", e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-amber-500 focus:outline-none" /></div>
          <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Premium indirimi</label><div className="flex gap-2"><select value={form.premiumDiscountType} onChange={(e) => set("premiumDiscountType", e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus:border-amber-500 focus:outline-none"><option value="PERCENTAGE">Yüzde</option><option value="FIXED">Sabit ₺</option></select><input value={form.premiumDiscountValue} onChange={(e) => set("premiumDiscountValue", Number(e.target.value))} type="number" min="0" step="0.01" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-amber-500 focus:outline-none" /></div></div>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200"><input checked={form.premiumFreeShipping} onChange={(e) => set("premiumFreeShipping", e.target.checked)} type="checkbox" className="h-4 w-4 accent-amber-500" /><Truck className="h-4 w-4 text-amber-400" /> Premium siparişlerinde ücretsiz kargo</label>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="flex items-center gap-2 font-bold text-amber-300"><Check className="h-4 w-4" /> Müşteri deneyimi</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Müşteri Premium ödemesini PayTR ekranında tamamladığında üyelik bir ay aktifleşir. Süresi devam ederken yenilerse yeni ay mevcut bitiş tarihinin üzerine eklenir. Otomatik tahsilat yapılmaz.</p>
        </div>
      </div>
    </div>
  );
}