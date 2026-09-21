"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Package, TrendingUp, AlertCircle, CheckCircle, Loader2, ChevronDown, DatabaseZap } from "lucide-react";
import toast from "react-hot-toast";

interface Stats {
  total: number;
  bkmCount: number;
}

interface RestoreStats {
  total: number;
  bkmCount: number;
  totalSlugs: number;
}

interface SyncStats {
  priceUpdated?: number;
  stockUpdated?: number;
  notFound?: number;
  errors?: number;
  total?: number;
}

interface ImportResult {
  ok: boolean;
  hasMore: boolean;
  nextPage: number;
  stats: {
    added: number;
    skipped: number;
    notProduct: number;
    slugsFound: number;
    errors: number;
  };
}

const BKM_CATEGORIES = [
  { value: "kirtasiye", label: "Kırtasiye" },
  { value: "okul-gerecleri", label: "Okul Gereçleri" },
  { value: "kalem", label: "Kalemler" },
  { value: "defter-ajanda", label: "Defter & Ajanda" },
  { value: "boya-resim", label: "Boya & Resim" },
  { value: "sanat-malzemeleri", label: "Sanat Malzemeleri" },
  { value: "hobi-el-sanatlari", label: "Hobi & El Sanatları" },
  { value: "oyun-oyuncak", label: "Oyun & Oyuncak" },
  { value: "puzzle", label: "Puzzle" },
  { value: "ofis-gerecleri", label: "Ofis Gereçleri" },
  { value: "cocuk-kitaplari", label: "Çocuk Kitapları" },
];

export default function BkmImportClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("kirtasiye");
  const [totalAdded, setTotalAdded] = useState(0);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncStats | null>(null);

  const [restoring, setRestoring] = useState(false);
  const [restoreStats, setRestoreStats] = useState<RestoreStats | null>(null);
  const [restoreLog, setRestoreLog] = useState<string[]>([]);
  const [restoreTotal, setRestoreTotal] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/bkm-import");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRestoreStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bkm-restore");
      if (res.ok) setRestoreStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRestoreStats();
  }, [fetchStats, fetchRestoreStats]);

  const addLog = (msg: string) => setImportLog((prev) => [...prev.slice(-49), msg]);
  const addRestoreLog = (msg: string) => setRestoreLog((prev) => [...prev.slice(-49), msg]);

  const importBatch = async () => {
    if (importing) return;
    setImporting(true);
    setSyncResult(null);
    let page = currentPage;
    let added = totalAdded;

    addLog(`▶ Çekme başlatıldı — Kategori: ${selectedCategory}, Sayfa: ${page}`);

    try {
      const res = await fetch("/api/admin/bkm-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, page }),
      });
      const data: ImportResult = await res.json();

      if (!res.ok) {
        addLog(`✗ Hata: ${(data as any).error || "Bilinmeyen hata"}`);
        toast.error("İçe aktarma başarısız");
        return;
      }

      added += data.stats.added;
      setTotalAdded(added);
      setCurrentPage(data.nextPage);

      addLog(
        `✓ Sayfa ${page} — ${data.stats.added} yeni ürün eklendi, ${data.stats.skipped} zaten vardı, ${data.stats.slugsFound} link bulundu`
      );

      if (data.stats.added === 0 && data.stats.slugsFound === 0) {
        addLog("⚠ Bu sayfada ürün bulunamadı. Kategori değiştirmeyi deneyin.");
      }

      toast.success(`${data.stats.added} ürün eklendi!`);
      fetchStats();
      fetchRestoreStats();
    } catch {
      addLog("✗ Ağ hatası oluştu");
      toast.error("Bağlantı hatası");
    } finally {
      setImporting(false);
    }
  };

  const syncPrices = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    addLog("▶ Fiyat & stok güncelleme başlatıldı...");

    try {
      const res = await fetch("/api/admin/sync-prices", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        addLog(`✗ Hata: ${data.error || "Bilinmeyen hata"}`);
        toast.error("Güncelleme başarısız");
        return;
      }

      setSyncResult(data.stats);
      addLog(
        `✓ Güncelleme tamamlandı — ${data.stats.priceUpdated} fiyat, ${data.stats.stockUpdated} stok değişti, ${data.stats.total} ürün kontrol edildi (${data.duration})`
      );
      toast.success("Fiyat & stok güncellendi!");
      fetchStats();
    } catch {
      addLog("✗ Ağ hatası oluştu");
      toast.error("Bağlantı hatası");
    } finally {
      setSyncing(false);
    }
  };

  const runRestoreBatch = async () => {
    if (restoring) return;
    setRestoring(true);

    addRestoreLog("▶ Slug restore başlatıldı...");
    let totalInserted = restoreTotal;
    let done = false;

    while (!done) {
      try {
        const res = await fetch("/api/admin/bkm-restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-restore-secret": "gocmen-restore-2026",
          },
          body: "{}",
        });
        const data = await res.json();

        if (!res.ok) {
          addRestoreLog(`✗ Hata: ${data.error || "Bilinmeyen hata"}`);
          toast.error("Restore başarısız");
          break;
        }

        totalInserted += data.inserted;
        setRestoreTotal(totalInserted);
        done = data.done;

        const remaining = data.remaining ?? 0;
        addRestoreLog(
          `✓ +${data.inserted} ürün eklendi | Atl:${data.skipped} Hata:${data.errors} | Kalan:${remaining} | Toplam:${data.total}`
        );

        if (data.done) {
          addRestoreLog("✅ Tüm sluglar işlendi!");
          toast.success("Restore tamamlandı!");
          break;
        }

        if (data.inserted === 0 && data.errors > data.skipped) {
          addRestoreLog("⚠ Çok fazla hata — BKM rate-limit yapıyor olabilir. 30 saniye bekleniyor...");
          await new Promise(r => setTimeout(r, 30000));
        } else {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch {
        addRestoreLog("✗ Ağ hatası");
        toast.error("Bağlantı hatası");
        break;
      }
    }

    fetchStats();
    fetchRestoreStats();
    setRestoring(false);
  };

  const resetPage = () => {
    setCurrentPage(1);
    setTotalAdded(0);
    setImportLog([]);
    setSyncResult(null);
  };

  const remaining = restoreStats ? restoreStats.totalSlugs - restoreStats.bkmCount : 0;
  const restorePercent = restoreStats && restoreStats.totalSlugs > 0
    ? Math.round((restoreStats.bkmCount / restoreStats.totalSlugs) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">BKM Kitap İçe Aktarma</h1>
        <p className="text-zinc-400 text-sm mt-1">
          BKM Kitap'tan ürünleri batch batch çekin. Her butona basışta bir sayfa içe aktarılır. Aynı ürün tekrar eklenmez.
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center gap-3 mb-1">
            <Package className="w-5 h-5 text-amber-400" />
            <span className="text-zinc-400 text-sm font-medium">Toplam Ürün</span>
          </div>
          <p className="text-3xl font-black text-white">
            {loadingStats ? "—" : (stats?.total ?? 0).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center gap-3 mb-1">
            <Download className="w-5 h-5 text-blue-400" />
            <span className="text-zinc-400 text-sm font-medium">BKM'den Gelen</span>
          </div>
          <p className="text-3xl font-black text-white">
            {loadingStats ? "—" : (stats?.bkmCount ?? 0).toLocaleString("tr-TR")}
          </p>
        </div>
      </div>

      {/* Slug Restore */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DatabaseZap className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-white text-lg">Toplu Slug Restore</h2>
        </div>
        <p className="text-zinc-400 text-sm">
          Daha önce kaydedilmiş 2.676 slug listesinden ürünleri geri yükler. Her çalışmada 80 ürün işlenir, mevcut olanlar atlanır.
        </p>

        {restoreStats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                {restoreStats.bkmCount.toLocaleString("tr-TR")} / {restoreStats.totalSlugs.toLocaleString("tr-TR")} slug yüklendi
              </span>
              <span className="text-emerald-400 font-bold">%{restorePercent}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${restorePercent}%` }}
              />
            </div>
            {remaining > 0 && (
              <p className="text-zinc-500 text-xs">{remaining.toLocaleString("tr-TR")} slug kaldı</p>
            )}
          </div>
        )}

        {restoreTotal > 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-300 text-sm font-semibold">Bu oturumda {restoreTotal} yeni ürün eklendi</span>
          </div>
        )}

        <button
          onClick={runRestoreBatch}
          disabled={restoring || importing || syncing}
          className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors text-sm"
        >
          {restoring ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Restore Çalışıyor...</>
          ) : (
            <><DatabaseZap className="w-4 h-4" /> Slug Restore Başlat</>
          )}
        </button>

        {restoreLog.length > 0 && (
          <div className="bg-zinc-950 rounded-xl p-4 max-h-52 overflow-y-auto space-y-1 font-mono text-xs">
            {restoreLog.map((line, i) => (
              <p
                key={i}
                className={
                  line.startsWith("✓") || line.startsWith("✅") ? "text-emerald-400" :
                  line.startsWith("✗") ? "text-red-400" :
                  line.startsWith("⚠") ? "text-amber-400" :
                  line.startsWith("▶") ? "text-blue-400" :
                  "text-zinc-400"
                }
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Ürün Çekme */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <h2 className="font-bold text-white text-lg">BKM'den Ürün Çek (Kategori)</h2>
        <p className="text-zinc-400 text-sm">
          Her basışta seçili kategorinin bir sayfası taranır ve yeni ürünler eklenir. Mevcut ürünler tekrar eklenmez.
        </p>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Kategori</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); resetPage(); }}
                disabled={importing}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                {BKM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Mevcut Sayfa</label>
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono w-24 text-center">
              {currentPage}
            </div>
          </div>
        </div>

        {totalAdded > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-sm font-semibold">Bu oturumda toplam {totalAdded} yeni ürün eklendi</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={importBatch}
            disabled={importing || syncing}
            className="flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors text-sm"
          >
            {importing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Çekiliyor...</>
            ) : (
              <><Download className="w-4 h-4" /> Sayfa {currentPage}'i Çek</>
            )}
          </button>

          <button
            onClick={resetPage}
            disabled={importing || syncing}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-xl disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Başa Dön
          </button>
        </div>
      </div>

      {/* Fiyat & Stok Güncelleme */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <h2 className="font-bold text-white text-lg">Fiyat & Stok Güncelle</h2>
        <p className="text-zinc-400 text-sm">
          BKM'den çekilen ürünlerin fiyat ve stok bilgileri canlı verilerle güncellenir. Her seferinde 40 ürün kontrol edilir (en uzun süredir güncellenmemiş olanlar önce).
        </p>

        {syncResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Kontrol Edilen", value: syncResult.total, color: "text-zinc-300" },
              { label: "Fiyat Değişen", value: syncResult.priceUpdated, color: "text-amber-400" },
              { label: "Stok Değişen", value: syncResult.stockUpdated, color: "text-blue-400" },
              { label: "Bulunamayan", value: syncResult.notFound, color: "text-red-400" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-800 rounded-xl p-3 text-center">
                <p className={`text-xl font-black ${item.color}`}>{item.value ?? 0}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={syncPrices}
          disabled={syncing || importing}
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors text-sm"
        >
          {syncing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Güncelleniyor...</>
          ) : (
            <><TrendingUp className="w-4 h-4" /> Fiyat & Stok Güncelle</>
          )}
        </button>
      </div>

      {/* İşlem Logu */}
      {importLog.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-3">
          <h2 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-500" /> İşlem Kaydı
          </h2>
          <div className="bg-zinc-950 rounded-xl p-4 max-h-60 overflow-y-auto space-y-1 font-mono text-xs">
            {importLog.map((line, i) => (
              <p
                key={i}
                className={
                  line.startsWith("✓") ? "text-green-400" :
                  line.startsWith("✗") ? "text-red-400" :
                  line.startsWith("⚠") ? "text-amber-400" :
                  line.startsWith("▶") ? "text-blue-400" :
                  "text-zinc-400"
                }
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
