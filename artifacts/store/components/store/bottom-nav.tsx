"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2X2, ShoppingCart, User, Menu, Tag, ScanLine, X, LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const HIDDEN_CATEGORY_SLUGS = new Set(["belirtilmedi", "deneme", "diger", "other", "bilinmiyor"]);

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tapFeedback, setTapFeedback] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image?: string | null }[]>([]);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];
  const visibleCategories = categories.filter((category) => !HIDDEN_CATEGORY_SLUGS.has(category.slug));

  useEffect(() => {
    setMounted(true);
    fetch("/api/categories", { cache: "force-cache" })
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  if (!mounted) return null;

  const giveFeedback = (target: string) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
    setTapFeedback(target);
    window.setTimeout(() => setTapFeedback(null), 180);
  };

  const items = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/products", label: "Ürünler", icon: Grid2X2 },
    { href: "/scan", label: "Tara", icon: ScanLine },
    { href: "/cart", label: "Sepet", icon: ShoppingCart, badge: itemCount },
    { href: session ? "/account" : "/login", label: "Hesabım", icon: User },
  ];

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed safe-bottom-offset left-0 right-0 z-50 bg-[var(--surface)] dark:bg-[var(--surface)] border border-[var(--line)] rounded-t-3xl shadow-2xl p-4 md:hidden max-h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain"
            >
               <div className="flex items-center justify-between mb-4">
                 <div>
                    <p className="text-[10px] font-black tracking-[0.14em] text-[var(--gold)]">Göçmen Perde</p>
                   <p className="text-lg font-black text-[var(--ink)]">Menü</p>
                 </div>
                 <button onClick={() => setMenuOpen(false)} className="touch-target flex items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--ink-muted)]" aria-label="Menüyü kapat">
                   <X className="w-5 h-5" aria-hidden="true" />
                 </button>
               </div>
               {session && firstName && (
                  <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
                   <p className="text-[10px] font-black uppercase tracking-[.14em] text-amber-700">Hesabım</p>
                    <p className="mt-1 text-sm font-bold text-zinc-800">Hoş geldin, {firstName}</p>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="mt-1.5 inline-flex text-xs font-bold text-amber-700">Profilini ve siparişlerini gör →</Link>
                 </div>
               )}
                <p className="text-[11px] font-bold text-zinc-400 tracking-[0.12em] mb-2">Kategoriler</p>
               <div className="grid grid-cols-2 gap-2 mb-4">
                  {visibleCategories.length > 0 ? visibleCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/kategori/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                     className="flex min-h-[58px] min-w-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)]/45 px-2 py-2 text-[var(--ink)] transition-colors hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-zinc-800"
                  >
                     <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                      {c.image ? (
                         <Image src={c.image} alt="" width={32} height={32} className="h-full w-full object-cover" />
                      ) : (
                         <Tag aria-hidden={true} className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </div>
                     <span className="min-w-0 text-[11px] font-semibold leading-tight text-[var(--ink)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [overflow:hidden]">{c.name}</span>
                  </Link>
                 )) : (
                    <div className="col-span-2 rounded-xl bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--ink-muted)]">Kategoriler hazırlanıyor.</div>
                 )}
              </div>
              <div className="border-t border-zinc-100 pt-4 space-y-1">
                {session ? (
                  <>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="touch-target flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-zinc-800 text-[var(--ink)] font-medium">
                      Hesabım
                    </Link>
                     <Link href="/orders" onClick={() => setMenuOpen(false)} className="touch-target flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[var(--ink)] font-medium">
                      Siparişlerim
                    </Link>
                    {session.user?.role === "ADMIN" && (
                       <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="touch-target flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-50 text-amber-600 font-medium">
                        Admin Panel
                      </Link>
                    )}
                     <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="touch-target w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-500 font-medium">
                       <LogOut className="w-4 h-4" aria-hidden="true" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                   <Link href="/login" onClick={() => setMenuOpen(false)} className="touch-target flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--navy)] text-[var(--surface)] font-bold justify-center">
                    Giriş Yap
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--gold)]/20 bg-[var(--surface)]/96 shadow-[0_-12px_30px_rgba(36,59,67,.10)] backdrop-blur-xl dark:bg-[var(--surface)]/96 md:hidden safe-area-inset-bottom">
        <div className="flex items-center">
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                  onClick={() => giveFeedback(href)}
                   className={`touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all ${active ? "text-[var(--gold)]" : "text-[var(--ink-muted)]"} ${tapFeedback === href ? "scale-95" : ""}`}
                  aria-label={label}
                  data-testid={`link-bottom-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                 <div className={`relative rounded-xl px-3 py-1 transition-colors ${active ? "bg-[var(--gold-pale)]" : ""}`}>
                   <Icon aria-hidden={true} className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                  <span className={`text-[10px] font-semibold tracking-[-0.01em] ${active ? "font-bold text-[var(--gold)]" : ""}`}>{label}</span>
                 {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--gold)] rounded-full" />}
              </Link>
            );
          })}
          <button
             onClick={() => { giveFeedback("menu"); setMenuOpen(!menuOpen); }}
               className={`touch-target flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${menuOpen ? "text-[var(--gold)]" : "text-[var(--ink-muted)]"}`}
              data-testid="button-bottom-nav-menu"
          >
             <Menu aria-hidden={true} className="w-5 h-5" />
             <span className="text-[10px] font-semibold tracking-[-0.01em]">Menü</span>
          </button>
        </div>
         <span className="sr-only" aria-live="polite">{tapFeedback ? "Sayfa açılıyor" : ""}</span>
      </nav>
    </>
  );
}
