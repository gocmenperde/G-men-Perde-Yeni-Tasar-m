"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  ShieldOff,
  Ban,
  Search,
  TrendingUp,
  Calendar,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersClient({ users: initial }: { users: any[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateUser = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Güncellenemedi.");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      toast.success("Kullanıcı güncellendi.");
    } catch {
      toast.error("Güncelleme başarısız.");
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalRevenue = users.reduce((s, u) => s + (u.totalSpent ?? 0), 0);
  const activeCustomers = users.filter((u) => (u._count?.orders ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Kullanıcılar</h1>
          <p className="text-zinc-400 mt-1 text-sm">{users.length} kullanıcı</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Toplam Ciro</p>
            <p className="text-xl font-black text-white">₺{totalRevenue.toLocaleString("tr-TR")}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Alışveriş Yapan</p>
            <p className="text-xl font-black text-white">{activeCustomers}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Kayıtlı Üye</p>
            <p className="text-xl font-black text-white">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ad veya e-posta ile ara..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-500"
        />
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Kullanıcı", "E-posta", "Rol", "Sipariş", "Toplam Harcama", "Son Sipariş", "Durum", "İşlem"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(user.name ?? user.email ?? "U")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-zinc-200 whitespace-nowrap">
                          {user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-xs">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          user.role === "ADMIN"
                            ? "bg-amber-900/30 text-amber-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-center">
                      {user._count?.orders ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      {(user.totalSpent ?? 0) > 0 ? (
                        <span className="font-bold text-amber-400">
                          ₺{Number(user.totalSpent).toLocaleString("tr-TR")}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-xs whitespace-nowrap">
                      {user.lastOrderAt ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.lastOrderAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.isBlocked
                            ? "bg-red-900/30 text-red-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {user.isBlocked ? "Engelli" : "Aktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Admin ver / geri al */}
                        {user.role === "ADMIN" ? (
                          <button
                            onClick={() => updateUser(user.id, { role: "USER" })}
                            className="p-2 hover:bg-red-950/40 rounded-lg transition-colors text-amber-400 hover:text-red-400"
                            title="Admin yetkisini geri al"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUser(user.id, { role: "ADMIN" })}
                            className="p-2 hover:bg-amber-900/30 rounded-lg transition-colors text-zinc-500 hover:text-amber-400"
                            title="Admin yap"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {/* Engelle / Engeli kaldır */}
                        <button
                          onClick={() => updateUser(user.id, { isBlocked: !user.isBlocked })}
                          className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-zinc-500 hover:text-red-400"
                          title={user.isBlocked ? "Engeli kaldır" : "Engelle"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        {/* Satırı aç/kapat */}
                        <button
                          onClick={() => toggleExpand(user.id)}
                          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
                          title="Adres bilgilerini gör"
                        >
                          {expandedId === user.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Genişletilmiş adres/iletişim paneli */}
                  {expandedId === user.id && (
                    <tr key={`${user.id}-detail`} className="bg-zinc-950/60">
                      <td colSpan={8} className="px-6 py-5">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            Kayıtlı Adresler
                          </p>
                          {(!user.addresses || user.addresses.length === 0) ? (
                            <p className="text-sm text-zinc-600 italic">Bu kullanıcının kayıtlı adresi yok.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {user.addresses.map((addr: any) => (
                                <div
                                  key={addr.id}
                                  className={`rounded-xl border p-4 space-y-2 text-sm ${
                                    addr.isDefault
                                      ? "border-amber-500/40 bg-amber-900/10"
                                      : "border-zinc-800 bg-zinc-900"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-zinc-200">
                                      {addr.title}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                        Varsayılan
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300">
                                    <UserIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                    <span>{addr.fullName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300">
                                    <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                    <span className="font-mono">{addr.phone}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-zinc-400 text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                      {addr.address}, {addr.district} / {addr.city}
                                      {addr.zipCode ? ` ${addr.zipCode}` : ""}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
