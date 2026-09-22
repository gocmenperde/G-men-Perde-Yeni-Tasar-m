"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  House,
  Heart,
  Home,
  Info,
  Menu,
  Moon,
  Package,
  Layers3,
  PanelTop,
  Sun,
  Percent,
  PhoneCall,
  ScanLine,
  Settings,
  ShoppingCart,
  type LucideIcon,
  User,
  X,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import SearchOverlay from "@/components/store/search-overlay";
import CartDrawer from "@/components/store/cart-drawer";
import ProductImage from "@/components/store/product-image";
import { getCategoryImage, getCuratedCategoryImage } from "@/lib/taxonomy-images";

function SearchGlyph({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block h-4 w-4 shrink-0 ${className}`} aria-hidden="true">
      <span className="absolute left-[1px] top-[1px] h-[11px] w-[11px] rounded-full border-[1.5px] border-current" />
      <span className="absolute bottom-[1px] right-0 h-[6px] w-[1.5px] origin-top rotate-[-45deg] rounded-full bg-current" />
    </span>
  );
}

function NavIcon({
  icon: Icon,
  hydrated,
  size,
  className = "",
}: {
  icon: LucideIcon;
  hydrated: boolean;
  size?: number;
  className?: string;
}) {
  if (!hydrated) {
    return <span className={`book-nav-icon-placeholder ${className}`} style={size ? { width: size, height: size } : undefined} aria-hidden="true" />;
  }
  return <Icon size={size} className={className} aria-hidden="true" />;
}

const MENU_GROUPS = [
  { label: "Tül Perdeler", icon: PanelTop, href: "/kategori/tul-perde", items: ["Tül perde modelleri", "Özel ölçü tül", "Pileli tül perdeler"] },
  { label: "Fon Perdeler", icon: Layers3, href: "/kategori/fonperdeler", items: ["Salon fon perdeleri", "Yatak odası fonları", "Fon perde kumaşları"] },
  { label: "Stor & Zebra", icon: Sun, href: "/kategori/stor-perde", items: ["Stor perde", "Zebra perde", "Blackout perde"] },
  { label: "Plise Perdeler", icon: House, href: "/kategori/plise-perde", items: ["Plise perde modelleri", "Güneşlik plise", "Özel ölçü plise"] },
  { label: "Koltuk Örtüleri", icon: FileText, href: "/kategori/koltuk", items: ["Koltuk örtüsü", "Özel ölçü", "Dekorasyon"] },
];

const MOBILE_CATEGORY_GROUPS = [
  { label: "Tül Perdeler", icon: PanelTop, keywords: ["tül", "tul"], fallbackHref: "/kategori/tul-perde", item: "Zarif · aydınlık · özel ölçü" },
  { label: "Fon Perdeler", icon: Layers3, keywords: ["fon"], fallbackHref: "/kategori/fonperdeler", item: "Salon · yatak odası · dekorasyon" },
  { label: "Stor & Zebra", icon: Sun, keywords: ["stor", "zebra"], fallbackHref: "/kategori/stor-perde", item: "Güneş kontrolü · modern çözüm" },
  { label: "Plise Perdeler", icon: House, keywords: ["plise"], fallbackHref: "/kategori/plise-perde", item: "Pratik · şık · özel ölçü" },
  { label: "Koltuk Örtüleri", icon: FileText, keywords: ["koltuk"], fallbackHref: "/kategori/koltuk", item: "Koruma · yenileme · uyum" },
];

interface NavbarProps {
  logoUrl?: string | null;
  siteName?: string | null;
  categories?: { id: string; name: string; slug: string; image?: string | null; _count?: { products: number } }[];
}

export default function Navbar({ logoUrl = null, siteName = "Göçmen Perde", categories = [] }: NavbarProps = {}) {
  const itemCount = useCartStore((state) => state.itemCount());
  const wishCount = useWishlistStore((state) => state.count());
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleItemCount = hydrated ? itemCount : 0;
  const visibleWishCount = hydrated ? wishCount : 0;

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, []);

  const navTone = (href: string) => pathname === href ? "bg-[var(--gold-pale)] text-[var(--navy)]" : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)]";
  const accountHref = session ? "/account" : "/login";
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];
  const brandDescriptor = siteName?.toLocaleLowerCase("tr-TR").includes("perde")
    ? "Perde & Ev Tekstili"
    : "Perde & Ev Tekstili";
  const menuCategories: NonNullable<NavbarProps["categories"]> = categories.length
    ? categories.slice(0, 12)
    : MENU_GROUPS.map(({ label, href }) => ({ id: href, name: label, slug: href.split("/").pop() ?? "" }));
  const mobileCategoryGroups = MOBILE_CATEGORY_GROUPS.map((group) => {
    const category = categories.find((candidate) => {
      const value = `${candidate.name} ${candidate.slug}`.toLocaleLowerCase("tr-TR");
      return group.keywords.some((keyword) => value.includes(keyword));
    });
    return {
      ...group,
      category,
      href: category ? `/kategori/${category.slug}` : group.fallbackHref,
    };
  });

  return (
    <>
      <header className={`book-store-header min-h-16 border-b transition-shadow ${scrolled ? "border-[var(--line)] bg-white/95 shadow-[0_8px_24px_rgba(40,40,40,.08)] backdrop-blur-xl" : "border-transparent bg-white/95 backdrop-blur-md"}`}>
        <div className="book-mobile-header md:hidden">
          <div className="book-mobile-header__top">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="book-mobile-icon" aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={menuOpen}>
              <NavIcon icon={menuOpen ? X : Menu} hydrated={hydrated} size={23} />
            </button>
            <Link href="/" className="book-mobile-logo" aria-label={siteName ?? "Göçmen Perde"}>
              {logoUrl ? (
                <Image src={logoUrl} alt={`${siteName} logo`} width={68} height={34} unoptimized priority />
              ) : (
                <span className="book-mobile-logo__fallback-mark" aria-hidden="true"><NavIcon icon={PanelTop} hydrated={hydrated} size={18} /></span>
              )}
               <span className="book-mobile-logo__copy"><b>Göçmen</b><small>{brandDescriptor}</small></span>
            </Link>
            <div className="book-mobile-actions">
              <Link href={accountHref} className="book-mobile-icon" aria-label={session ? "Hesabım" : "Giriş yap"}><NavIcon icon={User} hydrated={hydrated} size={21} /></Link>
              <button type="button" onClick={() => setCartOpen(true)} className="book-mobile-icon book-mobile-cart" aria-label="Sepeti aç"><NavIcon icon={ShoppingCart} hydrated={hydrated} size={21} />{visibleItemCount > 0 && <span>{visibleItemCount > 9 ? "9+" : visibleItemCount}</span>}</button>
            </div>
          </div>
          <button type="button" onClick={() => setSearchOpen(true)} className="book-mobile-search" aria-label="Ürün ara">
            <SearchGlyph className="text-[#bfc1c4]" />
            <span>Aradığınız ürünün adını yazınız.</span>
          </button>
        </div>
        <div className="mx-auto hidden h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 md:flex">
          <Link
            href="/"
             className="book-brand-lockup group flex min-w-0 shrink-0 items-center gap-2.5"
              aria-label={siteName ?? "Göçmen Perde"}
          >
            {logoUrl ? (
               <div suppressHydrationWarning className="book-brand-mark flex h-9 w-[50px] items-center rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] px-1.5 sm:w-auto sm:max-w-[118px]">
                <Image src={logoUrl} alt={`${siteName} logo`} width={108} height={34} sizes="(max-width: 640px) 50px, 108px" unoptimized className="h-full w-full object-contain sm:w-auto" priority />
              </div>
            ) : (
               <span suppressHydrationWarning className="book-brand-mark grid h-9 w-9 place-items-center rounded-xl bg-[var(--navy)] text-[#F3D08E] transition-transform group-hover:-rotate-3" aria-hidden="true">
                <span className="relative block h-4 w-4 rotate-[-42deg]">
                  <span className="absolute left-1/2 top-0 h-3.5 w-[2px] -translate-x-1/2 rounded-full bg-current" />
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-current" />
                </span>
              </span>
            )}
             <span suppressHydrationWarning className="book-brand-copy min-w-0 leading-none">
               <strong className="block font-display text-[14px] tracking-[.02em] text-[var(--navy)] sm:text-[16px]">Göçmen</strong>
              <small className="mt-1 block whitespace-nowrap text-[7px] font-extrabold tracking-[.08em] text-[var(--ink-muted)] sm:text-[8px] sm:tracking-[.12em]">
                 {brandDescriptor}
              </small>
            </span>
             <span suppressHydrationWarning className="book-brand-rule" aria-hidden="true" />
          </Link>

          <nav className="ml-3 hidden items-center gap-1 md:flex">
            <div className="relative">
              <button type="button" onClick={() => setCategoriesOpen((open) => !open)} aria-expanded={categoriesOpen} className={`flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold transition-colors ${categoriesOpen ? "bg-[var(--gold-pale)] text-[var(--navy)]" : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)]"}`}>
                Kategoriler <NavIcon icon={ChevronDown} hydrated={hydrated} className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[650px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(38,50,56,.16)]">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--gold)]">Rafını seç</p>
                      <p className="mt-1 text-sm font-extrabold text-[var(--navy)]">Kategoriye göre keşfet</p>
                    </div>
                    <Link href="/products" className="text-xs font-bold text-[var(--gold)] hover:text-[var(--navy)]">Tüm kategoriler →</Link>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {menuCategories.map((category) => (
                      <Link
                        href={`/kategori/${category.slug}`}
                        key={category.id}
                        className="flex min-h-14 items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition-colors hover:border-[var(--gold-light)] hover:bg-[var(--gold-pale)]"
                      >
                        <span className="min-w-0 truncate">{category.name}</span>
                        {category._count?.products ? <span className="shrink-0 text-[10px] font-semibold text-[var(--ink-muted)]">{category._count.products}</span> : null}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-4 border-t border-[var(--line)] pt-4 text-xs font-bold">
                    <Link href="/products" className="text-[var(--navy)] hover:text-[var(--gold)]">Tüm ürünler</Link>
                    <Link href="/products?sale=true" className="inline-flex items-center gap-1 text-[var(--gold)]"><Percent className="h-3 w-3" /> İndirimliler</Link>
                  </div>
                </div>
              )}
            </div>
            {[["Ürünler", "/products"], ["Hakkımızda", "/about"], ["İletişim", "/contact"]].map(([label, href]) => <Link key={href} href={href} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${navTone(href)}`}>{label}</Link>)}
          </nav>

          <div className="ml-auto hidden min-w-0 max-w-[310px] flex-1 md:block">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Ürün ara" className="flex min-h-10 w-full items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-left text-xs font-semibold text-[var(--ink-muted)] hover:border-[var(--gold-light)]">
              <SearchGlyph className="text-[var(--gold)]" /><span className="flex-1 truncate">Ürün, marka veya barkod ara</span><kbd className="hidden rounded border border-[var(--line)] px-1.5 py-0.5 text-[9px] lg:inline">⌘ K</kbd>
            </button>
          </div>
          <Link href="/scan" className="hidden rounded-lg p-2.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)] md:block" aria-label="Barkod tara"><NavIcon icon={ScanLine} hydrated={hydrated} className="h-4 w-4" /></Link>

           <Link href={accountHref} className="hidden rounded-lg bg-[var(--navy)] px-3.5 py-2.5 text-xs font-extrabold text-[var(--surface)] md:block">{session ? "Hesabım" : "Giriş yap"}</Link>
          <button type="button" onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")} className="touch-target rounded-lg p-2.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]" aria-label="Tema değiştir">
            <span className="relative block h-[18px] w-[18px]" aria-hidden="true">
              <NavIcon icon={Moon} hydrated={hydrated} className="absolute inset-0 block h-[18px] w-[18px] transition-transform duration-200 dark:hidden" />
              <span className="absolute inset-[2px] hidden rounded-full border-2 border-current dark:block">
                <span className="absolute -inset-[5px] rounded-full border border-current/35" />
              </span>
            </span>
          </button>
           <button type="button" onClick={() => setCartOpen(true)} className="touch-target relative rounded-lg p-2.5 text-[var(--navy)] hover:bg-[var(--surface-muted)]" aria-label="Sepeti aç"><NavIcon icon={ShoppingCart} hydrated={hydrated} className="h-[18px] w-[18px]" />{visibleItemCount > 0 && <span className="absolute right-0 top-0 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-[var(--gold)] px-1 text-[9px] font-extrabold text-white">{visibleItemCount > 99 ? "99+" : visibleItemCount}</span>}</button>
           <Link href="/wishlist" className="touch-target relative hidden rounded-lg p-2.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] sm:block" aria-label="Favoriler"><NavIcon icon={Heart} hydrated={hydrated} className="h-[18px] w-[18px]" />{visibleWishCount > 0 && <span className="absolute right-0 top-0 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-[var(--gold)] text-[9px] font-bold text-white">{visibleWishCount}</span>}</Link>
           <button type="button" onClick={() => setSearchOpen(true)} className="touch-target rounded-lg p-2.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] md:hidden" aria-label="Arama"><SearchGlyph /></button>
        </div>
      </header>

      {menuOpen && (
        <div id="store-mobile-menu" className="book-mobile-menu fixed inset-x-0 z-40 border-b border-[var(--line)] bg-[var(--surface)] shadow-xl md:hidden" style={{ top: "calc(112px + env(safe-area-inset-top, 0px))" }}>
          <div className="book-mobile-menu__inner mx-auto max-w-7xl px-4 py-4">
            <button type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="book-mobile-search-trigger">
              <SearchGlyph className="text-[var(--gold)]" /> Ürün, marka veya barkod ara <span>⌘K</span>
            </button>

            <div className="book-mobile-account-card">
              <span className="book-mobile-account-card__eyebrow">{session ? "Hesabım" : "Göçmen Perde"}</span>
              <strong>{session && firstName ? `Hoş geldin, ${firstName}` : "İlham veren raflara hoş geldin"}</strong>
              <Link href={accountHref} onClick={() => setMenuOpen(false)}>
                {session ? "Profil ve siparişlerim →" : "Giriş yap veya hesap oluştur →"}
              </Link>
            </div>

            <div className="book-mobile-quick-grid">
              {[
                { label: "Ana sayfa", href: "/", icon: Home },
                { label: "Tüm ürünler", href: "/products", icon: Package },
                { label: "İndirimliler", href: "/products?sale=true", icon: Percent },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="book-mobile-quick-link">
                  <NavIcon icon={Icon} hydrated={hydrated} size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="book-mobile-menu__section">
              <div className="book-mobile-menu__section-heading">
                <div>
                  <span className="book-mobile-menu__kicker">Rafını seç</span>
                  <strong>Kategoriler</strong>
                </div>
                <Link href="/products" onClick={() => setMenuOpen(false)}>Tümünü gör</Link>
              </div>
              <div className="book-mobile-category-grid">
                {mobileCategoryGroups.map(({ label, icon: Icon, item, href, category }) => (
                  <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="book-mobile-category-card">
                    <span className="book-mobile-category-card__visual">
                      {category ? (
                        <ProductImage
                          src={getCategoryImage(category)}
                          fallbackSrc={getCuratedCategoryImage(category.slug)}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          fallbackLabel=""
                        />
                      ) : (
                        <NavIcon icon={Icon} hydrated={hydrated} size={18} />
                      )}
                    </span>
                    <span className="book-mobile-category-card__copy">
                      <strong>{label}</strong>
                      <small>{item}</small>
                    </span>
                    <span className="book-mobile-category-card__arrow">↗</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="book-mobile-menu__footer">
              <Link href="/about" onClick={() => setMenuOpen(false)}><NavIcon icon={Info} hydrated={hydrated} size={14} /> Hakkımızda</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}><NavIcon icon={PhoneCall} hydrated={hydrated} size={14} /> İletişim</Link>
              {session && <Link href="/orders" onClick={() => setMenuOpen(false)}><NavIcon icon={FileText} hydrated={hydrated} size={14} /> Siparişlerim</Link>}
            </div>
          </div>
        </div>
      )}
      <SearchOverlay open={searchOpen} initialQuery="" onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}