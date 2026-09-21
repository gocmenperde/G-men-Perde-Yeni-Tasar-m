"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Search, ImageIcon, Check, X, Edit2, Plus, Trash2, Loader2,
  ChevronDown, ChevronUp, Play, StopCircle, RefreshCw,
  CheckCircle, AlertCircle, SkipForward, ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  images: string[];
  category: { name: string } | null;
  brand: { name: string } | null;
}

interface BulkStats {
  total: number;
  withImages: number;
  withoutImages: number;
}

interface BulkResult {
  id: string;
  name: string;
  status: "fixed" | "skipped" | "error";
  imageCount: number;
}

type BulkState = "idle" | "running" | "done" | "stopped";

export default function ImageManagerClient() {
  const [tab, setTab] = useState<"suspicious" | "bulk" | "search">("suspicious");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Suspicious images tab state
  const [suspProducts, setSuspProducts] = useState<Product[]>([]);
  const [suspTotal, setSuspTotal] = useState(0);
  const [suspPage, setSuspPage] = useState(1);
  const [suspLoading, setSuspLoading] = useState(false);
  const [suspSelected, setSuspSelected] = useState<Set<string>>(new Set());
  const [suspDeleting, setSuspDeleting] = useState(false);

  const [stats, setStats] = useState<BulkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [bulkState, setBulkState] = useState<BulkState>("idle");
  const [forceAll, setForceAll] = useState(true);
  const [processed, setProcessed] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [errors, setErrors] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [log, setLog] = useState<BulkResult[]>([]);
  const stopRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch("/api/admin/bulk-fix-images");
      const d = await r.json();
      setStats(d);
    } catch {
      toast.error("İstatistikler yüklenemedi");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadSuspicious = useCallback(async (page = 1) => {
    setSuspLoading(true);
    try {
      const r = await fetch(`/api/admin/images/suspicious?page=${page}`);
      const d = await r.json();
      setSuspProducts(d.data ?? []);
      setSuspTotal(d.total ?? 0);
      setSuspPage(page);
      setSuspSelected(new Set());
    } catch {
      toast.error("Bozuk resimler yüklenemedi");
    } finally {
      setSuspLoading(false);
    }
  }, []);

  const deleteSelected = async () => {
    if (suspSelected.size === 0) return;
    setSuspDeleting(true);
    try {
      const r = await fetch("/api/admin/images/suspicious", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...suspSelected] }),
      });
      const d = await r.json();
      toast.success(`${d.updated} üründen bozuk resim kaldırıldı`);
      loadSuspicious(suspPage);
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setSuspDeleting(false);
    }
  };

  useEffect(() => {
    if (tab === "bulk") loadStats();
    if (tab === "suspicious") loadSuspicious(1);
  }, [tab, loadStats, loadSuspicious]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log.length]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/admin/images?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setResults(json.data ?? []);
    } catch {
      toast.error("Arama başarısız");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); search(query); };
  const updateProduct = (id: string, images: string[]) =>
    setResults(prev => prev.map(p => p.id === id ? { ...p, images } : p));

  const startBulk = async () => {
    stopRef.current = false;
    setBulkState("running");
    setProcessed(0); setFixed(0); setSkipped(0); setErrors(0);
    setLog([]);

    let offset = 0;
    const BATCH = 20;

    while (true) {
      if (stopRef.current) { setBulkState("stopped"); break; }

      try {
        const r = await fetch("/api/admin/bulk-fix-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offset, limit: BATCH, forceAll }),
        });
        if (!r.ok) { toast.error("Sunucu hatası"); setBulkState("stopped"); break; }

        const data = await r.json() as {
          processed: number; fixed: number; skipped: number;
          results: BulkResult[]; done: boolean; nextOffset: number;
        };

        setProcessed(prev => prev + data.processed);
        setFixed(prev => prev + data.fixed);
        setSkipped(prev => prev + data.skipped);
        setErrors(prev => prev + (data.results.filter(r => r.status === "error").length));
        setLog(prev => [...prev, ...data.results].slice(-200));
        setCurrentOffset(data.nextOffset);

        if (data.done || data.processed === 0 || stopRef.current) {
          setBulkState("done");
          loadStats();
          break;
        }

        offset = data.nextOffset;
        await new Promise(r => setTimeout(r, 400));
      } catch {
        toast.error("Bağlantı hatası, durduruluyor");
        setBulkState("stopped");
        break;
      }
    }
  };

  const stopBulk = () => { stopRef.current = true; };

  const resetBulk = () => {
    setBulkState("idle");
    setProcessed(0); setFixed(0); setSkipped(0); setErrors(0);
    setLog([]); setCurrentOffset(0);
    loadStats();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Görsel Yönetimi</h1>
        <p className="text-zinc-400 text-sm mt-1">Tekli arama ile düzenleyin veya tüm ürünleri toplu olarak düzeltin.</p>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit flex-wrap">
        <button
          onClick={() => setTab("suspicious")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "suspicious" ? "bg-red-500 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Bozuk Resimler
          {suspTotal > 0 && <span className="bg-red-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{suspTotal}</span>}
        </button>
        <button
          onClick={() => setTab("bulk")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "bulk" ? "bg-amber-500 text-zinc-900" : "text-zinc-400 hover:text-white"}`}
        >
          Toplu Resim Düzelt
        </button>
        <button
          onClick={() => setTab("search")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === "search" ? "bg-amber-500 text-zinc-900" : "text-zinc-400 hover:text-white"}`}
        >
          Tekli Arama
        </button>
      </div>

      {tab === "suspicious" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-zinc-300 text-sm">
                Portre formatlı Trendyol CDN resimleri — çoğunlukla kıyafet/moda fotoğrafları.
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Toplamda <strong className="text-white">{suspTotal}</strong> ürün bulundu. Seçip silebilirsiniz.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {suspSelected.size > 0 && (
                <button
                  onClick={deleteSelected}
                  disabled={suspDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {suspDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {suspSelected.size} üründen resmi sil
                </button>
              )}
              <button
                onClick={() => {
                  if (suspSelected.size === suspProducts.length) setSuspSelected(new Set());
                  else setSuspSelected(new Set(suspProducts.map(p => p.id)));
                }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors border border-zinc-700"
              >
                {suspSelected.size === suspProducts.length ? "Seçimi Kaldır" : "Tümünü Seç"}
              </button>
              <button
                onClick={() => loadSuspicious(suspPage)}
                disabled={suspLoading}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl border border-zinc-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${suspLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {suspLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-zinc-800" />
                  <div className="p-2 space-y-1">
                    <div className="h-2.5 bg-zinc-700 rounded w-3/4" />
                    <div className="h-2 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : suspProducts.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-500 opacity-60" />
              <p className="text-white font-semibold text-lg">Bozuk resim bulunamadı!</p>
              <p className="text-zinc-500 text-sm mt-1">Tüm ürünlerin resimleri temiz görünüyor.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {suspProducts.map(p => {
                  const selected = suspSelected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSuspSelected(prev => {
                          const next = new Set(prev);
                          if (next.has(p.id)) next.delete(p.id);
                          else next.add(p.id);
                          return next;
                        });
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 text-left transition-all duration-150 group ${
                        selected
                          ? "border-red-500 shadow-lg shadow-red-900/30"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      {/* Selection badge */}
                      <div className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? "bg-red-500 border-red-400" : "bg-zinc-900/80 border-zinc-600 group-hover:border-zinc-400"
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-zinc-600" />
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-zinc-900">
                        <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">{p.name}</p>
                        {p.brand && <p className="text-amber-500 text-[10px] font-bold mt-0.5 truncate">{p.brand.name}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {suspTotal > 48 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  {suspPage > 1 && (
                    <button onClick={() => loadSuspicious(suspPage - 1)} className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
                      ← Önceki
                    </button>
                  )}
                  <span className="text-zinc-500 text-sm">Sayfa {suspPage} / {Math.ceil(suspTotal / 48)}</span>
                  {suspPage < Math.ceil(suspTotal / 48) && (
                    <button onClick={() => loadSuspicious(suspPage + 1)} className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
                      Sonraki →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "bulk" && (
        <div className="space-y-5">
          {statsLoading ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
            </div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Toplam Ürün" value={stats.total} />
              <StatCard label="Resmı Olan" value={stats.withImages} color="green" />
              <StatCard label="Resmı Eksik" value={stats.withoutImages} color="amber" />
            </div>
          ) : null}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-semibold">Toplu Resim Düzeltici</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Tüm ürünleri sırayla tarar. Her ürün için önce <strong className="text-zinc-300">barkod</strong> ile,
                ardından <strong className="text-zinc-300">ürün adı + marka</strong> ile Trendyol ve N11'den resim arar.
                Aşağıdaki toggle ile mevcut resimleri de değiştirip değiştirmeyeceğinizi seçin.
              </p>
            </div>

            {bulkState === "idle" && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setForceAll(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${forceAll ? "bg-amber-500" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${forceAll ? "translate-x-5" : ""}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Mevcut resimleri de değiştir</p>
                    <p className="text-zinc-500 text-xs">
                      {forceAll
                        ? "Resimleri olan ürünler dahil hepsi işlenecek (alakasız resimler için gerekli)"
                        : "Yalnızca resmi eksik/boş olan ürünler işlenecek"}
                    </p>
                  </div>
                </label>
                <button
                  onClick={startBulk}
                  className="flex items-center gap-2.5 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {forceAll ? "Tüm Resimleri Yenile" : "Eksik Resimleri Tamamla"}
                </button>
              </div>
            )}

            {bulkState === "running" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İşleniyor… ({processed} ürün tamamlandı)
                  </div>
                  <button
                    onClick={stopBulk}
                    className="flex items-center gap-2 px-4 py-2 bg-red-950 border border-red-900 text-red-400 rounded-lg text-sm hover:bg-red-900 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" /> Durdur
                  </button>
                </div>
                <ProgressBars processed={processed} fixed={fixed} skipped={skipped} errors={errors} total={stats?.total} />
              </div>
            )}

            {(bulkState === "done" || bulkState === "stopped") && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 text-sm font-medium ${bulkState === "done" ? "text-green-400" : "text-yellow-400"}`}>
                  <CheckCircle className="w-4 h-4" />
                  {bulkState === "done" ? "Tamamlandı!" : "Durduruldu"} — {fixed} ürün güncellendi, {skipped} atlandı
                </div>
                <ProgressBars processed={processed} fixed={fixed} skipped={skipped} errors={errors} total={stats?.total} />
                <button
                  onClick={resetBulk}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors border border-zinc-700"
                >
                  <RefreshCw className="w-4 h-4" /> Sıfırla
                </button>
              </div>
            )}
          </div>

          {log.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">İşlem Günlüğü (son {log.length})</p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
                {log.map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 px-2 py-1 rounded ${
                    item.status === "fixed" ? "text-green-400" :
                    item.status === "error" ? "text-red-400" : "text-zinc-600"
                  }`}>
                    {item.status === "fixed" ? <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> :
                     item.status === "error" ? <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> :
                     <SkipForward className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                    <span className="truncate flex-1">{item.name}</span>
                    {item.status === "fixed" && <span className="flex-shrink-0">{item.imageCount} resim</span>}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "search" && (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ürün adı, SKU veya barkod..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-semibold rounded-xl transition-colors text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Ara
            </button>
          </form>

          {searched && !loading && results.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Eşleşen ürün bulunamadı</p>
            </div>
          )}

          {!searched && (
            <div className="text-center py-16 text-zinc-600">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Aramak istediğiniz ürünü yukarıya yazın</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">{results.length} ürün bulundu</p>
              {results.map(product => (
                <ProductImageCard key={product.id} product={product} onUpdate={updateProduct} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: "green" | "amber" }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-white"}`}>
        {value.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}

function ProgressBars({ processed, fixed, skipped, errors, total }: {
  processed: number; fixed: number; skipped: number; errors: number; total?: number;
}) {
  const pct = total && total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  return (
    <div className="space-y-2">
      {total && (
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>İlerleme</span><span>{pct}% ({processed}/{total})</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <div className="flex gap-4 text-sm">
        <span className="text-green-400">✓ {fixed} düzeltildi</span>
        <span className="text-zinc-500">→ {skipped} atlandı</span>
        {errors > 0 && <span className="text-red-400">✗ {errors} hata</span>}
      </div>
    </div>
  );
}

function ProductImageCard({ product, onUpdate }: { product: Product; onUpdate: (id: string, images: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [images, setImages] = useState<string[]>(product.images.length > 0 ? product.images : [""]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const dirty = JSON.stringify(images.filter(Boolean)) !== JSON.stringify(product.images);

  const save = async () => {
    const clean = images.filter(u => u.trim());
    if (clean.length === 0) { toast.error("En az bir görsel URL'si giriniz"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, images: clean }),
      });
      if (!res.ok) throw new Error();
      onUpdate(product.id, clean);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Görsel güncellendi");
    } catch { toast.error("Güncelleme başarısız"); }
    finally { setSaving(false); }
  };

  const autoFix = async () => {
    setAutoLoading(true);
    try {
      const r = await fetch("/api/admin/fix-missing-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const d = await r.json();
      if (d.saved && d.imageCount > 0) {
        toast.success(`${d.imageCount} resim bulundu`);
        const updated = await fetch(`/api/admin/images?q=${encodeURIComponent(product.name)}`);
        const ud = await updated.json();
        const found = (ud.data ?? []).find((p: Product) => p.id === product.id);
        if (found) { onUpdate(product.id, found.images); setImages(found.images); }
      } else {
        toast("Resim bulunamadı", { icon: "⚠️" });
      }
    } catch { toast.error("Otomatik arama başarısız"); }
    finally { setAutoLoading(false); }
  };

  const addRow = () => setImages(prev => [...prev, ""]);
  const removeRow = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));
  const setRow = (i: number, val: string) => setImages(prev => prev.map((v, idx) => idx === i ? val : v));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <div className="w-14 h-14 rounded-lg bg-zinc-800 flex-shrink-0 relative overflow-hidden border border-zinc-700">
          {product.images[0] && !imgErrors[-1] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" unoptimized onError={() => setImgErrors(e => ({ ...e, [-1]: true }))} />
          ) : (
            <ImageIcon className="w-6 h-6 text-zinc-600 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{product.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {product.category && <span className="text-xs text-zinc-500">{product.category.name}</span>}
            {product.brand && <span className="text-xs text-zinc-500">• {product.brand.name}</span>}
            {product.barcode && <span className="text-xs text-zinc-600">Barkod: {product.barcode}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-zinc-500">{product.images.length} görsel</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="w-20 h-20 rounded-lg bg-zinc-800 border border-zinc-700 relative overflow-hidden flex-shrink-0">
                  {url && !imgErrors[i] ? (
                    <Image src={url} alt="" fill className="object-contain p-1" unoptimized onError={() => setImgErrors(e => ({ ...e, [i]: true }))} />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-600 absolute inset-0 m-auto" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Görsel URL'leri</p>
              <button
                onClick={autoFix}
                disabled={autoLoading}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors"
              >
                {autoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Otomatik Bul
              </button>
            </div>
            {images.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={url}
                  onChange={e => { setRow(i, e.target.value); setImgErrors(er => ({ ...er, [i]: false })); }}
                  placeholder="https://..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <button onClick={() => removeRow(i)} disabled={images.length === 1} className="p-2 text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-zinc-800" title="Sil">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addRow} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-amber-400 transition-colors py-1">
              <Plus className="w-3.5 h-3.5" /> URL ekle
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <button onClick={() => { setImages(product.images.length > 0 ? product.images : [""]); setImgErrors({}); }} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-3.5 h-3.5" /> İptal
            </button>
            <button onClick={save} disabled={saving || !dirty} className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-semibold rounded-lg transition-colors text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {saved ? "Kaydedildi" : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
