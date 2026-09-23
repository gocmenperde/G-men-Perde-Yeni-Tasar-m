"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, User, LogOut, Package, MapPin, Heart,
  Plus, Pencil, Trash2, Star, CheckCircle2, X, ChevronDown,
  Save, Phone, Home, Briefcase, Building2, Loader2, ArrowRight,
  Clock3, RefreshCw, Truck, ShieldCheck, XCircle, CreditCard,
  Crown, type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { TURKEY_PROVINCES, getDistricts } from "@/lib/turkey-cities";

const STATUS: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  PENDING:         { label: "Beklemede",       color: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: Clock3 },
  PROCESSING:      { label: "Hazırlanıyor",    color: "bg-blue-100 text-blue-700 border-blue-200",        icon: RefreshCw },
  SHIPPED:         { label: "Kargoda",         color: "bg-purple-100 text-purple-700 border-purple-200",  icon: Truck },
  DELIVERED:       { label: "Teslim Edildi",   color: "bg-green-100 text-green-700 border-green-200",     icon: CheckCircle2 },
  CANCELED:        { label: "İptal Edildi",    color: "bg-red-100 text-red-700 border-red-200",           icon: XCircle },
  PAID:            { label: "Ödendi",          color: "bg-teal-100 text-teal-700 border-teal-200",        icon: CreditCard },
  AWAITING_PAYMENT:{ label: "Ödeme Bekliyor",  color: "bg-orange-100 text-orange-700 border-orange-200",  icon: CreditCard },
  PAYMENT_FAILED:  { label: "Ödeme Başarısız", color: "bg-red-100 text-red-700 border-red-200",           icon: XCircle },
};

const TIMELINE_STEPS = [
  { key: "PENDING",    label: "Sipariş Alındı" },
  { key: "PROCESSING", label: "Hazırlanıyor" },
  { key: "SHIPPED",    label: "Kargoya Verildi" },
  { key: "DELIVERED",  label: "Teslim Edildi" },
];

const STEP_ORDER = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const INPUT = "w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent text-sm transition-colors";
const SELECT = "w-full px-4 py-2.5 pr-9 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF5A] focus:border-transparent text-sm cursor-pointer appearance-none transition-colors";
const LABEL = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5";

interface Address {
  id: string; title: string; fullName: string; phone: string;
  city: string; district: string; address: string; zipCode?: string | null; isDefault: boolean;
}
interface WishlistItem {
  id: string; productId: string;
  product: { id: string; name: string; slug: string; price: number; comparePrice: number | null; images: string[]; stock: number; isActive: boolean; };
}
type Tab = "orders" | "addresses" | "wishlist" | "profile";

const ADDRESS_ICONS: Record<string, any> = { Ev: Home, İş: Briefcase, Diğer: Building2 };

function AddressForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<Address>;
  onSave: (data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    city: initial?.city ?? "",
    district: initial?.district ?? "",
    address: initial?.address ?? "",
    zipCode: initial?.zipCode ?? "",
    isDefault: initial?.isDefault ?? false,
  });
  const [districts, setDistricts] = useState<string[]>(() =>
    initial?.city ? getDistricts(initial.city) : []
  );
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
        {["Ev", "İş", "Diğer"].map((t) => {
          const Icon = ADDRESS_ICONS[t] ?? Home;
          return (
            <button key={t} type="button" onClick={() => set("title", t)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.title === t ? "border-amber-400 bg-amber-50 text-amber-700" : "border-[#E8E0D5] text-zinc-500"}`}>
              <Icon className="w-3.5 h-3.5" /> {t}
            </button>
          );
        })}
        <div className="col-span-2 sm:col-span-1">
          <input value={form.title === "Ev" || form.title === "İş" || form.title === "Diğer" ? "" : form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Diğer başlık..."
            className={INPUT} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Ad Soyad</label>
          <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ad Soyad" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Telefon</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="05XXXXXXXXX" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>İl</label>
          <div className="relative">
            <select value={form.city} onChange={(e) => { set("city", e.target.value); setDistricts(getDistricts(e.target.value)); set("district", ""); }} className={SELECT}>
              <option value="">İl seçiniz</option>
              {TURKEY_PROVINCES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LABEL}>İlçe</label>
          <div className="relative">
            <select value={form.district} onChange={(e) => set("district", e.target.value)} className={SELECT} disabled={!form.city}>
              <option value="">{form.city ? "İlçe seçiniz" : "Önce il seçiniz"}</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Açık Adres (Mahalle, Cadde, Sokak, No)</label>
          <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} placeholder="Mahalle, Cadde/Sokak, Bina No, Daire No" className={`${INPUT} resize-none`} />
        </div>
        <div>
          <label className={LABEL}>Posta Kodu</label>
          <input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="Opsiyonel" maxLength={5} className={INPUT} />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer mt-1">
        <div onClick={() => set("isDefault", !form.isDefault)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${form.isDefault ? "bg-amber-500 border-amber-500" : "border-zinc-300"}`}>
          {form.isDefault && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-zinc-700 font-medium">Varsayılan adres olarak ayarla</span>
      </label>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={async () => {
          if (!form.title.trim() || !form.fullName || !form.phone || !form.city || !form.district || !form.address)
            return toast.error("Tüm zorunlu alanları doldurunuz.");
          setSaving(true);
          await onSave({ title: form.title, fullName: form.fullName, phone: form.phone, city: form.city, district: form.district, address: form.address, zipCode: form.zipCode || null }, form.isDefault);
          setSaving(false);
        }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-xl text-sm transition-all disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-zinc-100 text-zinc-700 font-semibold rounded-xl text-sm hover:bg-zinc-200 transition-all flex items-center gap-1.5">
          <X className="w-4 h-4" /> İptal
        </button>
      </div>
    </div>
  );
}

export default function AccountClient({ user, orders }: { user: any; orders: any[] }) {
  const [tab, setTab] = useState<Tab>("orders");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [premiumLogoText, setPremiumLogoText] = useState("Göçmen Premium Üyesi");
  const premiumActive = Boolean(user?.premiumUntil && new Date(user.premiumUntil).getTime() > Date.now());

  useEffect(() => {
    fetch("/api/premium/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (typeof json?.data?.logoText === "string" && json.data.logoText.trim()) {
          setPremiumLogoText(json.data.logoText.trim());
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "addresses" && addresses.length === 0) {
      setLoadingAddresses(true);
      fetch("/api/addresses").then(r => r.json()).then(j => setAddresses(j.data ?? [])).finally(() => setLoadingAddresses(false));
    }
    if (tab === "wishlist" && wishlist.length === 0) {
      setLoadingWishlist(true);
      fetch("/api/wishlist").then(r => r.json()).then(j => setWishlist(j.data ?? [])).finally(() => setLoadingWishlist(false));
    }
  }, [tab]);

  const addAddress = async (data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => {
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, isDefault }) });
    const j = await res.json();
    if (!res.ok) { toast.error(j.error ?? "Hata"); return; }
    if (isDefault) setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })));
    setAddresses(prev => [j.data, ...prev]);
    setShowAddForm(false);
    toast.success("Adres kaydedildi.");
  };

  const updateAddress = async (id: string, data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, isDefault }) });
    const j = await res.json();
    if (!res.ok) { toast.error(j.error ?? "Hata"); return; }
    if (isDefault) setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    setAddresses(prev => prev.map(a => a.id === id ? { ...j.data } : a));
    setEditingId(null);
    toast.success("Adres güncellendi.");
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Adres silinemedi."); return; }
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Adres silindi.");
  };

  const setDefault = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) });
    if (!res.ok) return;
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success("Varsayılan adres güncellendi.");
  };

  const removeFromWishlist = async (productId: string) => {
    await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    setWishlist(prev => prev.filter(w => w.productId !== productId));
    toast.success("Favorilerden kaldırıldı.");
  };

  const saveProfile = async () => {
    if (!profileName.trim()) return;
    setSavingProfile(true);
    const res = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profileName }) });
    const j = await res.json();
    setSavingProfile(false);
    if (!res.ok) { toast.error(j.error ?? "Hata"); return; }
    toast.success("Profil güncellendi.");
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "orders",    label: "Siparişlerim",  icon: ShoppingBag },
    { id: "addresses", label: "Adreslerim",    icon: MapPin },
    { id: "wishlist",  label: "Favorilerim",   icon: Heart },
    { id: "profile",   label: "Profilim",      icon: User },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 sm:py-10 sm:pb-10">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-[#E8E0D5] bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-200/50">
          {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#B8973E]">Göçmen Perde hesabın</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-900">Hoş geldin, {(user?.name ?? "Kullanıcı").split(/\s+/)[0]}</h1>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
           {premiumActive && (
             <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-100 px-3 py-1 text-xs font-black text-amber-700 shadow-sm">
                <Crown className="h-3.5 w-3.5" /> {premiumLogoText}
             </span>
           )}
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="ml-0 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:ml-auto sm:w-auto">
          <LogOut className="w-4 h-4" /> Çıkış Yap
        </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F0E9DE] pt-4">
          <button type="button" onClick={() => setTab("orders")} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B8973E]">
            <ShoppingBag className="h-4 w-4" /> Siparişlerim
          </button>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-xl border border-[#E8E0D5] px-4 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:border-[#D4AF5A] hover:text-[#B8973E]">
            Alışverişe devam et <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="scrollbar-hide sticky top-[var(--store-header-height,100px)] z-20 mb-6 flex gap-1 overflow-x-auto border-b border-zinc-100 bg-[var(--cream)]/95 backdrop-blur sm:mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${tab === id ? "border-[#B8973E] text-[#B8973E]" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── SİPARİŞLERİM ── */}
        {tab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Henüz siparişiniz yok.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const st = STATUS[order.status] ?? STATUS.PENDING;
                  const stepIdx = STEP_ORDER.indexOf(order.status);
                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden hover:border-[#D4AF5A] hover:shadow-md transition-all">
                      <Link href={`/orders/${order.id}`} className="block p-5">
                         <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-mono text-sm font-semibold text-zinc-700">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                           <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${st.color}`}><st.icon className="w-3.5 h-3.5" aria-hidden="true" /> {st.label}</span>
                            <span className="font-black text-zinc-900">₺{Number(order.total).toLocaleString("tr-TR")}</span>
                          </div>
                        </div>

                        {/* Timeline */}
                        {order.status !== "CANCELED" && (
                          <div className="flex items-center gap-0 mt-3">
                            {TIMELINE_STEPS.map((step, i) => {
                              const done = stepIdx >= i;
                              const current = stepIdx === i;
                              return (
                                <div key={step.key} className="flex items-center flex-1">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-amber-500 border-amber-500" : "border-zinc-200 bg-white"} ${current ? "ring-2 ring-amber-200 ring-offset-1" : ""}`}>
                                      {done && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <p className={`text-[9px] mt-1 font-medium whitespace-nowrap ${done ? "text-amber-600" : "text-zinc-300"}`}>{step.label}</p>
                                  </div>
                                  {i < TIMELINE_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 mb-3 transition-all ${stepIdx > i ? "bg-amber-400" : "bg-zinc-200"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {order.items.length > 0 && (
                          <p className="text-xs text-zinc-400 mt-3 line-clamp-1">{order.items.map((i: any) => i.product.name).join(", ")}</p>
                        )}
                      </Link>
                      <div className="px-5 pb-4">
                        <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                          Detayları Görüntüle <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ADRESLERİM ── */}
        {tab === "addresses" && (
          <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loadingAddresses ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => {
                  const Icon = ADDRESS_ICONS[addr.title] ?? MapPin;
                  return (
                    <div key={addr.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${addr.isDefault ? "border-amber-300" : "border-[#E8E0D5]"}`}>
                      {editingId === addr.id ? (
                        <div className="p-4">
                          <AddressForm initial={addr} onSave={(data, isDefault) => updateAddress(addr.id, data, isDefault)} onCancel={() => setEditingId(null)} />
                        </div>
                      ) : (
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? "bg-amber-100" : "bg-zinc-100"}`}>
                                <Icon className={`w-5 h-5 ${addr.isDefault ? "text-amber-600" : "text-zinc-500"}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-zinc-900">{addr.title}</p>
                                  {addr.isDefault && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Varsayılan</span>}
                                </div>
                                <p className="text-sm text-zinc-600 mt-0.5">{addr.fullName}</p>
                                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {addr.phone}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{addr.address}, {addr.district}/{addr.city}{addr.zipCode ? ` ${addr.zipCode}` : ""}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!addr.isDefault && (
                                <button onClick={() => setDefault(addr.id)} title="Varsayılan yap"
                                  className="p-2 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => { setEditingId(addr.id); setShowAddForm(false); }}
                                className="p-2 rounded-xl text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteAddress(addr.id)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Yeni Adres Ekle */}
                {showAddForm ? (
                  <div className="bg-white rounded-2xl border border-[#E8E0D5] p-4">
                    <p className="font-bold text-zinc-900 mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-amber-500" /> Yeni Adres</p>
                    <AddressForm onSave={addAddress} onCancel={() => setShowAddForm(false)} />
                  </div>
                ) : (
                  <button onClick={() => { setShowAddForm(true); setEditingId(null); }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-500 hover:border-amber-400 hover:text-amber-600 font-semibold text-sm transition-all">
                    <Plus className="w-5 h-5" /> Yeni Adres Ekle
                  </button>
                )}

                {addresses.length === 0 && !showAddForm && (
                  <div className="text-center py-12">
                    <MapPin className="w-14 h-14 text-zinc-200 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Henüz kayıtlı adresiniz yok.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── FAVORİLERİM ── */}
        {tab === "wishlist" && (
          <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loadingWishlist ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Henüz favoriniz yok.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-[#B8973E] text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
                  Ürünleri Keşfet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map(({ product, productId }) => (
                  <div key={productId} className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden hover:border-[#D4AF5A] hover:shadow-md transition-all group">
                    <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-[#FAF7F2]">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><Package className="w-12 h-12" /></div>
                      )}
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                          %{Math.round((1 - product.price / product.comparePrice) * 100)} İNDİRİM
                        </span>
                      )}
                    </Link>
                    <div className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <p className="font-semibold text-zinc-900 text-sm line-clamp-2 hover:text-[#B8973E] transition-colors">{product.name}</p>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-black text-zinc-900">₺{product.price.toLocaleString("tr-TR")}</p>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <p className="text-xs text-zinc-400 line-through">₺{product.comparePrice.toLocaleString("tr-TR")}</p>
                          )}
                        </div>
                        <button onClick={() => removeFromWishlist(productId)}
                          className="p-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-xs mt-1.5 font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
                        {product.stock === 0 ? "Stokta yok" : product.stock <= 5 ? `Son ${product.stock} ürün!` : "Stokta mevcut"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── PROFİLİM ── */}
        {tab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="max-w-lg space-y-6">
              <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
                <h3 className="font-bold text-zinc-900 mb-5 flex items-center gap-2"><User className="w-4 h-4 text-amber-500" /> Profil Bilgilerini Düzenle</h3>
                <div className="space-y-4">
                  <div>
                    <label className={LABEL}>Ad Soyad</label>
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Ad Soyad" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>E-posta</label>
                    <input value={user?.email} disabled className={`${INPUT} opacity-60 cursor-not-allowed`} />
                    <p className="text-xs text-zinc-400 mt-1">E-posta adresi değiştirilemez.</p>
                  </div>
                  <div>
                    <label className={LABEL}>Hesap Türü</label>
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900">{user?.role === "ADMIN" ? <ShieldCheck className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" /> : <User className="w-4 h-4 text-zinc-400" aria-hidden="true" />} {user?.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}</p>
                  </div>
                </div>
                <button onClick={saveProfile} disabled={savingProfile || !profileName.trim() || profileName === user?.name}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 font-bold rounded-xl text-sm transition-all">
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingProfile ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>

               <div className={`rounded-2xl border p-6 ${premiumActive ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50" : "border-[#E8E0D5] bg-white"}`}>
                 <div className="flex items-start gap-3">
                   <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-amber-300">
                     <Crown className="h-5 w-5" />
                   </div>
                   <div className="min-w-0">
                     <h3 className="font-black text-zinc-900">{premiumActive ? `${premiumLogoText} aktif` : "Göçmen Premium'a katılın"}</h3>
                     <p className="mt-1 text-sm leading-5 text-zinc-500">
                       {premiumActive && user.premiumUntil
                         ? `${new Date(user.premiumUntil).toLocaleDateString("tr-TR")} tarihine kadar özel indirim ve ücretsiz kargo avantajlarından yararlanın.`
                         : "Özel indirim, ücretsiz kargo ve hesabınızda Premium rozeti için üyeliğinizi başlatın."}
                     </p>
                     <Link href="/premium" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#B8973E]">
                       {premiumActive ? "Bir ay daha yenile" : "Premium'u keşfet"} <ArrowRight className="h-4 w-4" />
                     </Link>
                   </div>
                 </div>
               </div>

              <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                <h3 className="font-bold text-red-700 mb-2">Hesaptan Çıkış</h3>
                <p className="text-sm text-zinc-500 mb-4">Oturumu sonlandırıp giriş sayfasına yönlendirilirsiniz.</p>
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all">
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
