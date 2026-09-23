"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, Ticket, Award,
  LogOut, Store, X, Settings, Layers,
  Percent, ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/products",  label: "Ürünler",   icon: Package },
      { href: "/admin/products/bulk-update", label: "Toplu Ürün Güncellemesi", icon: Layers },
    ],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/banners",    label: "Banner Yönetimi", icon: Layers },
      { href: "/admin/categories", label: "Kategoriler",     icon: Tags },
      { href: "/admin/brands",     label: "Markalar",        icon: Award },
    ],
  },
  {
    label: "Mağaza",
    items: [
      { href: "/admin/orders",       label: "Siparişler",   icon: ShoppingCart },
      { href: "/admin/users",        label: "Kullanıcılar", icon: Users },
      { href: "/admin/coupons",      label: "Kuponlar",     icon: Ticket },
      { href: "/admin/premium",      label: "Premium Üyelik", icon: Award },
      { href: "/admin/bulk-discount",label: "Toplu İndirim",icon: Percent },
        { href: "/admin/settings?tab=homepage", label: "Ana Sayfa Düzeni", icon: LayoutDashboard },
      { href: "/admin/settings",     label: "Site Ayarları",icon: Settings },
    ],
  },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity lg:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside className={`w-64 bg-zinc-950 text-zinc-300 flex flex-col h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 lg:translate-x-0 border-r border-zinc-800/60 ${open ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-zinc-900" />
            </div>
            <div>
              <p className="text-sm font-black text-white tracking-tight">GÖÇMEN</p>
              <p className="text-[10px] text-zinc-500 -mt-0.5 tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
            aria-label="Menüyü kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-3 px-3" style={{ WebkitOverflowScrolling: "touch" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-5" : ""}>
              {group.label && (
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const routePath = href.split("?")[0];
                  const active = pathname === routePath || pathname.startsWith(routePath + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100 border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      <span className="flex-1 truncate">{label}</span>
                      {active && <ChevronRight className="w-3 h-3 text-amber-500/60 flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-zinc-800/60 space-y-0.5 flex-shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-200 transition-colors border border-transparent"
          >
            <Store className="w-4 h-4 flex-shrink-0" />
            <span>Mağazaya Git</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500/80 hover:bg-red-950/40 hover:text-red-400 transition-colors border border-transparent"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
