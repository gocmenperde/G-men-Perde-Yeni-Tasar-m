"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Loader2, ImageIcon, MoveUp, MoveDown, Search, Sparkles, PackageOpen, GripVertical } from "lucide-react";
import { uploadAdminImage } from "./media-upload";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  cta2Text?: string | null;
  cta2Href?: string | null;
  imageUrl?: string | null;
  gradient: string;
  darkText: boolean;
  isActive: boolean;
  order: number;
  productIds?: string[];
}

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  images?: string[];
  sku?: string | null;
  barcode?: string | null;
};

const GRADIENT_OPTIONS = [
  { value: "amber",   label: "Altın",    color: "bg-gradient-to-r from-amber-600 to-orange-400" },
  { value: "rose",    label: "Gül",      color: "bg-gradient-to-r from-rose-700 to-pink-500" },
  { value: "blue",    label: "Lacivert", color: "bg-gradient-to-r from-blue-800 to-indigo-600" },
  { value: "emerald", label: "Zümrüt",   color: "bg-gradient-to-r from-emerald-800 to-teal-600" },
  { value: "zinc",    label: "Antrasit", color: "bg-gradient-to-r from-zinc-900 to-zinc-700" },
  { value: "purple",  label: "Mor",      color: "bg-gradient-to-r from-purple-800 to-violet-600" },
  { value: "cream",   label: "Krem",     color: "bg-gradient-to-r from-amber-50 to-yellow-50 border border-zinc-200" },
  { value: "slate",   label: "Gri",      color: "bg-gradient-to-r from-slate-900 to-slate-700" },
];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  badge: "",
  ctaText: "Alışverişe Başla",
  ctaHref: "/products",
  cta2Text: "",
  cta2Href: "",
  imageUrl: "",
  productIds: [] as string[],
  gradient: "amber",
  darkText: false,
  isActive: true,
};

const STARTER_BANNERS = [
  {
    title: "Yeni perde koleksiyonu geldi",
    subtitle: "Tül, fon, stor, zebra ve plise perde modellerini keşfedin.",
    badge: "YENİ KOLEKSİYON",
    ctaText: "Ürünleri keşfet",
    ctaHref: "/products",
    gradient: "blue",
  },
  {
    title: "Pencerenize özel çözümler",
    subtitle: "Tül, fon, stor, zebra ve plise perde modellerini keşfedin.",
    badge: "ÖZEL ÖLÇÜ",
    ctaText: "Koleksiyonu gör",
    ctaHref: "/products",
    gradient: "emerald",
  },
  {
    title: "Işığı yaşamınıza göre ayarlayın",
    subtitle: "Stor ve zebra perdelerle gün ışığını dengeli kullanın.",
    badge: "IŞIK KONTROLÜ",
    ctaText: "Perdeleri incele",
    ctaHref: "/products",
    gradient: "rose",
  },
  {
    title: "Odanıza karakter katın",
    subtitle: "Fon perdeler ve örme tüllerle dekorasyonun son dokunuşunu yapın.",
    badge: "DEKORASYON",
    ctaText: "Modelleri keşfet",
    ctaHref: "/products",
    gradient: "purple",
  },
  {
    title: "Ücretsiz ölçü desteği",
    subtitle: "Bursa içi keşif, doğru ölçü ve profesyonel montaj için bize ulaşın.",
    badge: "GÖÇMEN PERDE",
    ctaText: "İletişime geç",
    ctaHref: "/products",
    gradient: "amber",
  },
];

export default function BannersClient({
  initial,
  embedded = false,
  loading = false,
  onBannersChange,
}: {
  initial: Banner[];
  embedded?: boolean;
  loading?: boolean;
  onBannersChange?: (banners: Banner[]) => void;
}) {
  const [banners, setBanners] = useState<Banner[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const selectedLoadId = useRef(0);

  useEffect(() => {
    setBanners(initial);
  }, [initial]);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function startCreate() {
    selectedLoadId.current += 1;
    setForm({ ...EMPTY_FORM });
    setSelectedProducts([]);
    setProductSearch("");
    setProductResults([]);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(b: Banner) {
    const loadId = ++selectedLoadId.current;
    const productIds = b.productIds ?? [];
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      badge: b.badge ?? "",
      ctaText: b.ctaText ?? "",
      ctaHref: b.ctaHref ?? "/products",
      cta2Text: b.cta2Text ?? "",
      cta2Href: b.cta2Href ?? "",
      imageUrl: b.imageUrl ?? "",
      productIds,
      gradient: b.gradient,
      darkText: b.darkText,
      isActive: b.isActive,
    });
    setSelectedProducts([]);
    setProductSearch("");
    setProductResults([]);
    if (productIds.length) {
      fetch(`/api/products?ids=${encodeURIComponent(productIds.join(","))}&take=4&includeTotal=false`)
        .then((res) => res.json())
        .then((data) => {
          if (loadId !== selectedLoadId.current) return;
          const products = Array.isArray(data.data) ? data.data : [];
          setSelectedProducts(
            productIds
              .map((id) => products.find((product: ProductOption) => product.id === id))
              .filter(Boolean) as ProductOption[],
          );
        })
        .catch(() => {
          if (loadId === selectedLoadId.current) setSelectedProducts([]);
        });
    }
    setEditing(b.id);
    setCreating(false);
  }

  function cancelForm() {
    selectedLoadId.current += 1;
    setEditing(null);
    setCreating(false);
    setSelectedProducts([]);
    setProductSearch("");
    setProductResults([]);
  }

  async function uploadBannerImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const imageUrl = await uploadAdminImage(file);
      setForm((current) => ({ ...current, imageUrl }));
      showToast("Banner görseli yüklendi.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Banner görseli yüklenemedi.", false);
    } finally {
      setUploadingImage(false);
    }
  }

  const showForm = creating || !!editing;

  useEffect(() => {
    const query = productSearch.trim();
    if (query.length < 2 || !showForm) {
      setProductResults([]);
      return;
    }
    const controller = new AbortController();
    setProductLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(query)}&take=8&includeTotal=false`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setProductResults(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setProductResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductLoading(false);
      });
    return () => controller.abort();
  }, [productSearch, showForm]);

  function selectProduct(product: ProductOption) {
    if (selectedProducts.some((item) => item.id === product.id)) return;
    if (selectedProducts.length >= 4) {
      showToast("Bir banner için en fazla 4 ürün seçebilirsiniz.", false);
      return;
    }
    const next = [...selectedProducts, product];
    setSelectedProducts(next);
    setForm((current) => ({
      ...current,
      productIds: next.map((item) => item.id),
      ctaHref: current.ctaHref === "/products" ? `/products/${product.slug}` : current.ctaHref,
    }));
    setProductSearch("");
    setProductResults([]);
  }

  function removeProduct(productId: string) {
    const next = selectedProducts.filter((product) => product.id !== productId);
    setSelectedProducts(next);
    setForm((current) => ({ ...current, productIds: next.map((item) => item.id) }));
  }

  function moveSelectedProduct(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedProducts.length) return;
    const next = [...selectedProducts];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setSelectedProducts(next);
    setForm((current) => ({ ...current, productIds: next.map((item) => item.id) }));
  }

  function selectButtonProduct(field: "ctaHref" | "cta2Href", product: ProductOption) {
    setForm((current) => ({ ...current, [field]: `/products/${product.slug}` }));
  }

  async function saveCreate() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subtitle: form.subtitle || null, badge: form.badge || null, ctaText: form.ctaText || null, cta2Text: form.cta2Text || null, cta2Href: form.cta2Href || null, imageUrl: form.imageUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners(prev => {
        const next = [...prev, data.data];
        onBannersChange?.(next);
        return next;
      });
      setCreating(false);
      showToast("Banner oluşturuldu!");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Hata", false);
    } finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editing || !form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subtitle: form.subtitle || null, badge: form.badge || null, ctaText: form.ctaText || null, cta2Text: form.cta2Text || null, cta2Href: form.cta2Href || null, imageUrl: form.imageUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBanners(prev => {
        const next = prev.map(b => b.id === editing ? data.data : b);
        onBannersChange?.(next);
        return next;
      });
      setEditing(null);
      showToast("Banner güncellendi!");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Hata", false);
    } finally { setSaving(false); }
  }

  async function addStarterBanners() {
    const missing = Math.max(0, 5 - banners.length);
    if (!missing) return;
    setSaving(true);
    try {
      const created: Banner[] = [];
      for (const template of STARTER_BANNERS.slice(0, missing)) {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...template,
            cta2Text: null,
            cta2Href: null,
            subtitle: template.subtitle,
            imageUrl: null,
            darkText: false,
            isActive: true,
            order: banners.length + created.length,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Banner oluşturulamadı");
        created.push(data.data);
      }
      setBanners((current) => {
        const next = [...current, ...created];
        onBannersChange?.(next);
        return next;
      });
      showToast(`${created.length} yeni banner hazırlandı. Her birini ayrı ayrı düzenleyebilirsiniz.`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Bannerlar oluşturulamadı", false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setBanners(prev => {
        const next = prev.filter(b => b.id !== id);
        onBannersChange?.(next);
        return next;
      });
      showToast("Banner silindi!");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Hata", false);
    } finally { setDeletingId(null); }
  }

  async function toggleActive(b: Banner) {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanners(prev => {
          const next = prev.map(x => x.id === b.id ? data.data : x);
          onBannersChange?.(next);
          return next;
        });
      }
      else showToast(data.error ?? "Güncellenemedi", false);
    } catch {
      showToast("Bağlantı hatası", false);
    }
  }

  async function moveOrder(b: Banner, dir: -1 | 1) {
    const sorted = [...banners].sort((a, z) => a.order - z.order);
    const ci = sorted.findIndex(x => x.id === b.id);
    const ni = ci + dir;
    if (ni < 0 || ni >= sorted.length) return;
    const other = sorted[ni];
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/banners/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: other.order }) }),
        fetch(`/api/admin/banners/${other.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: b.order }) }),
      ]);
      if (r1.ok && r2.ok) {
        setBanners(prev => {
          const next = prev.map(x => {
            if (x.id === b.id) return { ...x, order: other.order };
            if (x.id === other.id) return { ...x, order: b.order };
            return x;
          });
          onBannersChange?.(next);
          return next;
        });
      } else {
        showToast("Sıralama güncellenemedi", false);
      }
    } catch {
      showToast("Bağlantı hatası", false);
    }
  }

  const sorted = [...banners].sort((a, z) => a.order - z.order);

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl transition-all sm:bottom-6 sm:right-6 ${toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`${embedded ? "text-lg" : "text-2xl"} font-bold text-white`}>
            {embedded ? "Kampanya bannerları" : "Banner Yönetimi"}
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {embedded
              ? "Ana sayfanın üstündeki 5 ayrı slaytı buradan tek tek düzenleyin."
              : "Ana sayfada gösterilen kayan bannerları yönetin"}
          </p>
        </div>
        {!showForm && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {banners.length < 5 && (
              <button
                onClick={addStarterBanners}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 text-amber-300 font-bold text-sm rounded-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                5 bannerı hazırla
              </button>
            )}
            <button
              onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Yeni Banner
            </button>
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="space-y-5 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white">{creating ? "Yeni Banner Oluştur" : "Banner Düzenle"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Başlık *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Büyük İndirim Başladı!" />
            <Field label="Alt Başlık" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="Seçili ürünlerde %40'a varan..." />
            <Field label="Rozet / Etiket" value={form.badge} onChange={v => setForm(f => ({ ...f, badge: v }))} placeholder="Yaz Sezonu · Özel Fiyatlar" />
            <Field label="Buton 1 Yazısı" value={form.ctaText} onChange={v => setForm(f => ({ ...f, ctaText: v }))} placeholder="Alışverişe Başla" />
            <Field label="Buton 2 Yazısı" value={form.cta2Text} onChange={v => setForm(f => ({ ...f, cta2Text: v }))} placeholder="Kampanyaları Gör" />
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-100">Banner görseli</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Görsel yüklemezseniz seçtiğiniz ürünler ve renk teması kullanılır. İsterseniz bilgisayarınızdan veya telefonunuzdan özel bir görsel ekleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400">Özel banner görseli (opsiyonel)</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-300 ${uploadingImage ? "pointer-events-none opacity-60" : ""}`}>
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon />}
                {uploadingImage ? "Yükleniyor..." : "Bilgisayar/telefondan görsel seç"}
                <input type="file" accept="image/*" className="hidden" onChange={uploadBannerImage} disabled={uploadingImage} />
              </label>
              {form.imageUrl && (
                <>
                  <img src={form.imageUrl} alt="Banner önizleme" className="h-14 w-24 rounded-lg border border-zinc-700 bg-zinc-800 object-cover" />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))} className="text-xs text-zinc-400 hover:text-red-400">Görseli kaldır</button>
                </>
              )}
            </div>
            <p className="text-[11px] text-zinc-600">Görsel Cloudinary’ye yüklenir; veritabanına yalnızca güvenli URL kaydedilir.</p>
          </div>

           <div className="rounded-2xl border border-zinc-800 bg-zinc-950/35 p-4">
             <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <div>
                 <label className="block text-sm font-bold text-white">
                   Bu slaytın ürün vitrini
                 </label>
                 <p className="mt-1 text-xs text-zinc-500">
                   Her slaytın ürünleri ayrıdır. Seçim yapmazsanız bu slayt otomatik ürünleri gösterir.
                 </p>
               </div>
               <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                 {selectedProducts.length}/4 seçildi
               </span>
             </div>

             <div className="relative">
               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
               <input
                 value={productSearch}
                 onChange={(event) => setProductSearch(event.target.value)}
                 placeholder="Ürün adı, marka, SKU veya barkod ara..."
                 className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 pl-9 pr-10 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                 aria-label="Bu slayta ürün ara"
               />
               {productLoading ? (
                 <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-400" />
               ) : productSearch ? (
                 <button type="button" onClick={() => setProductSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 hover:bg-zinc-700 hover:text-white" aria-label="Ürün aramasını temizle">
                   <X className="h-4 w-4" />
                 </button>
               ) : null}
             </div>

             {productSearch.trim().length > 0 && productSearch.trim().length < 2 && (
               <p className="mt-2 text-xs text-zinc-500">Aramayı başlatmak için en az 2 karakter yazın.</p>
             )}

             {productResults.length > 0 && (
               <div className="mt-3 grid max-h-[min(420px,45vh)] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                 {productResults.map((product) => {
                   const isSelected = selectedProducts.some((item) => item.id === product.id);
                   return (
                     <button
                       type="button"
                       key={product.id}
                       onClick={() => selectProduct(product)}
                       disabled={isSelected || selectedProducts.length >= 4}
                       className={`group flex min-h-[76px] items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                         isSelected
                           ? "border-emerald-500/40 bg-emerald-500/10"
                           : "border-zinc-700 bg-zinc-800/70 hover:-translate-y-0.5 hover:border-amber-500/60 hover:bg-zinc-800"
                       } disabled:cursor-default`}
                     >
                       {product.images?.[0] ? (
                         <img src={product.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain p-1" />
                       ) : (
                         <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-zinc-900 text-zinc-600"><PackageOpen className="h-5 w-5" /></span>
                       )}
                       <span className="min-w-0 flex-1">
                         <span className="block line-clamp-2 text-xs font-bold leading-4 text-zinc-100">{product.name}</span>
                         <span className="mt-1 block truncate text-[10px] text-zinc-500">{product.barcode ? `Barkod ${product.barcode}` : product.sku ? `SKU ${product.sku}` : product.slug}</span>
                       </span>
                       <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${isSelected ? "bg-emerald-500 text-white" : "bg-amber-500/15 text-amber-300 group-hover:bg-amber-500 group-hover:text-zinc-950"}`}>
                         {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                       </span>
                     </button>
                   );
                 })}
               </div>
             )}

             {productSearch.trim().length >= 2 && !productLoading && productResults.length === 0 && (
               <div className="mt-3 rounded-xl border border-dashed border-zinc-700 px-4 py-5 text-center text-xs text-zinc-500">
                 Bu aramayla eşleşen ürün bulunamadı.
               </div>
             )}

             {selectedProducts.length > 0 ? (
               <div className="mt-4 border-t border-zinc-800 pt-4">
                 <div className="mb-2 flex items-center justify-between">
                   <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300/80">Seçilen ürünler</span>
                   <span className="text-[10px] text-zinc-600">Sıralama ana sayfadaki görünümü belirler</span>
                 </div>
                 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                   {selectedProducts.map((product, index) => (
                     <div key={product.id} className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-zinc-800/70 p-2">
                       <GripVertical className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
                       <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-xs font-bold text-amber-300">{index + 1}</span>
                       {product.images?.[0] ? <img src={product.images[0]} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-900 text-zinc-600"><PackageOpen className="h-4 w-4" /></span>}
                       <span className="min-w-0 flex-1">
                         <span className="block truncate text-xs font-semibold text-zinc-200">{product.name}</span>
                         <span className="mt-0.5 block truncate text-[10px] text-zinc-500">{product.barcode ? `Barkod ${product.barcode}` : product.sku ? `SKU ${product.sku}` : product.slug}</span>
                       </span>
                       <span className="flex shrink-0 flex-col gap-0.5">
                         <button type="button" onClick={() => moveSelectedProduct(index, -1)} disabled={index === 0} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-amber-300 disabled:opacity-20" aria-label={`${product.name} ürününü yukarı taşı`}><MoveUp className="h-3.5 w-3.5" /></button>
                         <button type="button" onClick={() => moveSelectedProduct(index, 1)} disabled={index === selectedProducts.length - 1} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-amber-300 disabled:opacity-20" aria-label={`${product.name} ürününü aşağı taşı`}><MoveDown className="h-3.5 w-3.5" /></button>
                       </span>
                       <button type="button" onClick={() => removeProduct(product.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-950/40 hover:text-red-400" aria-label={`${product.name} ürününü kaldır`}><X className="h-4 w-4" /></button>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="mt-4 rounded-xl border border-dashed border-zinc-700 px-4 py-4 text-center text-xs text-zinc-500">
                 Henüz ürün seçilmedi. Arama sonuçlarından ürüne dokunarak bu slayta ekleyebilirsiniz.
               </div>
             )}
           </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProductLinkField label="Buton 1 hedefi" value={form.ctaHref} products={selectedProducts} onSelect={(product) => selectButtonProduct("ctaHref", product)} onChange={(value) => setForm((current) => ({ ...current, ctaHref: value }))} fallback="/products" />
            {form.cta2Text && <ProductLinkField label="Buton 2 hedefi" value={form.cta2Href} products={selectedProducts} onSelect={(product) => selectButtonProduct("cta2Href", product)} onChange={(value) => setForm((current) => ({ ...current, cta2Href: value }))} fallback="/products" />}
          </div>

          {/* Gradient picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Renk Teması</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_OPTIONS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setForm(f => ({ ...f, gradient: g.value }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${form.gradient === g.value ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                >
                  <span className={`w-5 h-5 rounded-full ${g.color}`} />
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={form.darkText} onChange={e => setForm(f => ({ ...f, darkText: e.target.checked }))} className="rounded" />
              Koyu metin (açık renkli arka plan için)
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
              Aktif
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={creating ? saveCreate : saveEdit}
              disabled={saving || uploadingImage || !form.title.trim() || productLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={cancelForm} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl transition-all">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 px-6 py-10 text-center text-sm text-zinc-500">
          Bannerlar yükleniyor...
        </div>
      ) : sorted.length === 0 && !showForm ? (
        <div className="text-center py-20 text-zinc-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">Henüz banner yok.</p>
          <p className="text-sm mt-1">Yukarıdan ilk banneri oluşturun.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b, i) => {
            const gOpt = GRADIENT_OPTIONS.find(g => g.value === b.gradient);
            return (
              <div key={b.id} className={`flex flex-col gap-3 rounded-2xl border bg-zinc-900 p-4 transition-all sm:flex-row sm:items-center sm:gap-4 ${b.isActive ? "border-zinc-700" : "border-zinc-800 opacity-60"}`}>
                 {/* Uploaded image or color swatch */}
                 {b.imageUrl ? (
                   <img
                     src={b.imageUrl}
                     alt=""
                     className="w-12 h-12 rounded-xl flex-shrink-0 object-cover border border-zinc-700"
                   />
                 ) : (
                   <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${gOpt?.color ?? "bg-amber-500"}`} />
                 )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">{b.title}</p>
                    {b.badge && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full truncate max-w-[120px]">{b.badge}</span>}
                  </div>
                  {b.subtitle && <p className="text-xs text-zinc-400 mt-0.5 truncate">{b.subtitle}</p>}
                  <p className="text-xs text-zinc-600 mt-0.5">{b.ctaText && `Buton: ${b.ctaText}`} {b.ctaHref && `→ ${b.ctaHref}`}</p>
                </div>

                {/* Actions */}
                 <div className="flex w-full items-center justify-end gap-1.5 border-t border-zinc-800 pt-2 sm:w-auto sm:flex-shrink-0 sm:border-t-0 sm:pt-0">
                  <button onClick={() => moveOrder(b, -1)} disabled={i === 0} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition-all" title="Yukarı taşı">
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveOrder(b, 1)} disabled={i === sorted.length - 1} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition-all" title="Aşağı taşı">
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(b)} className={`p-2 rounded-lg transition-all ${b.isActive ? "text-emerald-400 hover:bg-emerald-950/30" : "text-zinc-500 hover:bg-zinc-800 hover:text-white"}`} title={b.isActive ? "Pasife al" : "Aktife al"}>
                    {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(b)} className="p-2 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-950/20 transition-all" title="Düzenle">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    disabled={deletingId === b.id}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-all disabled:opacity-50"
                    title="Sil"
                  >
                    {deletingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {banners.length > 0 && (
        <p className="text-xs text-zinc-600 text-center">
          {banners.length} banner kayıtlı · Her bannerı kendi kalem düğmesinden ayrı ayrı düzenleyebilirsiniz.
          Değişiklikler ana sayfada yenilemeden sonra görünür.
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return <ImageIcon className="h-4 w-4" />;
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors ${icon ? "pl-9 pr-3 py-2.5" : "px-3 py-2.5"}`}
        />
      </div>
    </div>
  );
}

function ProductLinkField({
  label,
  value,
  products,
  onSelect,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  products: ProductOption[];
  onSelect: (product: ProductOption) => void;
  onChange: (value: string) => void;
  fallback: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</label>
      <select
        value={value || fallback}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          const product = products.find((item) => `/products/${item.slug}` === nextValue);
          if (product) onSelect(product);
        }}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500"
      >
        <option value={fallback}>Ürün vitrini / tüm ürünler</option>
        {products.map((product) => (
          <option key={product.id} value={`/products/${product.slug}`}>
            {product.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-zinc-600">URL yazmadan seçtiğiniz ürüne yönlenir.</p>
    </div>
  );
}
