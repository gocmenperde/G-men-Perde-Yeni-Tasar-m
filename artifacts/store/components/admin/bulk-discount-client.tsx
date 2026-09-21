"use client";

import { useState } from "react";
import { Percent, Tag, Loader2, Check, Undo2, AlertTriangle, ChevronDown, TrendingUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export default function BulkDiscountClient({ categories, brands }: Props) {
  const [type, setType]   = useState<"category" | "brand" | "all">("category");
  const [id, setId]       = useState("");
  const [mode, setMode]   = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [applyOnlyNoDiscount, setApplyOnlyNoDiscount] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [result, setResult]     = useState<{ updated: number; total: number } | null>(null);

  const [seedingPrices, setSeedingPrices] = useState(false);
  const [seedResult, setSeedResult] = useState<{ updated: number; skipped: number; total: number } | null>(null);

  const seedComparePrices = async (overwrite: boolean) => {
    const msg = overwrite
      ? "Tüm ürünlere (mevcut karşılaştırma fiyatlarının üzerine yazarak) yeni orijinal fiyat eklenecek. Devam?"
      : "Karşılaştırma fiyatı olmayan ürünlere otomatik orijinal fiyat eklenecek. Devam?";
    if (!confirm(msg)) return;
    setSeedingPrices(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/seed-compare-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overwrite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeedResult(data);
      toast.success(`${data.updated} ürüne karşılaştırma fiyatı eklendi!`);
    } catch (e: any) {
      toast.error(e.message ?? "Hata oluştu.");
    } finally {
      setSeedingPrices(false);
    }
  };

  const apply = async () => {
    const v = parseFloat(value);
    if (!v || v <= 0) { toast.error("Geçerli bir değer girin."); return; }
    if (mode === "percent" && v > 90) { toast.error("Yüzde 90'dan fazla indirim uygulanamaz."); return; }
    if ((type === "category" || type === "brand") && !id) { toast.error("Bir seçim yapın."); return; }

    const label = mode === "percent" ? `%${v}` : `₺${v}`;
    const target = type === "all" ? "tüm ürünlere" : type === "category" ? "seçili kategoriye" : "seçili markaya";
    if (!confirm(`${target} ${label} indirim uygulanacak. Devam edilsin mi?`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/bulk-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, mode, value: v, minPrice: minPrice ? parseFloat(minPrice) : undefined, applyOnlyNoDiscount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success(`${data.updated} ürüne indirim uygulandı!`);
    } catch (e: any) {
      toast.error(e.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    if ((type === "category" || type === "brand") && !id) { toast.error("Bir seçim yapın."); return; }
    if (!confirm("Seçili ürünlerin indirimleri kaldırılacak ve orijinal fiyatları geri yüklenecek. Devam?")) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/bulk-discount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.restored} ürünün indirimi kaldırıldı.`);
      setResult(null);
    } catch (e: any) {
      toast.error(e.message ?? "Bir hata oluştu.");
    } finally {
      setRestoring(false);
    }
  };

  const selectCls = "w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer";
  const inputCls  = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-500";

  const options = type === "category" ? categories : brands;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-white">Toplu İndirim</h1>
        <p className="text-zinc-400 mt-1 text-sm">Kategori veya markaya ait tüm ürünlere tek seferde indirim uygulayın.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-400/80 text-sm leading-relaxed">
          Bu işlem seçili ürünlerin fiyatını düşürür ve orijinal fiyatı <strong className="text-amber-300">İndirimden Önceki Fiyat</strong> olarak saklar.
          Geri alma butonu ile her zaman eski fiyatlara dönebilirsiniz.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">

        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">İndirim Uygulama Kapsamı</label>
          <div className="grid grid-cols-3 gap-2">
            {(["category", "brand", "all"] as const).map((t) => (
              <button key={t} onClick={() => { setType(t); setId(""); }}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${type === t ? "bg-amber-500 border-amber-500 text-zinc-900" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}>
                {t === "category" ? "Kategori" : t === "brand" ? "Marka" : "Tüm Ürünler"}
              </button>
            ))}
          </div>
        </div>

        {type !== "all" && (
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">
              {type === "category" ? "Kategori Seçin" : "Marka Seçin"}
            </label>
            <div className="relative">
              <select value={id} onChange={(e) => setId(e.target.value)} className={selectCls}>
                <option value="" className="bg-zinc-900">— Seçiniz —</option>
                {options.map((o) => <option key={o.id} value={o.id} className="bg-zinc-900">{o.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">İndirim Türü</label>
          <div className="grid grid-cols-2 gap-2">
            {(["percent", "fixed"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${mode === m ? "bg-amber-500 border-amber-500 text-zinc-900" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}>
                {m === "percent" ? <><Percent className="w-4 h-4" /> Yüzde (%)</> : <><Tag className="w-4 h-4" /> Sabit Tutar (₺)</>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">
            İndirim Miktarı {mode === "percent" ? "(%)" : "(₺)"}
          </label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "percent" ? "Örn: 15 → %15 indirim" : "Örn: 50 → 50₺ indirim"}
            min="0.01" step="0.01"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-2">Min. Fiyat Filtresi (isteğe bağlı)</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Örn: 100 → ₺100+ ürünler"
              min="0" className={inputCls}
            />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => setApplyOnlyNoDiscount((v) => !v)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${applyOnlyNoDiscount ? "bg-amber-500" : "bg-zinc-700"}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${applyOnlyNoDiscount ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm text-zinc-300 leading-tight">Sadece indirimsiz ürünlere uygula</span>
            </label>
          </div>
        </div>

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-300 text-sm font-semibold">
              {result.total} üründen <strong>{result.updated}</strong> tanesine indirim uygulandı.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={apply} disabled={loading || restoring}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 font-black rounded-xl transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uygulanıyor…</> : <><Percent className="w-4 h-4" /> İndirimi Uygula</>}
          </button>
          <button onClick={restore} disabled={loading || restoring}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-bold rounded-xl border border-zinc-700 transition-colors">
            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
            Geri Al
          </button>
        </div>
      </div>

      {/* ── KARŞILAŞTIRMA FİYATI ── */}
      <div className="bg-zinc-900 rounded-2xl p-6 space-y-5 border border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Otomatik Karşılaştırma Fiyatı</p>
            <p className="text-zinc-500 text-xs mt-0.5">Ürün kartlarında üstü çizili "orijinal fiyat" ve indirim etiketi gösterir</p>
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nasıl çalışır?</p>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Her ürün için <strong className="text-white">%15–30 arası</strong> karışık bir marjin seçilir</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Karşılaştırma fiyatı = mevcut satış fiyatı + seçilen marjin</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Ürün kartında <strong className="text-white">"%18 İNDİRİM"</strong> gibi bir etiket otomatik hesaplanır</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Mevcut satış fiyatları değişmez, sadece karşılaştırma fiyatı eklenir</li>
          </ul>
        </div>

        {seedResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm font-semibold">
              {seedResult.total} üründen <strong>{seedResult.updated}</strong> tanesine karşılaştırma fiyatı eklendi
              {seedResult.skipped > 0 && <span className="text-emerald-500/70 font-normal">, {seedResult.skipped} atlandı</span>}.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => seedComparePrices(false)}
            disabled={seedingPrices}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-colors"
          >
            {seedingPrices
              ? <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor…</>
              : <><TrendingUp className="w-4 h-4" /> Fiyat Eksilenlere Uygula</>}
          </button>
          <button
            onClick={() => seedComparePrices(true)}
            disabled={seedingPrices}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-bold rounded-xl border border-zinc-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Tümünü Yenile
          </button>
        </div>
        <p className="text-[11px] text-zinc-600 text-center">"Fiyat Eksilenlere Uygula" sadece karşılaştırma fiyatı olmayan ürünleri günceller · "Tümünü Yenile" hepsini sıfırdan hesaplar</p>
      </div>
    </div>
  );
}
