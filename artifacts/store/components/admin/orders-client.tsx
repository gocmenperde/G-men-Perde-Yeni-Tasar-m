"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, X, Package, Truck, CheckCircle2, Clock, XCircle,
  CreditCard, MapPin, User, Hash, ExternalLink, Save, Loader2,
  ChevronDown, Search, Download, AlertCircle, Ban, StickyNote,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  AWAITING_PAYMENT: { label: "Ödeme Bekliyor", color: "text-orange-400", bg: "bg-orange-900/30", icon: CreditCard },
  PAYMENT_FAILED:   { label: "Ödeme Hatası",   color: "text-red-300",    bg: "bg-red-900/20",    icon: Ban },
  PENDING:          { label: "Beklemede",       color: "text-yellow-400", bg: "bg-yellow-900/30", icon: Clock },
  PAID:             { label: "Ödendi",          color: "text-green-400",  bg: "bg-green-900/30",  icon: CheckCircle2 },
  PROCESSING:       { label: "İşleniyor",       color: "text-blue-400",   bg: "bg-blue-900/30",   icon: Package },
  SHIPPED:          { label: "Kargoda",         color: "text-purple-400", bg: "bg-purple-900/30", icon: Truck },
  DELIVERED:        { label: "Teslim Edildi",   color: "text-green-400",  bg: "bg-green-900/30",  icon: CheckCircle2 },
  CANCELED:         { label: "İptal",           color: "text-red-400",    bg: "bg-red-900/30",    icon: XCircle },
};

const CARGO_COMPANIES = [
  "Yurtiçi Kargo","PTT Kargo","Sürat Kargo","MNG Kargo",
  "Aras Kargo","UPS Kargo","DHL","Trendyol Express","Hepsijet","Diğer",
];

const CARGO_TRACKING_URL: Record<string, string> = {
  "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=",
  "PTT Kargo":     "https://www.ptt.gov.tr/tr/kargo-takip?barcode=",
  "Sürat Kargo":   "https://www.suratkargo.com.tr/kargotakip/?",
  "MNG Kargo":     "https://www.mngkargo.com.tr/wps/portal/kargo-takip?barkod=",
  "Aras Kargo":    "https://kargotakip.araskargo.com.tr/?code=",
  "UPS Kargo":     "https://www.ups.com/track?loc=tr_TR&tracknum=",
};

interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string | null;
  title?: string;
}

interface Order {
  id: string; status: string; total: number; subtotal?: number;
  discount?: number; shipping?: number; createdAt: string;
  trackingNumber?: string | null; trackingCompany?: string | null;
  address?: Address | null;
  adminNote?: string | null;
  user: { name: string | null; email: string };
  items: { id: string; quantity: number; price: number; product: { name: string; images: string[] } }[];
}

function buildTrackUrl(company?: string | null, number?: string | null) {
  if (!company || !number) return null;
  const base = CARGO_TRACKING_URL[company];
  return base ? `${base}${number}` : null;
}

function exportToCsv(orders: any[]) {
  const header = ["Sipariş No","Müşteri","E-posta","Ürünler","Tutar","Durum","Kargo Firması","Takip No","Tarih"];
  const rows = orders.map((o) => [
    `#${o.id.slice(-8).toUpperCase()}`,
    o.user?.name ?? "",
    o.user?.email ?? "",
    (o.items ?? []).map((i: any) => `${i.product?.name ?? "Ürün"} (x${i.quantity ?? 1})`).join(" | "),
    Number(o.total).toFixed(2),
    STATUS[o.status]?.label ?? o.status,
    o.trackingCompany ?? "",
    o.trackingNumber ?? "",
    new Date(o.createdAt).toLocaleDateString("tr-TR"),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `siparisler-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${orders.length} sipariş CSV olarak indirildi.`);
}

function OrderDrawer({ order: initial, onClose, onUpdate }: {
  order: Order; onClose: () => void; onUpdate: (id: string, data: Partial<Order>) => void;
}) {
  const [status, setStatus] = useState(initial.status);
  const [trackingNumber, setTrackingNumber] = useState(initial.trackingNumber ?? "");
  const [trackingCompany, setTrackingCompany] = useState(initial.trackingCompany ?? "");
  const [adminNote, setAdminNote] = useState((initial as any).adminNote ?? "");
  const [saving, setSaving] = useState(false);

  const url = buildTrackUrl(trackingCompany, trackingNumber);
  const st = STATUS[status] ?? STATUS.PENDING;
  const StIcon = st.icon;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${initial.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber, trackingCompany, adminNote }),
      });
      if (!res.ok) throw new Error();
      onUpdate(initial.id, { status, trackingNumber: trackingNumber || null, trackingCompany: trackingCompany || null });
      toast.success("Sipariş güncellendi.");
      onClose();
    } catch { toast.error("Güncelleme başarısız."); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-lg bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Sipariş Detayı</p>
            <h2 className="text-xl font-black text-white mt-0.5">#{initial.id.slice(-8).toUpperCase()}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(initial.createdAt).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
            <X className="w-5 h-5 text-zinc-300" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          <div className="bg-zinc-800/60 rounded-2xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Müşteri</p>
            <p className="font-bold text-white">{initial.user.name ?? "—"}</p>
            <p className="text-zinc-400 text-sm mt-0.5">{initial.user.email}</p>
          </div>

          {initial.address ? (
            <div className="bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Teslimat Adresi</p>
              <p className="text-white font-semibold text-sm">{initial.address.fullName}</p>
              <p className="text-amber-400 text-sm mt-0.5">{initial.address.phone}</p>
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                {initial.address.address}, {initial.address.district} / {initial.address.city}
                {initial.address.zipCode ? ` — ${initial.address.zipCode}` : ""}
              </p>
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Teslimat Adresi</p>
              <p className="text-red-400 text-sm">Müşteri adres girmemiş.</p>
            </div>
          )}

          <div className="bg-zinc-800/60 rounded-2xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Ürünler ({initial.items.length})</p>
            <div className="space-y-3">
              {initial.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-700 flex-shrink-0">
                    {item.product.images?.[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.product.name}</p>
                    <p className="text-xs text-zinc-500">{item.quantity} × ₺{Number(item.price).toLocaleString("tr-TR")}</p>
                  </div>
                  <p className="text-sm font-bold text-white whitespace-nowrap">₺{(item.quantity * Number(item.price)).toLocaleString("tr-TR")}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-700 space-y-1.5">
              {initial.discount && Number(initial.discount) > 0 ? (
                <div className="flex justify-between text-xs text-zinc-400"><span>İndirim</span><span className="text-green-400">-₺{Number(initial.discount).toLocaleString("tr-TR")}</span></div>
              ) : null}
              {initial.shipping && Number(initial.shipping) > 0 ? (
                <div className="flex justify-between text-xs text-zinc-400"><span>Kargo</span><span>₺{Number(initial.shipping).toLocaleString("tr-TR")}</span></div>
              ) : null}
              <div className="flex justify-between font-black text-white pt-1"><span>Toplam</span><span>₺{Number(initial.total).toLocaleString("tr-TR")}</span></div>
            </div>
          </div>

          <div className="bg-zinc-800/60 rounded-2xl p-4 space-y-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Durum & Kargo Güncelle</p>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Sipariş Durumu</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none bg-zinc-700 border border-zinc-600 text-white text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer">
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-zinc-800">{v.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                <StIcon className="w-3.5 h-3.5" /> {st.label}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Kargo Firması</label>
              <div className="relative">
                <select value={trackingCompany} onChange={(e) => setTrackingCompany(e.target.value)}
                  className="w-full appearance-none bg-zinc-700 border border-zinc-600 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer">
                  <option value="" className="bg-zinc-800">— Firma seçiniz —</option>
                  {CARGO_COMPANIES.map((c) => <option key={c} value={c} className="bg-zinc-800">{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Kargo Takip Numarası</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Takip numarasını girin"
                  className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono placeholder:text-zinc-500 placeholder:font-sans" />
              </div>
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Kargo takip linkini aç
                </a>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" /> İç Not (müşteri görmez)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Sipariş hakkında dahili notlar ekleyin..."
                className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-500 resize-none"
              />
            </div>

            <button onClick={save} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 font-black rounded-xl transition-all text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrdersClient({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "ALL" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || (o.user?.name ?? "").toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleUpdate = (id: string, data: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...data } : o));

  const counts = Object.keys(STATUS).reduce((acc, k) => { acc[k] = orders.filter((o) => o.status === k).length; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">Siparişler</h1>
          <p className="text-zinc-400 mt-1 text-sm">{orders.length} sipariş</p>
        </div>
        <button onClick={() => exportToCsv(filtered)} disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
          <Download className="w-4 h-4" /> CSV İndir ({filtered.length})
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {(["ALL", ...Object.keys(STATUS)] as string[]).map((s) => {
          const count = s === "ALL" ? orders.length : (counts[s] ?? 0);
          const st = s === "ALL" ? null : STATUS[s];
          const Icon = st?.icon ?? ShoppingCart;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`p-2.5 rounded-2xl border transition-all text-left ${filter === s ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
              <Icon className={`w-3.5 h-3.5 mb-1.5 ${filter === s ? "text-amber-400" : "text-zinc-600"}`} />
              <p className={`text-lg font-black ${filter === s ? "text-white" : "text-zinc-300"}`}>{count}</p>
              <p className="text-[10px] text-zinc-500 leading-tight">{s === "ALL" ? "Tümü" : (st?.label ?? s)}</p>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Sipariş no, müşteri adı veya e-posta ile ara..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-600" />
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center"><ShoppingCart className="w-10 h-10 mx-auto text-zinc-700 mb-3" /><p className="text-zinc-500 text-sm">Sipariş bulunamadı.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Sipariş No","Müşteri","Ürünler","Tutar","Durum","Kargo","Tarih",""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((order) => {
                  const st = STATUS[order.status] ?? STATUS.PENDING;
                  const StIcon = st.icon;
                  const tUrl = buildTrackUrl(order.trackingCompany, order.trackingNumber);
                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors group">
                      <td className="px-4 py-4 font-mono text-zinc-300 text-xs whitespace-nowrap">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-4">
                        <p className="text-zinc-200 font-medium">{order.user?.name ?? "—"}</p>
                        <p className="text-zinc-500 text-xs truncate max-w-[160px]">{order.user?.email}</p>
                        {order.address?.phone && (
                          <p className="text-amber-400 text-xs mt-0.5 font-mono">{order.address.phone}</p>
                        )}
                        {order.address?.city && (
                          <p className="text-zinc-600 text-xs truncate max-w-[160px]">{order.address.district}/{order.address.city}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-zinc-400 text-xs max-w-[160px] truncate">{order.items.map((i: any) => i.product.name).join(", ")}</td>
                      <td className="px-4 py-4 font-bold text-white whitespace-nowrap">₺{Number(order.total).toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                          <StIcon className="w-3 h-3" /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {order.trackingNumber ? (
                          <div>
                            <p className="text-xs text-zinc-400">{order.trackingCompany ?? "—"}</p>
                            {tUrl ? (
                              <a href={tUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 mt-0.5">
                                {order.trackingNumber.slice(0,14)}{order.trackingNumber.length > 14 ? "…" : ""}<ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            ) : <p className="text-xs font-mono text-zinc-400 mt-0.5">{order.trackingNumber}</p>}
                          </div>
                        ) : <span className="text-xs text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-4 text-zinc-400 text-xs whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"2-digit" })}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 text-zinc-300 hover:text-zinc-900 text-xs font-bold rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          Düzenle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleUpdate} />
        )}
      </AnimatePresence>
    </div>
  );
}
