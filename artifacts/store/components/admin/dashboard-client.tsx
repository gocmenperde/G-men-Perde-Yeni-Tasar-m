"use client";

import { motion } from "framer-motion";
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight, Plus, Eye, AlertTriangle, Database, Loader2, CheckCircle, Search, RefreshCw, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import toast from "react-hot-toast";

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Beklemede", color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
  PROCESSING: { label: "İşleniyor", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  SHIPPED:    { label: "Kargoda",   color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
  DELIVERED:  { label: "Teslim",   color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  CANCELED:   { label: "İptal",    color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

export default function AdminDashboardClient({
  stats, recentOrders, chartData, orderStats, categoryCount, brandCount, lowStockProducts, syncStats, topProducts, dataWarning,
}: {
  stats: { totalProducts: number; totalOrders: number; totalUsers: number; totalRevenue: number };
  recentOrders: any[];
  chartData: any[];
  orderStats: any[];
  categoryCount?: number;
  brandCount?: number;
  lowStockProducts?: { id: string; name: string; stock: number; slug: string }[];
  syncStats?: { bkmTotal: number; bkmOutOfStock: number; bkmLastSyncedAt: string | null; bkmRecentlyUpdated: number };
  topProducts?: { name: string; qty: number; revenue: number }[];
  dataWarning?: string | null;
}) {
  const [seeding, setSeeding]           = useState(false);
  const [seedDone, setSeedDone]         = useState(false);
  const [seedResult, setSeedResult]     = useState<{ categories: number; brands: number } | null>(null);
  const [seedingProd, setSeedingProd]   = useState(false);
  const [seedProdDone, setSeedProdDone] = useState(false);
  const [seedProdResult, setSeedProdResult] = useState<{ created: number; skipped: number } | null>(null);
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [indexNowResult, setIndexNowResult]   = useState<string | null>(null);
  const [syncing, setSyncing]         = useState(false);
  const [syncResult, setSyncResult]   = useState<{ priceUpdated: number; stockUpdated: number; total: number; duration: string } | null>(null);
  const [liveSyncStats, setLiveSyncStats] = useState(syncStats);

  // Göçmen Perde kataloğunda az sayıda marka olması normaldir. Beşten az
  // marka/kategori için "yüklenmemiş" demek, canlı katalogda yanlış alarm
  // üretiyordu. DB sorgularından biri başarısızsa da seed butonunu gösterme;
  // dataWarning zaten asıl sorunu bildiriyor.
  const isEmpty     = !dataWarning && ((categoryCount ?? 0) === 0 || (brandCount ?? 0) === 0);
  const fewProducts = (stats.totalProducts ?? 0) < 10;

  const handleSync = async () => {
    if (!confirm("BKM Kitap'tan 40 ürünün fiyat ve stok bilgisi güncellenecek. Devam edilsin mi?")) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res  = await fetch("/api/admin/sync-prices", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncResult({ priceUpdated: data.stats.priceUpdated, stockUpdated: data.stats.stockUpdated, total: data.stats.total, duration: data.duration });
      const statsRes  = await fetch("/api/admin/sync-prices");
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setLiveSyncStats({
          bkmTotal: statsData.bkmTotal ?? 0,
          bkmOutOfStock: statsData.outOfStock ?? 0,
          bkmLastSyncedAt: statsData.lastSyncedAt ?? null,
          bkmRecentlyUpdated: statsData.recentlyUpdated ?? 0,
        });
      }
      toast.success(`Senkronizasyon tamamlandı! ${data.stats.priceUpdated} fiyat, ${data.stats.stockUpdated} stok güncellendi.`);
    } catch (err: any) {
      toast.error(err.message ?? "Senkronizasyon başarısız.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSeedProducts = async () => {
    if (!confirm("100'den fazla örnek ürün markalarıyla birlikte yüklenecek. Devam edilsin mi?")) return;
    setSeedingProd(true);
    try {
      const res  = await fetch("/api/admin/seed-products", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeedProdResult({ created: data.created, skipped: data.skipped });
      setSeedProdDone(true);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message ?? "Ürünler yüklenemedi.");
    } finally {
      setSeedingProd(false);
    }
  };

  const handleIndexNow = async () => {
    setIndexNowLoading(true);
    setIndexNowResult(null);
    try {
      const res  = await fetch("/api/admin/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIndexNowResult(data.message);
      toast.success("Google ve Bing'e bildirim gönderildi!");
    } catch (err: any) {
      toast.error(err.message ?? "IndexNow bildirimi gönderilemedi.");
    } finally {
      setIndexNowLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Kategoriler ve markalar veritabanına yüklenecek. Devam edilsin mi?")) return;
    setSeeding(true);
    try {
      const res  = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeedResult({ categories: data.categories, brands: data.brands });
      setSeedDone(true);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message ?? "Yükleme başarısız.");
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { label: "Toplam Gelir",  value: `₺${stats.totalRevenue.toLocaleString("tr-TR")}`, icon: TrendingUp,  color: "from-amber-500 to-orange-500",  bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Siparişler",    value: stats.totalOrders.toLocaleString(),                 icon: ShoppingCart, color: "from-blue-500 to-blue-600",     bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Ürünler",       value: stats.totalProducts.toLocaleString(),               icon: Package,      color: "from-purple-500 to-purple-600", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Kullanıcılar",  value: stats.totalUsers.toLocaleString(),                  icon: Users,        color: "from-green-500 to-green-600",   bg: "bg-green-500/10 border-green-500/20" },
  ];

  const quickActions = [
    { label: "Yeni Ürün Ekle",  href: "/admin/products/new",   icon: Plus,         color: "bg-amber-500 hover:bg-amber-400 text-zinc-900" },
    { label: "Siparişleri Gör", href: "/admin/orders",         icon: ShoppingCart, color: "bg-zinc-800 hover:bg-zinc-700 text-white" },
    { label: "Mağazayı Gör",    href: "/",                     icon: Eye,          color: "bg-zinc-800 hover:bg-zinc-700 text-white" },
    { label: "Kategori Ekle",   href: "/admin/categories",     icon: Package,      color: "bg-zinc-800 hover:bg-zinc-700 text-white" },
  ];

  const pendingOrders = recentOrders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Mağaza genel durumu</p>
        </div>
        {pendingOrders > 0 && (
          <Link href="/admin/orders" className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            {pendingOrders} bekleyen sipariş
          </Link>
        )}
      </div>

      {dataWarning && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          {dataWarning}
        </div>
      )}

      {/* ── VERİTABANI BAŞLATMA UYARISI ─────────────────────────────────── */}
      {!seedDone && isEmpty && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-amber-400" />
              <p className="text-amber-300 font-bold">Kategori ve markalar yüklenmemiş</p>
            </div>
            <p className="text-amber-400/70 text-sm">
              Sitede kategori ve marka görünmesi için aşağıdaki butona tıklayın.
              Bu işlem tek seferlik yapılır, mevcut veriler korunur.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 shrink-0"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? "Yükleniyor..." : "Kategorileri & Markaları Yükle"}
          </button>
        </div>
      )}

      {seedDone && seedResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-green-300 font-semibold text-sm">
            {seedResult.categories} kategori ve {seedResult.brands} marka başarıyla yüklendi! Sayfayı yenileyin.
          </p>
        </div>
      )}

      {/* ── ÖRNEK ÜRÜN YÜKLEME ─────────────────────────────────────────────── */}
      {!seedProdDone && fewProducts && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300 font-bold">Örnek ürünler yüklenmemiş</p>
            </div>
            <p className="text-blue-400/70 text-sm">
              Faber-Castell, Staedtler, Pelikan, Stabilo, Pentel, Koh-i-Noor, Moleskine, Südor, Pensan ve daha
              fazlasından <strong className="text-blue-300">100+ ürün</strong> gerçek görselleriyle tek tıkla yüklensin.
              Zaten eklenmişler atlanır.
            </p>
          </div>
          <button
            onClick={handleSeedProducts}
            disabled={seedingProd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 shrink-0"
          >
            {seedingProd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            {seedingProd ? "Yükleniyor..." : "Örnek Ürünleri Yükle"}
          </button>
        </div>
      )}

      {seedProdDone && seedProdResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-green-300 font-semibold text-sm">
            {seedProdResult.created} ürün eklendi, {seedProdResult.skipped} zaten mevcuttu. Sayfayı yenileyin.
          </p>
        </div>
      )}

      {/* ── BKM KİTAP SENKRONİZASYON ────────────────────────────────────────── */}
      {liveSyncStats && liveSyncStats.bkmTotal > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-cyan-300 font-bold">BKM Kitap — Fiyat &amp; Stok Senkronizasyonu</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                <div className="bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Toplam BKM Ürünü</p>
                  <p className="text-lg font-black text-white">{liveSyncStats.bkmTotal.toLocaleString("tr-TR")}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Son 24s Güncellenen</p>
                  <p className="text-lg font-black text-cyan-400">{liveSyncStats.bkmRecentlyUpdated.toLocaleString("tr-TR")}</p>
                </div>
                <div className={`bg-zinc-900/60 rounded-xl px-3 py-2 border ${liveSyncStats.bkmOutOfStock > 0 ? "border-orange-500/30" : "border-zinc-800"}`}>
                  <p className="text-xs text-zinc-500 mb-0.5">Stokta Yok</p>
                  <p className={`text-lg font-black ${liveSyncStats.bkmOutOfStock > 0 ? "text-orange-400" : "text-zinc-300"}`}>{liveSyncStats.bkmOutOfStock.toLocaleString("tr-TR")}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Son Sync</p>
                  <p className="text-xs font-semibold text-zinc-300">
                    {liveSyncStats.bkmLastSyncedAt
                      ? new Date(liveSyncStats.bkmLastSyncedAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
              </div>
              <p className="text-cyan-400/60 text-xs flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Otomatik senkronizasyon her gün saat 09:00 ve 21:00'de çalışır (Vercel Cron).
              </p>
              {syncResult && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 w-fit">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  {syncResult.total} ürün kontrol edildi — {syncResult.priceUpdated} fiyat, {syncResult.stockUpdated} stok güncellendi ({syncResult.duration})
                </div>
              )}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 shrink-0"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? "Senkronize Ediliyor..." : "Manuel Senkronizasyon"}
            </button>
          </div>
        </div>
      )}

      {/* ── INDEXNOW — SEO BİLDİRİM ─────────────────────────────────────────── */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-purple-400" />
            <p className="text-purple-300 font-bold">Google &amp; Bing — IndexNow</p>
          </div>
          <p className="text-purple-400/70 text-sm">
            Tüm ürün ve sayfa URL&apos;lerini arama motorlarına <strong className="text-purple-300">anında bildirir</strong>.
            Yeni ürün eklediğinizde otomatik çalışır; toplu güncelleme sonrası manuel de tetikleyebilirsiniz.
          </p>
          {indexNowResult && (
            <p className="text-purple-300 text-xs mt-2 bg-purple-900/20 rounded-lg px-3 py-1.5 inline-block">
              ✓ {indexNowResult}
            </p>
          )}
        </div>
        <button
          onClick={handleIndexNow}
          disabled={indexNowLoading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 shrink-0"
        >
          {indexNowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {indexNowLoading ? "Gönderiliyor..." : "Arama Motorlarına Bildir"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-zinc-900 rounded-2xl border ${bg} p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform`}
          >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-zinc-400 text-sm">{label}</p>
            <p className="text-3xl font-black text-white mt-1">{value}</p>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white">Son 7 Günlük Gelir</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">Son 7 gün</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff", fontSize: "13px" }}
                formatter={(value: any) => [`₺${Number(value).toLocaleString("tr-TR")}`, "Gelir"]}
              />
              <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h2 className="font-bold text-white mb-5">Hızlı İşlemler</h2>
          <div className="space-y-2.5">
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${color}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Ürün Yönetimi</p>
            <div className="space-y-2">
              <Link href="/admin/products?filter=featured" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-colors">
                <span className="text-sm text-amber-400 font-medium">⭐ Öne Çıkanlar</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500/60" />
              </Link>
              <Link href="/admin/products?filter=sale" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-colors">
                <span className="text-sm text-red-400 font-medium">🔥 Flaş İndirimler</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-500/60" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── EN ÇOK SATAN ÜRÜNLER ── */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white">En Çok Satan Ürünler</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">Satış adedine göre</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff", fontSize: "13px" }}
                formatter={(value: any, name: string) => [
                  name === "qty" ? `${value} adet` : `₺${Number(value).toLocaleString("tr-TR")}`,
                  name === "qty" ? "Satış Adedi" : "Tahmini Gelir",
                ]}
              />
              <Bar dataKey="qty" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#f59e0b" : i === 1 ? "#d97706" : i === 2 ? "#b45309" : "#3f3f46"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Low stock alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-300 font-bold">Düşük Stok Uyarısı — {lowStockProducts.length} Ürün</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products`}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 hover:border-red-500/40 transition-colors"
              >
                <span className="text-sm text-zinc-200 truncate pr-2">{p.name}</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${p.stock <= 2 ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}>
                  {p.stock} adet
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-white">Son Siparişler</h2>
          <Link href="/admin/orders" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors">
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p>Henüz sipariş yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  {["Sipariş No", "Müşteri", "Tutar", "Durum", "Tarih"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentOrders.map((order) => {
                  const st = STATUS[order.status] ?? STATUS.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-300 text-xs">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-zinc-300">{order.user?.name ?? order.user?.email ?? "—"}</td>
                      <td className="px-6 py-4 font-bold text-white">₺{Number(order.total).toLocaleString("tr-TR")}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
