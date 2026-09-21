"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Package, Eye, ChevronLeft, ChevronRight, Download, X, Play, Square, ImageOff, Loader2, Tag, Globe, TrendingUp, Camera, DollarSign, FileText, Check, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const FILTERS = [
  { label: "Tümü", key: "all" },
  { label: "⭐ Öne Çıkan", key: "featured" },
  { label: "🔥 İndirimli", key: "sale" },
  { label: "✅ Aktif", key: "active" },
  { label: "❌ Pasif", key: "passive" },
  { label: "📦 Stokta Yok", key: "nostock" },
  { label: "⚠️ Az Stok", key: "lowstock" },
];

const SORT_OPTIONS = [
  { label: "En Yeni", value: "newest" },
  { label: "En Eski", value: "oldest" },
  { label: "İsim A→Z", value: "name-asc" },
  { label: "İsim Z→A", value: "name-desc" },
  { label: "Fiyat ↑", value: "price-asc" },
  { label: "Fiyat ↓", value: "price-desc" },
  { label: "Stok ↑", value: "stock-asc" },
  { label: "Stok ↓", value: "stock-desc" },
];

const BKM_CATEGORIES = [
  { label: "Kırtasiye", value: "kirtasiye" },
  { label: "Roman", value: "roman" },
  { label: "Kitap (Genel)", value: "kitap" },
  { label: "Çocuk Kitapları", value: "cocuk-kitaplari" },
  { label: "Psikoloji & Kişisel Gelişim", value: "psikoloji-ve-kisisel-gelisim" },
  { label: "Bilim & Teknoloji", value: "bilim-ve-teknoloji" },
  { label: "Tarih", value: "tarih" },
  { label: "Hobi & Oyuncak", value: "hobi-ve-oyuncak" },
  { label: "Eğitim & Başvuru", value: "egitim-ve-basvuru-kitaplari" },
  { label: "Spor", value: "spor-kitaplari" },
  { label: "Sanat & Tasarım", value: "sanat-tasarim-mimarlik" },
  { label: "Ekonomi & İşletme", value: "ekonomi-isletme" },
];

interface LogEntry {
  page: number;
  added: number;
  skipped: number;
  notProduct: number;
  slugsFound: number;
}

interface Props {
  products: any[];
  categories: any[];
  brands: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  filter: string;
  brandId: string;
  categoryId: string;
  sort: string;
  stockStats: { outOfStock: number; lowStock: number; onSale: number };
}

export default function AdminProductsClient({
  products: initialProducts,
  categories,
  brands,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
  filter: initialFilter,
  brandId: initialBrandId,
  categoryId: initialCategoryId,
  sort: initialSort,
  stockStats,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [brandId, setBrandId] = useState(initialBrandId);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => { setProducts(initialProducts); }, [initialProducts]);
  useEffect(() => { setSearchInput(initialSearch); }, [initialSearch]);
  useEffect(() => { setBrandId(initialBrandId); }, [initialBrandId]);
  useEffect(() => { setCategoryId(initialCategoryId); }, [initialCategoryId]);
  useEffect(() => { setSort(initialSort); }, [initialSort]);

  const [showBkmPanel, setShowBkmPanel] = useState(false);
  const [bkmCategory, setBkmCategory] = useState("kirtasiye");
  const [bkmPage, setBkmPage] = useState(1);
  const [bkmRunning, setBkmRunning] = useState(false);
  const [bkmLog, setBkmLog] = useState<LogEntry[]>([]);
  const [bkmTotals, setBkmTotals] = useState({ added: 0, skipped: 0 });
  const stopRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [showImgPanel, setShowImgPanel] = useState(false);
  const [imgRunning, setImgRunning] = useState(false);
  const [imgStats, setImgStats] = useState<{ total: number; withImages: number; withoutImages: number } | null>(null);
  const [imgBatchSize, setImgBatchSize] = useState(20);
  const [imgRefreshAll, setImgRefreshAll] = useState(false);
  const [imgResults, setImgResults] = useState<{ found: number; notFound: number; total: number } | null>(null);
  const imgStopRef = useRef(false);

  const [showBarcodePanel, setShowBarcodePanel] = useState(false);
  const [barcodeStats, setBarcodeStats] = useState<{ total: number; withBarcode: number; alreadyTagged: number; pending: number } | null>(null);
  const [barcodeRunning, setBarcodeRunning] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState<{ updated: number; skipped: number; total: number } | null>(null);

  const [showSitemapPanel, setShowSitemapPanel] = useState(false);
  const [sitemapRunning, setSitemapRunning] = useState(false);
  const [sitemapResult, setSitemapResult] = useState<{ sitemapUrl: string; results: Record<string, string>; note: string } | null>(null);

  const [showBulkPricePanel, setShowBulkPricePanel] = useState(false);
  const [bulkPriceRunning, setBulkPriceRunning] = useState(false);
  const [bulkPriceOp, setBulkPriceOp] = useState<"increase" | "decrease" | "add-sale" | "remove-sale">("increase");
  const [bulkPricePct, setBulkPricePct] = useState("10");
  const [bulkPriceScope, setBulkPriceScope] = useState<"all" | "category" | "brand">("all");
  const [bulkPriceScopeId, setBulkPriceScopeId] = useState("");
  const [bulkPriceResult, setBulkPriceResult] = useState<{ updated: number; message: string } | null>(null);

  const [quickModal, setQuickModal] = useState<{ productId: string; productName: string; type: "image" | "price" | "description" } | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickData, setQuickData] = useState<any>(null);
  const [quickExpandDesc, setQuickExpandDesc] = useState<number | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  function navigate(params: { page?: number; search?: string; filter?: string }) {
    const sp = new URLSearchParams();
    const newPage   = params.page   ?? page;
    const newSearch = params.search !== undefined ? params.search : initialSearch;
    const newFilter = params.filter ?? initialFilter;
    if (newPage > 1) sp.set("page", String(newPage));
    if (newSearch) sp.set("search", newSearch);
    if (newFilter !== "all") sp.set("filter", newFilter);
    startTransition(() => {
      router.push(`${pathname}${sp.toString() ? "?" + sp.toString() : ""}`);
    });
  }

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: searchInput, page: 1 });
  }, [searchInput]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Ürün silindi.");
    } catch {
      toast.error("Ürün silinemedi.");
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
      toast.success(!current ? "Ürün aktif edildi." : "Ürün pasife alındı.");
    } catch {
      toast.error("Güncellenemedi.");
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isFeatured: !current } : p));
      toast.success(!current ? "⭐ Öne çıkanlara eklendi." : "Öne çıkanlıdan kaldırıldı.");
    } catch {
      toast.error("Güncellenemedi.");
    }
  };

  const startBkmImport = async () => {
    stopRef.current = false;
    setBkmRunning(true);
    setBkmLog([]);
    setBkmTotals({ added: 0, skipped: 0 });

    let currentPage = bkmPage;
    let totalAdded = 0;
    let totalSkipped = 0;
    let emptyPages = 0;

    while (!stopRef.current) {
      try {
        const res = await fetch("/api/admin/bkm-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: bkmCategory, page: currentPage }),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          toast.error("BKM bağlantı hatası, durduruluyor.");
          break;
        }

        const entry: LogEntry = {
          page: currentPage,
          added: data.stats?.added ?? 0,
          skipped: data.stats?.skipped ?? 0,
          notProduct: data.stats?.notProduct ?? 0,
          slugsFound: data.stats?.slugsFound ?? 0,
        };

        setBkmLog((prev) => [...prev, entry]);
        totalAdded += entry.added;
        totalSkipped += entry.skipped;
        setBkmTotals({ added: totalAdded, skipped: totalSkipped });

        setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        if (entry.slugsFound === 0) {
          emptyPages++;
          if (emptyPages >= 2) {
            toast.success(`${bkmCategory} kategorisi tamamlandı!`);
            break;
          }
        } else {
          emptyPages = 0;
        }

        currentPage++;
        setBkmPage(currentPage);

        await new Promise((r) => setTimeout(r, 300));
      } catch {
        toast.error("Hata oluştu, durduruluyor.");
        break;
      }
    }

    setBkmRunning(false);
    if (totalAdded > 0) {
      toast.success(`${totalAdded} yeni ürün eklendi!`);
      router.refresh();
    }
  };

  const stopBkmImport = () => {
    stopRef.current = true;
  };

  const openBkmPanel = () => {
    setBkmLog([]);
    setBkmPage(1);
    setBkmTotals({ added: 0, skipped: 0 });
    setShowBkmPanel(true);
  };

  const openImgPanel = async () => {
    setImgResults(null);
    setShowImgPanel(true);
    try {
      const res = await fetch("/api/admin/auto-images");
      if (res.ok) setImgStats(await res.json());
    } catch {}
  };

  const runImgBatch = async () => {
    imgStopRef.current = false;
    setImgRunning(true);
    setImgResults(null);
    let totalFound = 0, totalNotFound = 0, totalProcessed = 0;
    const ROUNDS = 5;
    for (let i = 0; i < ROUNDS && !imgStopRef.current; i++) {
      try {
        const res = await fetch("/api/admin/auto-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: imgBatchSize, onlyEmpty: !imgRefreshAll }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error("Hata: " + (data.error ?? "Bilinmeyen")); break; }
        totalFound += data.found ?? 0;
        totalNotFound += data.notFound ?? 0;
        totalProcessed += data.total ?? 0;
        setImgResults({ found: totalFound, notFound: totalNotFound, total: totalProcessed });
        if ((data.total ?? 0) === 0) break;
      } catch { break; }
      await new Promise(r => setTimeout(r, 500));
    }
    setImgRunning(false);
    if (totalFound > 0) {
      toast.success(`${totalFound} ürüne resim eklendi!`);
      const res = await fetch("/api/admin/auto-images");
      if (res.ok) setImgStats(await res.json());
    } else if (totalProcessed === 0 && !imgRefreshAll) {
      toast("Tüm ürünlerin zaten resmi var. \"Resimleri Yenile\" modunu deneyin.", { duration: 5000 });
    } else {
      toast("Bu batch'te resim bulunamadı.");
    }
  };

  const openBarcodePanel = async () => {
    setShowBarcodePanel(true);
    setBarcodeResult(null);
    try {
      const res = await fetch("/api/admin/barcode-to-desc");
      if (res.ok) setBarcodeStats(await res.json());
    } catch {}
  };

  const runBarcodeUpdate = async () => {
    setBarcodeRunning(true);
    try {
      const res = await fetch("/api/admin/barcode-to-desc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) { toast.error("Hata: " + (data.error ?? "Bilinmeyen")); return; }
      setBarcodeResult(data);
      if (data.updated > 0) toast.success(`${data.updated} ürünün açıklamasına barkod eklendi!`);
      else toast("Zaten güncel, eklenecek ürün yok.");
      const stats = await fetch("/api/admin/barcode-to-desc");
      if (stats.ok) setBarcodeStats(await stats.json());
    } catch { toast.error("Bağlantı hatası."); }
    finally { setBarcodeRunning(false); }
  };

  const runSitemapPing = async () => {
    setSitemapRunning(true);
    setSitemapResult(null);
    try {
      const res = await fetch("/api/admin/sitemap-ping", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error("Hata: " + (data.error ?? "Bilinmeyen")); return; }
      setSitemapResult(data);
      toast.success("Google ve Bing'e bildirim gönderildi!");
    } catch { toast.error("Bağlantı hatası."); }
    finally { setSitemapRunning(false); }
  };

  const openQuickEnrich = async (product: any, type: "image" | "price" | "description") => {
    setQuickModal({ productId: product.id, productName: product.name, type });
    setQuickData(null);
    setQuickExpandDesc(null);
    setQuickLoading(true);
    try {
      const res = await fetch("/api/admin/product-enrich/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand?.name ?? null,
          barcode: product.barcode ?? product.sku ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const shortQ = product.name.replace(/\s*[-–—]\s*adet.*$/i, "").trim();
        setQuickData({
          images: [],
          price: null,
          descriptionCandidates: [],
          sources: [],
          error: data.error ?? "Arama başarısız",
          googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(shortQ + " ürün")}&tbm=isch`,
          bingSearchUrl: `https://www.bing.com/images/search?q=${encodeURIComponent(shortQ)}`,
          trendyolUrl: `https://www.trendyol.com/sr?q=${encodeURIComponent(shortQ)}`,
        });
      } else {
        setQuickData(data);
      }
    } catch (err: any) {
      const shortQ = product.name.replace(/\s*[-–—]\s*adet.*$/i, "").trim();
      setQuickData({
        images: [],
        price: null,
        descriptionCandidates: [],
        sources: [],
        error: err.message ?? "Bağlantı hatası",
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(shortQ + " ürün")}&tbm=isch`,
        bingSearchUrl: `https://www.bing.com/images/search?q=${encodeURIComponent(shortQ)}`,
        trendyolUrl: `https://www.trendyol.com/sr?q=${encodeURIComponent(shortQ)}`,
      });
    } finally {
      setQuickLoading(false);
    }
  };

  const applyQuickUpdate = async (update: { images?: string[]; price?: number; description?: string }) => {
    if (!quickModal) return;
    try {
      const res = await fetch(`/api/products/${quickModal.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      setProducts(prev => prev.map(p => {
        if (p.id !== quickModal.productId) return p;
        if (update.images) return { ...p, images: update.images };
        if (update.price !== undefined) return { ...p, price: update.price };
        return p;
      }));
      const label = quickModal.type === "image" ? "Görsel" : quickModal.type === "price" ? "Fiyat" : "Açıklama";
      toast.success(`${label} güncellendi!`);
      setQuickModal(null);
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  };

  const runBulkPriceUpdate = async () => {
    const pct = Number(bulkPricePct);
    if (bulkPriceOp !== "remove-sale" && (isNaN(pct) || pct <= 0 || pct > 99)) {
      toast.error("Yüzde 1–99 arasında olmalı.");
      return;
    }
    const label =
      bulkPriceOp === "increase" ? `%${pct} zam` :
      bulkPriceOp === "decrease" ? `%${pct} indirim (fiyata)` :
      bulkPriceOp === "add-sale" ? `%${pct} indirimli fiyat etiketi` :
      "İndirim etiketini kaldır";
    const scope =
      bulkPriceScope === "all" ? "TÜM aktif ürünlere" :
      bulkPriceScope === "category" ? "seçili kategorideki ürünlere" : "seçili markadaki ürünlere";
    if (!confirm(`"${label}" işlemi ${scope} uygulanacak. Onaylıyor musunuz?`)) return;

    setBulkPriceRunning(true);
    setBulkPriceResult(null);
    try {
      const res = await fetch("/api/admin/bulk-price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: bulkPriceOp,
          percentage: pct,
          scope: bulkPriceScope,
          scopeId: bulkPriceScopeId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error("Hata: " + (data.error ?? "Bilinmeyen")); return; }
      setBulkPriceResult(data);
      toast.success(`${data.updated} ürün güncellendi!`);
      router.refresh();
    } catch { toast.error("Bağlantı hatası."); }
    finally { setBulkPriceRunning(false); }
  };

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6">

      {/* Barcode Modal */}
      {showBarcodePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Barkod → Açıklama Ekle</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Mevcut açıklamalar silinmez, sonuna eklenir</p>
              </div>
              <button onClick={() => setShowBarcodePanel(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {barcodeStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-white">{barcodeStats.withBarcode.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Barkodlu</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-800/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-green-400">{barcodeStats.alreadyTagged.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Zaten Eklendi</p>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-400">{barcodeStats.pending.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Bekliyor</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-zinc-400 leading-relaxed">
                Barkodu veya SKU'su olan tüm ürünlerin açıklamasının sonuna <span className="font-mono text-amber-400">Barkod: XXXXX</span> satırı eklenir.
              </p>
              {barcodeResult && (
                <div className="bg-zinc-800/60 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-zinc-400">Güncellenen:</span><span className="text-green-400 font-bold">{barcodeResult.updated}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-400">Zaten güncel:</span><span className="text-zinc-500 font-bold">{barcodeResult.skipped}</span></div>
                </div>
              )}
              {barcodeRunning && (
                <div className="flex items-center gap-3 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Ürünler güncelleniyor...</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
              <button onClick={() => setShowBarcodePanel(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Kapat</button>
              <button onClick={runBarcodeUpdate} disabled={barcodeRunning}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/20">
                {barcodeRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                {barcodeRunning ? "Çalışıyor..." : "Barkodları Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sitemap Ping Modal */}
      {showSitemapPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Arama Motorlarına Bildir</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Google ve Bing'e sitemap iletilir</p>
              </div>
              <button onClick={() => setShowSitemapPanel(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sitenizin güncel ürün listesi (<span className="font-mono text-amber-400 text-xs">sitemap.xml</span>) Google ve Bing'e gönderilir. Barkodla arama yapan müşteriler sitenizi daha hızlı bulabilir.
              </p>
              {sitemapResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-zinc-800/60 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-blue-400">G</span> Google</span>
                    <span className="text-sm font-bold text-green-400">{sitemapResult.results.google}</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-800/60 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-teal-400">B</span> Bing</span>
                    <span className="text-sm font-bold text-green-400">{sitemapResult.results.bing}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">{sitemapResult.note}</p>
                </div>
              )}
              {sitemapRunning && (
                <div className="flex items-center gap-3 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Google ve Bing'e gönderiliyor...</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
              <button onClick={() => setShowSitemapPanel(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Kapat</button>
              <button onClick={runSitemapPing} disabled={sitemapRunning}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-600/20">
                {sitemapRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {sitemapRunning ? "Gönderiliyor..." : "Bildir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toplu Fiyat Güncelleme Paneli */}
      {showBulkPricePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Toplu Fiyat Güncelleme</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Filtrelenen ürünlere yüzdelik fiyat işlemi uygular</p>
              </div>
              <button onClick={() => { setShowBulkPricePanel(false); setBulkPriceResult(null); }}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* İşlem tipi */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">İşlem</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "increase", label: "📈 Fiyat Artır", desc: "Hem satış hem liste fiyatına zam" },
                    { value: "decrease", label: "📉 Fiyat Düşür", desc: "Satış fiyatını düşür" },
                    { value: "add-sale", label: "🔥 İndirim Ekle", desc: "Eski fiyat göster, yeni fiyat hesapla" },
                    { value: "remove-sale", label: "❌ İndirimi Kaldır", desc: "comparePrice alanını sil" },
                  ].map((op) => (
                    <button
                      key={op.value}
                      onClick={() => setBulkPriceOp(op.value as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bulkPriceOp === op.value
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-600"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{op.label}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{op.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Yüzde */}
              {bulkPriceOp !== "remove-sale" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Yüzde</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={bulkPricePct}
                      onChange={(e) => setBulkPricePct(e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                      placeholder="10"
                    />
                    <span className="text-zinc-400 text-sm font-semibold">%</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[5, 10, 15, 20, 25].map((n) => (
                      <button key={n} onClick={() => setBulkPricePct(String(n))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${bulkPricePct === String(n) ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                        %{n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kapsam */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Kapsam</label>
                <div className="flex gap-2 mb-2">
                  {[
                    { value: "all", label: "Tüm Aktif Ürünler" },
                    { value: "category", label: "Kategori" },
                    { value: "brand", label: "Marka" },
                  ].map((s) => (
                    <button key={s.value} onClick={() => { setBulkPriceScope(s.value as any); setBulkPriceScopeId(""); }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${bulkPriceScope === s.value ? "bg-amber-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {bulkPriceScope === "category" && (
                  <select value={bulkPriceScopeId} onChange={(e) => setBulkPriceScopeId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                    <option value="">— Kategori seçin —</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                {bulkPriceScope === "brand" && (
                  <select value={bulkPriceScopeId} onChange={(e) => setBulkPriceScopeId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                    <option value="">— Marka seçin —</option>
                    {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                )}
              </div>

              {/* Sonuç */}
              {bulkPriceResult && (
                <div className="bg-green-900/20 border border-green-800/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl font-black text-green-400">{bulkPriceResult.updated.toLocaleString("tr-TR")}</span>
                  <p className="text-sm text-zinc-300">ürün güncellendi.</p>
                </div>
              )}

              {bulkPriceRunning && (
                <div className="flex items-center gap-3 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Fiyatlar güncelleniyor, lütfen bekleyin...</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
              <button onClick={() => { setShowBulkPricePanel(false); setBulkPriceResult(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Kapat
              </button>
              <button onClick={runBulkPriceUpdate} disabled={bulkPriceRunning || (bulkPriceScope !== "all" && !bulkPriceScopeId)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/20">
                {bulkPriceRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {bulkPriceRunning ? "Uygulanıyor..." : "Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Images Modal */}
      {showImgPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Otomatik Resim Çek</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Trendyol/N11'den ürün resimlerini otomatik çeker</p>
              </div>
              <button onClick={() => { imgStopRef.current = true; setShowImgPanel(false); }}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {imgStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-white">{imgStats.total.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Toplam</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-800/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-green-400">{imgStats.withImages.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Resimli</p>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-800/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-400">{imgStats.withoutImages.toLocaleString("tr-TR")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Resimsiz</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Batch Boyutu (her çalışmada)</label>
                <select value={imgBatchSize} onChange={e => setImgBatchSize(Number(e.target.value))} disabled={imgRunning}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50">
                  <option value={10}>10 ürün</option>
                  <option value={20}>20 ürün</option>
                  <option value={30}>30 ürün</option>
                  <option value={50}>50 ürün</option>
                </select>
                <p className="text-zinc-500 text-xs mt-1.5">Her batch 5 tur çalışır → toplamda {imgBatchSize * 5} ürün</p>
              </div>

              <button
                onClick={() => setImgRefreshAll(v => !v)}
                disabled={imgRunning}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  imgRefreshAll
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                } disabled:opacity-50`}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">{imgRefreshAll ? "🔄 Resimleri Yenile modu AÇIK" : "Sadece resimsiz ürünler"}</p>
                  <p className="text-xs mt-0.5 opacity-70">
                    {imgRefreshAll
                      ? "Mevcut resimleri de değiştirerek yeni resim arar"
                      : "Hiç resmi olmayan ürünleri işler (varsayılan)"}
                  </p>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${imgRefreshAll ? "bg-amber-500" : "bg-zinc-600"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-all ${imgRefreshAll ? "ml-5.5" : "ml-0.5"}`} />
                </div>
              </button>

              {imgResults && (
                <div className="bg-zinc-800/60 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">İşlenen:</span>
                    <span className="text-white font-bold">{imgResults.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Resim bulundu:</span>
                    <span className="text-green-400 font-bold">{imgResults.found}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Resim bulunamadı:</span>
                    <span className="text-zinc-500 font-bold">{imgResults.notFound}</span>
                  </div>
                </div>
              )}

              {imgRunning && (
                <div className="flex items-center gap-3 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Trendyol/N11'de aranıyor... Lütfen bekleyin.</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
              {imgRunning ? (
                <button onClick={() => { imgStopRef.current = true; }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  <Square className="w-4 h-4" /> Durdur
                </button>
              ) : (
                <button onClick={runImgBatch}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-violet-600/20">
                  <Play className="w-4 h-4" /> {imgResults ? "Devam Et" : "Resimleri Çek"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BKM Import Modal */}
      {showBkmPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">BKM Kitap'tan Ürün Çek</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Mevcut ürünler tekrar eklenmez</p>
              </div>
              <button
                onClick={() => { stopRef.current = true; setShowBkmPanel(false); }}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kategori Seçimi */}
            <div className="px-6 py-4 border-b border-zinc-800">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Kategori
              </label>
              <select
                value={bkmCategory}
                onChange={(e) => { setBkmCategory(e.target.value); setBkmPage(1); setBkmLog([]); setBkmTotals({ added: 0, skipped: 0 }); }}
                disabled={bkmRunning}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                {BKM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Log Alanı */}
            {bkmLog.length > 0 && (
              <div className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">İlerleme</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-400 font-bold">+{bkmTotals.added} eklendi</span>
                    <span className="text-zinc-500">{bkmTotals.skipped} mevcut</span>
                  </div>
                </div>
                <div className="bg-zinc-950 rounded-xl p-3 h-40 overflow-y-auto font-mono text-xs space-y-1">
                  {bkmLog.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-zinc-600">Sayfa {entry.page}</span>
                      <span className="text-zinc-500">|</span>
                      <span className="text-zinc-400">{entry.slugsFound} bulundu</span>
                      <span className="text-zinc-500">|</span>
                      {entry.added > 0
                        ? <span className="text-green-400">+{entry.added} eklendi</span>
                        : <span className="text-zinc-600">yeni yok</span>
                      }
                      {entry.skipped > 0 && <span className="text-zinc-600">({entry.skipped} mevcut)</span>}
                    </div>
                  ))}
                  {bkmRunning && (
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="animate-pulse">●</span>
                      <span>Sayfa {bkmPage} çekiliyor...</span>
                    </div>
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {bkmRunning ? (
                  <span className="text-amber-400">Sayfa {bkmPage} işleniyor...</span>
                ) : bkmLog.length > 0 ? (
                  <span className="text-green-400">Tamamlandı — {bkmTotals.added} ürün eklendi</span>
                ) : (
                  <span>Her butona basışta bir sonraki batch çekilir</span>
                )}
              </div>
              <div className="flex gap-2">
                {bkmRunning ? (
                  <button
                    onClick={stopBkmImport}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Square className="w-4 h-4" /> Durdur
                  </button>
                ) : (
                  <button
                    onClick={startBkmImport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Play className="w-4 h-4" /> {bkmLog.length > 0 ? "Devam Et" : "Başlat"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Enrich Modal */}
      {quickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {quickModal.type === "image" && "Görsel Güncelle"}
                  {quickModal.type === "price" && "Fiyat Güncelle"}
                  {quickModal.type === "description" && "Açıklama Güncelle"}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{quickModal.productName}</p>
              </div>
              <div className="flex items-center gap-2">
                {quickData?.googleSearchUrl && (
                  <a href={quickData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700">
                    <Globe className="w-3.5 h-3.5" /> Google
                  </a>
                )}
                <button onClick={() => setQuickModal(null)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              {quickLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="text-zinc-400 text-sm">İnternette aranıyor...</p>
                </div>
              )}

              {!quickLoading && quickData && (
                <>
                  {/* HATA DURUMU */}
                  {quickData.error && (
                    <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 mb-4 space-y-3">
                      <p className="text-sm text-red-400 font-semibold">⚠️ Otomatik arama başarısız</p>
                      <p className="text-xs text-zinc-400">{quickData.error}</p>
                      <p className="text-xs text-zinc-500">Ürünü manuel olarak aşağıdaki sitelerde arayabilirsiniz:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickData.googleSearchUrl && (
                          <a href={quickData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Google Görseller
                          </a>
                        )}
                        {quickData.trendyolUrl && (
                          <a href={quickData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Trendyol
                          </a>
                        )}
                        {quickData.bingSearchUrl && (
                          <a href={quickData.bingSearchUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Bing
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IMAGE */}
                  {quickModal.type === "image" && (
                    <div className="space-y-4">
                      {quickData.sources?.length > 0 && (
                        <p className="text-xs text-zinc-500">Kaynak: {quickData.sources.join(", ")}</p>
                      )}
                      {(quickData.images ?? []).length === 0 ? (
                        !quickData.error && (
                          <div className="text-center py-6 space-y-3">
                            <p className="text-zinc-400 text-sm">Otomatik görsel bulunamadı.</p>
                            <p className="text-zinc-500 text-xs">Ürünü manuel olarak aşağıdaki sitelerde arayıp görseli kopyalayabilirsiniz:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {quickData.googleSearchUrl && (
                                <a href={quickData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Google Görseller
                                </a>
                              )}
                              {quickData.trendyolUrl && (
                                <a href={quickData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Trendyol
                                </a>
                              )}
                              {quickData.bingSearchUrl && (
                                <a href={quickData.bingSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Bing
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                          {(quickData.images ?? []).slice(0, 20).map((url: string, i: number) => (
                            <button key={i} onClick={() => applyQuickUpdate({ images: [url] })}
                              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-zinc-700 hover:border-amber-500 transition-all">
                              <img src={url} alt="" className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PRICE */}
                  {quickModal.type === "price" && (
                    <div className="space-y-3">
                      {quickData.price == null ? (
                        !quickData.error && (
                          <div className="text-center py-6 space-y-3">
                            <p className="text-zinc-400 text-sm">Otomatik fiyat bulunamadı.</p>
                            <p className="text-zinc-500 text-xs">Aşağıdaki sitelerden fiyatı manuel kontrol edebilirsiniz:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {quickData.trendyolUrl && (
                                <a href={quickData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Trendyol
                                </a>
                              )}
                              {quickData.bingSearchUrl && (
                                <a href={quickData.bingSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Bing
                                </a>
                              )}
                              {quickData.googleSearchUrl && (
                                <a href={quickData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Google
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        <button onClick={() => applyQuickUpdate({ price: quickData.price })}
                          className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500 rounded-xl px-5 py-4 transition-all group">
                          <div>
                            <p className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                              ₺{Number(quickData.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">Kaynak: {(quickData.sources ?? []).join(", ") || "—"}</p>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 group-hover:text-amber-400 transition-colors">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-semibold">Güncelle</span>
                          </div>
                        </button>
                      )}
                      {quickData.trendyolUrl && (
                        <a href={quickData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors mt-2">
                          <Globe className="w-4 h-4" /> Trendyol'da kontrol et
                        </a>
                      )}
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  {quickModal.type === "description" && (
                    <div className="space-y-3">
                      {(quickData.descriptionCandidates ?? []).length === 0 ? (
                        !quickData.error && (
                          <div className="text-center py-6 space-y-3">
                            <p className="text-zinc-400 text-sm">Otomatik açıklama bulunamadı.</p>
                            <p className="text-zinc-500 text-xs">Ürünü aşağıdaki sitelerde arayarak açıklamasını kopyalayabilirsiniz:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {quickData.trendyolUrl && (
                                <a href={quickData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Trendyol
                                </a>
                              )}
                              {quickData.bingSearchUrl && (
                                <a href={quickData.bingSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Bing
                                </a>
                              )}
                              {quickData.googleSearchUrl && (
                                <a href={quickData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Globe className="w-3.5 h-3.5" /> Google
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        (quickData.descriptionCandidates ?? []).map((c: { text: string; source: string }, i: number) => (
                          <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{c.source}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setQuickExpandDesc(quickExpandDesc === i ? null : i)}
                                  className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                                  {quickExpandDesc === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button onClick={() => applyQuickUpdate({ description: c.text })}
                                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                                  <Check className="w-3.5 h-3.5" /> Güncelle
                                </button>
                              </div>
                            </div>
                            <div className={`px-4 py-3 text-sm text-zinc-300 leading-relaxed ${quickExpandDesc === i ? "" : "line-clamp-3"}`}>
                              {c.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stok Özeti */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Toplam Ürün", value: totalCount, color: "text-zinc-100", bg: "bg-zinc-800/60", filter: "all" },
          { label: "🔥 İndirimli", value: stockStats.onSale, color: "text-amber-400", bg: "bg-amber-900/20 border border-amber-800/30", filter: "sale" },
          { label: "⚠️ Az Stok (1–5)", value: stockStats.lowStock, color: "text-orange-400", bg: "bg-orange-900/20 border border-orange-800/30", filter: "lowstock" },
          { label: "📦 Stokta Yok", value: stockStats.outOfStock, color: "text-red-400", bg: "bg-red-900/20 border border-red-800/30", filter: "nostock" },
        ].map((stat) => (
          <button
            key={stat.filter}
            onClick={() => navigate({ filter: stat.filter, page: 1 })}
            className={`${stat.bg} rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg`}
          >
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString("tr-TR")}</p>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Ürünler</h1>
          <p className="text-zinc-400 mt-1">
            {totalCount.toLocaleString("tr-TR")} ürün
            {totalCount > 0 && ` · gösterilen: ${start}–${end}`}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={openImgPanel}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-600/20"
          >
            <ImageOff className="w-4 h-4" /> Resim Çek
          </button>
          <button
            onClick={openBkmPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" /> BKM'den Çek
          </button>
          <button
            onClick={openBarcodePanel}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-amber-600/20"
          >
            <Tag className="w-4 h-4" /> Barkod Ekle
          </button>
          <button
            onClick={() => { setShowBulkPricePanel(true); setBulkPriceResult(null); }}
            className="flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-rose-700/20"
          >
            <TrendingUp className="w-4 h-4" /> Toplu Fiyat
          </button>
          <button
            onClick={() => { setShowSitemapPanel(true); setSitemapResult(null); }}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-green-700/20"
          >
            <Globe className="w-4 h-4" /> Google/Bing'e Bildir
          </button>
          <Link
            href="/admin/products/bulk-edit"
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-teal-700/20"
          >
            <Edit2 className="w-4 h-4" /> Toplu Düzenle
          </Link>
          <Link
            href="/admin/products/bulk-import"
            className="flex items-center gap-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Toplu İçe Aktar
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Arama + Filtre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ürün adı veya barkod ara..."
              className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl text-sm font-bold transition-colors"
          >
            Ara
          </button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => navigate({ filter: f.key, page: 1 })}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                initialFilter === f.key
                  ? "bg-amber-500 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className={`bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">Ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  {["Ürün", "Fiyat", "Stok", "Kategori", "Durum", "Öne Çıkan", "İşlem"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200 truncate max-w-[180px]">{product.name}</p>
                          {product.sku && <p className="text-xs text-zinc-500 mt-0.5">{product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white">₺{Number(product.price).toLocaleString("tr-TR")}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-red-400 line-through">₺{Number(product.comparePrice).toLocaleString("tr-TR")}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        product.stock === 0
                          ? "bg-red-900/40 text-red-400"
                          : product.stock <= 5
                          ? "bg-amber-900/40 text-amber-400"
                          : "bg-green-900/40 text-green-400"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400 text-xs">{product.category?.name ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActive(product.id, product.isActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          product.isActive
                            ? "bg-green-900/40 text-green-400 hover:bg-green-900/60"
                            : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                        }`}
                      >
                        {product.isActive ? "✓ Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleFeatured(product.id, product.isFeatured)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          product.isFeatured
                            ? "bg-amber-900/40 text-amber-400 hover:bg-amber-900/60"
                            : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                        }`}
                      >
                        {product.isFeatured ? "⭐ Evet" : "— Hayır"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-amber-400"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-zinc-700 mx-0.5" />
                        <button
                          onClick={() => openQuickEnrich(product, "image")}
                          className="p-1.5 bg-violet-800/40 hover:bg-violet-700/60 rounded-lg transition-colors text-violet-300 hover:text-violet-100"
                          title="Görsel çek"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openQuickEnrich(product, "price")}
                          className="p-1.5 bg-green-800/40 hover:bg-green-700/60 rounded-lg transition-colors text-green-300 hover:text-green-100"
                          title="Fiyat çek"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openQuickEnrich(product, "description")}
                          className="p-1.5 bg-blue-800/40 hover:bg-blue-700/60 rounded-lg transition-colors text-blue-300 hover:text-blue-100"
                          title="Açıklama çek"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-zinc-400">
            Sayfa <span className="text-white font-semibold">{page}</span> / {totalPages}
            {" "}· Toplam <span className="text-white font-semibold">{totalCount.toLocaleString("tr-TR")}</span> ürün
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate({ page: 1 })}
              disabled={page <= 1 || isPending}
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              İlk
            </button>
            <button
              onClick={() => navigate({ page: page - 1 })}
              disabled={page <= 1 || isPending}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => navigate({ page: p })}
                  disabled={isPending}
                  className={`w-9 h-9 text-xs rounded-lg font-semibold transition-colors ${
                    p === page
                      ? "bg-amber-500 text-zinc-900"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => navigate({ page: page + 1 })}
              disabled={page >= totalPages || isPending}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate({ page: totalPages })}
              disabled={page >= totalPages || isPending}
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Son
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
