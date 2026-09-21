"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PROCESSING: { label: "İşleniyor", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  SHIPPED: { label: "Kargoda", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELED: { label: "İptal", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function AccountClient({ user, orders }: { user: any; orders: any[] }) {
  const [tab, setTab] = useState<"orders" | "profile">("orders");

  const TABS = [
    { id: "orders", label: "Siparişlerim", icon: ShoppingBag },
    { id: "profile", label: "Profilim", icon: User },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl">
          {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black dark:text-white">{user?.name ?? "Kullanıcı"}</h1>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="ml-auto flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2.5 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" /> Çıkış Yap
        </button>
      </div>

      <div className="flex gap-1 mb-8 border-b border-zinc-100 dark:border-zinc-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
              tab === id
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Henüz siparişin yok.</p>
              <a href="/products" className="mt-4 inline-block text-amber-500 hover:underline text-sm">
                Alışverişe Başla →
              </a>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-zinc-400 mb-1">Sipariş #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS[order.status]?.color}`}>
                      {STATUS[order.status]?.label ?? order.status}
                    </span>
                    <span className="font-black text-zinc-900 dark:text-white text-lg">₺{Number(order.total).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item: any, i: number) => (
                    <span key={i} className="text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-full">
                      {item.product?.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === "profile" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
            <h2 className="font-bold text-lg dark:text-white mb-5">Profil Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Ad Soyad</label>
                <input defaultValue={user?.name ?? ""} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">E-posta</label>
                <input defaultValue={user?.email ?? ""} disabled className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-500 text-sm cursor-not-allowed" />
                <p className="text-xs text-zinc-400 mt-1">E-posta değiştirilemez.</p>
              </div>
              <button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">Değişiklikleri Kaydet</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
