"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type TouchEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  Gift,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  Trophy,
  Ruler,
  Sun,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductImage from "@/components/store/product-image";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import BrandCatalog from "@/components/store/brand-catalog";
import {
  CurtainStorySection,
  CustomerProjectsSection,
  CustomerReviewsSection,
  InspirationSection,
} from "@/components/store/curtain-story-sections";
import { parseHomepageConfig, type HomepageSection } from "@/lib/homepage-config";

type Product = any;

const CATEGORY_ICONS = [Ruler, Sparkles, ShieldCheck, Heart, Gift, Tag, Truck, Star];
const CATEGORY_COLORS = ["#c49a3a", "#b88b2f", "#d1ae58", "#9f7a2c", "#d9bd78", "#8b6b2c", "#c6a45a", "#a98536"];

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  cta2Text?: string | null;
  cta2Href?: string | null;
  imageUrl?: string | null;
  gradient?: string | null;
  darkText?: boolean;
  productIds?: string[];
};

type BannerSlide = Banner & {
  eyebrow: string;
  accent: string;
  description: string;
  className: string;
  categorySlug?: string;
  categoryName?: string;
  categoryProducts?: Product[];
};

const CATEGORY_BANNER_DEFINITIONS = [
  {
    slug: "carsaf",
    eyebrow: "KONFORUN İLK DOKUNUŞU",
    title: "Yumuşak dokunuşla",
    accent: "güne güzel başlayın",
    description: "Yatak odanız için ferah, rahat ve özenli çarşaf seçeneklerini keşfedin.",
    gradient: "cream",
    darkText: true,
    ctaText: "Çarşafları keşfet",
    cta2Text: "Koleksiyonu gör",
  },
  {
    slug: "tul-perde",
    eyebrow: "TÜL PERDE KOLEKSİYONU",
    title: "Gün ışığını",
    accent: "zarafetle içeri alın",
    description: "Hafif dokular ve doğru pileyle odanıza ferahlık katan tül perdeler.",
    gradient: "ivory",
    darkText: true,
    ctaText: "Tül perdeleri keşfet",
    cta2Text: "Ölçü desteği al",
  },
  {
    slug: "plise-perde",
    eyebrow: "AKILLI PENCERE ÇÖZÜMÜ",
    title: "Her pencereye",
    accent: "sade bir uyum",
    description: "Modern çizgisi ve pratik kullanımıyla plise perdeler, her köşeye uyum sağlar.",
    gradient: "sage",
    darkText: false,
    ctaText: "Plise perdeleri keşfet",
    cta2Text: "Penceren için seç",
  },
  {
    slug: "stor-perde",
    eyebrow: "MODERN IŞIK KONTROLÜ",
    title: "Işığı kontrol edin,",
    accent: "yaşamı güzelleştirin",
    description: "Temiz çizgiler, kolay kullanım ve günün her saatine uyum sağlayan stor perdeler.",
    gradient: "amber",
    darkText: false,
    ctaText: "Stor perdeleri keşfet",
    cta2Text: "Modelleri incele",
  },
  {
    slug: "zebra-perde",
    eyebrow: "GÜNÜN RİTMİNE UYUM",
    title: "Işığı dilediğiniz gibi",
    accent: "ayarlayın",
    description: "Zebra perdelerle mahremiyet ve gün ışığı arasında pratik bir denge kurun.",
    gradient: "sand",
    darkText: true,
    ctaText: "Zebra perdeleri keşfet",
    cta2Text: "Seçenekleri gör",
  },
  {
    slug: "koltuk",
    eyebrow: "EVİNİZİN SEVİLEN KÖŞESİ",
    title: "Koltuklarınıza",
    accent: "yenilenen bir görünüm",
    description: "Yaşam alanınıza taze bir dokunuş katan kullanışlı ve şık koltuk seçenekleri.",
    gradient: "terracotta",
    darkText: false,
    ctaText: "Koltuk ürünlerini gör",
    cta2Text: "Yeni görünümü keşfet",
  },
  {
    slug: "ormetulperde",
    eyebrow: "DOKUSU GÖRÜNEN ŞIKLIK",
    title: "Karakteri olan",
    accent: "özgün bir atmosfer",
    description: "Örme tüllerin kendine özgü dokusuyla pencerenize sıcak ve seçkin bir ifade katın.",
    gradient: "plum",
    darkText: false,
    ctaText: "Örme tülleri keşfet",
    cta2Text: "Dokuları incele",
  },
  {
    slug: "guneslik",
    eyebrow: "GÜNEŞİN KEYFİ",
    title: "Güneşin keyfi,",
    accent: "rahatsız eden ışık olmadan",
    description: "Güneşlik perdelerle odalarınızı daha huzurlu, dengeli ve serin hissettirin.",
    gradient: "sky",
    darkText: true,
    ctaText: "Güneşlikleri keşfet",
    cta2Text: "Işık çözümlerini gör",
  },
  {
    slug: "fonperdeler",
    eyebrow: "DEKORASYONUN SON DOKUNUŞU",
    title: "Odanın karakterini",
    accent: "tek dokunuşla değiştirin",
    description: "Fon perdelerle renk, derinlik ve güçlü bir dekorasyon etkisi kazandırın.",
    gradient: "rose",
    darkText: false,
    ctaText: "Fon perdeleri keşfet",
    cta2Text: "Renkleri keşfet",
  },
] as const;

function money(value: unknown) {
  return `₺${Number(value || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
}

function getDiscount(product: Product) {
  if (!product.comparePrice) return 0;
  return Math.max(0, Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100));
}

function getFirstProductImage(product: Product): string | null {
  if (!Array.isArray(product?.images)) return null;
  const image = product.images.find(
    (value: unknown) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof image === "string" ? image.trim() : null;
}

function normalizeCategoryValue(value: unknown) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findCategory(categories: any[], keywords: string[]) {
  const normalizedKeywords = keywords.map(normalizeCategoryValue).filter(Boolean);
  return categories
    .map((category) => {
      const name = normalizeCategoryValue(category.name);
      const slug = normalizeCategoryValue(category.slug);
      const score = normalizedKeywords.reduce((best, keyword) => {
        if (name === keyword || slug === keyword) return Math.max(best, 100);
        if (name.startsWith(`${keyword} `) || slug.startsWith(`${keyword} `)) return Math.max(best, 80);
        return Math.max(best, name.includes(keyword) || slug.includes(keyword) ? 50 : 0);
      }, 0);
      return { category, score };
    })
    .filter(({ score }) => score >= 80)
    .sort((a, b) => b.score - a.score || String(a.category.name).length - String(b.category.name).length)[0]?.category;
}

function categoryHref(category: any | undefined, keywords: string[] = []) {
  if (category?.slug) return `/kategori/${category.slug}`;
  const query = keywords[0] ? encodeURIComponent(keywords[0]) : "";
  return query ? `/products?q=${query}` : "/products";
}

function BookBanner({
  products,
  fallbackProducts,
  banners,
  categories,
  categoryProducts,
}: {
  products: Product[];
  fallbackProducts: Product[];
  banners: Banner[];
  categories: any[];
  categoryProducts: Record<string, Product[]>;
}) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [failedProductIds, setFailedProductIds] = useState<Set<string>>(() => new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeTimer = useRef<number | null>(null);
  const featuredCovers = fallbackProducts.slice(0, 4);
  const productById = new Map(products.map((product) => [product.id, product]));
  const fallbackSlides = [
    {
      id: "fallback-curtain",
      eyebrow: "GÖÇMEN PERDE",
      title: "Yaşam alanınıza",
      accent: "doğru perdeyi seçin",
      description: "Özel ölçü, profesyonel dikim ve montaj hizmeti.",
      className: "book-banner--amber",
      ctaText: "Perdeleri keşfet",
      ctaHref: "/products",
      imageUrl: null,
      cta2Text: "Ücretsiz ölçü",
      cta2Href: "/contact",
      darkText: false,
    },
    {
      id: "fallback-measure",
      eyebrow: "ÖZEL ÖLÇÜ",
      title: "Pencerenize tam",
      accent: "uyum sağlayan çözümler",
      description: "Bursa içi ücretsiz keşif ve doğru ölçü desteği.",
      className: "book-banner--emerald",
      ctaText: "Ölçü iste",
      ctaHref: "/products",
      imageUrl: null,
      cta2Text: "Kategoriler",
      cta2Href: "/products",
      darkText: false,
    },
    {
      id: "fallback-collection",
      eyebrow: "PERDE KOLEKSİYONU",
      title: "Tül, fon, zebra",
      accent: "stor ve plise",
      description: "Bursa'nın 1993'ten beri güvenilir perdecisi.",
      className: "book-banner--rose",
      ctaText: "Koleksiyonu gör",
      ctaHref: "/products",
      imageUrl: null,
      cta2Text: "Hikâyemiz",
      cta2Href: "/about",
      darkText: false,
    },
  ];
  const categorySlides: BannerSlide[] = CATEGORY_BANNER_DEFINITIONS.map((definition) => {
    const category = categories.find(
      (candidate) => normalizeCategoryValue(candidate.slug) === normalizeCategoryValue(definition.slug),
    );
    return {
      id: `category-${definition.slug}`,
      title: definition.title,
      subtitle: definition.accent,
      badge: definition.eyebrow,
      ctaText: definition.ctaText,
      ctaHref: category?.slug ? `/kategori/${category.slug}` : `/kategori/${definition.slug}`,
      cta2Text: definition.cta2Text,
      cta2Href: "/contact",
      imageUrl: null,
      gradient: definition.gradient,
      darkText: definition.darkText,
      eyebrow: definition.eyebrow,
      accent: definition.accent,
      description: definition.description,
      className: `book-banner--${definition.gradient}`,
      categorySlug: definition.slug,
      categoryName: category?.name || definition.slug,
      categoryProducts: categoryProducts[definition.slug] ?? [],
      productIds: [],
    };
  });
  const adminSlides: BannerSlide[] = banners.map((banner) => ({
    ...banner,
    eyebrow: banner.badge || "GÖÇMEN PERDE",
    accent: banner.subtitle || "",
    description: banner.subtitle ? "" : "Seçili ürünleri keşfedin.",
    className: `book-banner--${banner.gradient || "amber"}`,
    productIds: banner.productIds ?? [],
  }));
  const slides: BannerSlide[] = categorySlides.length
    ? [...categorySlides, ...adminSlides]
    : fallbackSlides.map((slide) => ({ ...slide, productIds: [] }));
  useEffect(() => {
    if (isDragging || dragOffset !== 0) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, [dragOffset, isDragging, slides.length]);

  useEffect(() => {
    return () => {
      if (swipeTimer.current !== null) window.clearTimeout(swipeTimer.current);
    };
  }, []);

  const getSlideProducts = (slide: BannerSlide) => {
    const source = slide.categorySlug
      ? slide.categoryProducts ?? []
      : slide.productIds?.length
        ? slide.productIds
            .map((productId) => productById.get(productId))
            .filter((product): product is Product => Boolean(product))
        : featuredCovers;

    return source
      .filter((product) => Boolean(getFirstProductImage(product)))
      .filter((product) => !failedProductIds.has(product.id))
      .slice(0, 4);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    setIsDragging(false);
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    const touch = event.touches[0];
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 8) return;
    event.preventDefault();
    setIsDragging(true);
    setDragOffset(deltaX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    if (!start || end === undefined || slides.length < 2) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }
    const delta = end - start.x;
    if (Math.abs(delta) < 42) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }
    const direction = delta < 0 ? 1 : -1;
    setIsDragging(false);
    setDragOffset(direction === 1 ? -Math.max(window.innerWidth, 320) : Math.max(window.innerWidth, 320));
    if (swipeTimer.current !== null) window.clearTimeout(swipeTimer.current);
    swipeTimer.current = window.setTimeout(() => {
      setIndex((current) => (current + direction + slides.length) % slides.length);
      setDragOffset(0);
      swipeTimer.current = null;
    }, 360);
  };

  const activeSlide = slides[index] ?? slides[0];
  const activeProducts = activeSlide ? getSlideProducts(activeSlide) : [];

  return (
    <>
      <section
        className="book-banner book-banner--premium book-swipe-zone"
        aria-label="Perde kategorileri ve kampanyalar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`book-banner__track ${isDragging ? "is-dragging" : ""}`}
          style={{ transform: `translate3d(calc(${index * -100}% + ${dragOffset}px), 0, 0)` }}
        >
          {slides.map((slide, slideIndex) => (
            <article className={`book-banner__premium-slide ${slide.className} ${slide.darkText ? "book-banner--dark-text" : ""}`} key={slide.id || slideIndex}>
              <div className="book-banner__premium-copy">
                <p className="book-banner__premium-kicker">{slide.eyebrow}</p>
                <h1>
                  {slide.title}
                  {slide.accent && <strong>{slide.accent}</strong>}
                </h1>
                <p className="book-banner__premium-description">{slide.description}</p>
                {slide.ctaText !== null && (
                  <div className="book-banner__premium-actions">
                     <Link href={slide.ctaHref || "/products?featured=true"} className="book-banner__premium-primary">
                      {slide.ctaText || "Keşfet"} <span className="book-inline-arrow" aria-hidden="true" />
                    </Link>
                    {slide.cta2Text && (
                      <Link href={slide.cta2Href || "/products"} className="book-banner__premium-secondary">{slide.cta2Text}</Link>
                    )}
                  </div>
                )}
              </div>
              <div className="book-banner__premium-stage">
                <div className="book-banner__premium-halo" aria-hidden="true" />
                  <div className="book-banner__premium-products">
                    {slide === activeSlide && activeProducts.map((product, coverIndex) => (
                     <Link
                       href={`/products/${product.slug}`}
                       prefetch={false}
                       className="book-banner__premium-product"
                       key={`${product.id}-${coverIndex}`}
                       aria-label={`${product.name} ürününü incele`}
                       style={{ "--rotation": `${(coverIndex - 1.5) * 5}deg`, "--lift": `${Math.abs(coverIndex - 1.5) * 8}px` } as CSSProperties}
                     >
                        <ProductImage
                          src={product.images}
                          alt={product.name}
                          fill
                          sizes="(max-width: 767px) 76px, 122px"
                          className="book-banner__premium-product-image object-contain p-2"
                          priority={slideIndex === index && coverIndex === 0}
                          fallbackLabel=""
                          hideOnError
                          onImageError={() => {
                            setFailedProductIds((current) => {
                              if (current.has(product.id)) return current;
                              const next = new Set(current);
                              next.add(product.id);
                              return next;
                            });
                          }}
                        />
                       <span className="book-banner__premium-product-number">0{coverIndex + 1}</span>
                       <span className="book-banner__premium-product-label">{product.brand?.name || product.category?.name || "Seçki"}</span>
                     </Link>
                    ))}
                </div>
                <div className="book-banner__premium-meta">
                  <span>{slide.categoryName || slide.eyebrow}</span>
                  <strong>{String(slideIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button type="button" className="book-banner__arrow book-banner__arrow--left" onClick={() => setIndex((index - 1 + slides.length) % slides.length)} aria-label="Önceki kampanya"><span className="book-banner-arrow-glyph book-banner-arrow-glyph--left" aria-hidden="true" /></button>
            <button type="button" className="book-banner__arrow book-banner__arrow--right" onClick={() => setIndex((index + 1) % slides.length)} aria-label="Sonraki kampanya"><span className="book-banner-arrow-glyph book-banner-arrow-glyph--right" aria-hidden="true" /></button>
            <div className="book-banner__premium-nav">
              <div className="book-banner__premium-progress"><span style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
              <div className="book-banner__premium-count">{String(index + 1).padStart(2, "0")} — {String(slides.length).padStart(2, "0")}</div>
            </div>
          </>
        )}
      </section>
      {activeSlide?.categorySlug && activeSlide.categoryProducts?.length ? (
        <CategoryBannerProducts slide={activeSlide} />
      ) : null}
    </>
  );
}

function CategoryBannerProducts({ slide }: { slide: BannerSlide }) {
  const products = slide.categoryProducts ?? [];
  if (!products.length || !slide.categorySlug) return null;

  return (
    <section className="book-category-banner-products" aria-label={`${slide.categoryName || "Kategori"} ürünleri`}>
      <div className="book-section-width">
        <div className="book-category-banner-products__heading">
          <div>
            <span className="book-kicker">Bu kategoriden seçtiklerimiz</span>
            <h2>{slide.categoryName || "Perde seçkisi"}</h2>
            <p>Bu slayttaki kategoriye ait seçili ürünleri inceleyin.</p>
          </div>
          <Link href={`/kategori/${slide.categorySlug}`} className="book-all-link">
            Tümünü gör <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="book-category-banner-products__grid">
          {products.map((product, index) => (
            <ProductTile key={product.id} product={product} featured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryRail({ categories, section }: { categories: any[]; section: HomepageSection }) {
  const curated = [
    { label: "Öne çıkanlar", keywords: [], href: "/products?featured=true" },
    { label: "Tül perde", keywords: ["tül perde", "tul-perde"] },
    { label: "Fon perde", keywords: ["fon perde", "fonperdeler"] },
    { label: "Stor perde", keywords: ["stor perde", "stor-perde"] },
    { label: "Zebra perde", keywords: ["zebra perde", "zebra-perde"] },
    { label: "Plise perde", keywords: ["plise perde", "plise-perde"] },
  ];

  const links = curated.map((item, index) => {
    const category = item.keywords.length ? findCategory(categories, item.keywords) : undefined;
    return { ...item, category, href: item.href ?? categoryHref(category, item.keywords), Icon: CATEGORY_ICONS[index], color: CATEGORY_COLORS[index] };
  });

  return (
    <section className="book-category-section" aria-label={section.title}>
      <div className="book-section-width">
        {(section.title || section.subtitle) && (
          <div className="book-category-heading">
            {section.title && <h2>{section.title}</h2>}
            {section.subtitle && <p>{section.subtitle}</p>}
          </div>
        )}
        <div className="book-category-rail">
           {links.map(({ label, href, Icon, color }) => (
             <Link href={href} className="book-category-card" key={label}>
              <span className="book-category-icon" style={{ color }}>
                <Icon size={34} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
        <CurtainFinder categories={categories} />
      </div>
    </section>
  );
}

type CurtainFinderKey = "light" | "privacy" | "room";

const CURTAIN_FINDER_STEPS: Array<{
  key: CurtainFinderKey;
  label: string;
  question: string;
  options: Array<{ value: string; label: string; hint: string }>;
}> = [
  {
    key: "light",
    label: "Işık",
    question: "Odanızda nasıl bir gün ışığı istersiniz?",
    options: [
      { value: "soft", label: "Yumuşak ve ferah", hint: "Gün ışığı içeri süzülsün" },
      { value: "balanced", label: "Dengeli", hint: "Işık ve mahremiyet birlikte" },
      { value: "controlled", label: "Kontrollü", hint: "Parlama ve sıcaklık azalsın" },
    ],
  },
  {
    key: "privacy",
    label: "Mahremiyet",
    question: "Mahremiyet sizin için ne kadar önemli?",
    options: [
      { value: "light", label: "Hafif", hint: "Aydınlık ve açık bir atmosfer" },
      { value: "medium", label: "Dengeli", hint: "Gündüz konforlu bir perdeleme" },
      { value: "high", label: "Yüksek", hint: "Daha sakin ve korunaklı bir alan" },
    ],
  },
  {
    key: "room",
    label: "Yaşam alanı",
    question: "Perdeyi hangi alanda kullanacaksınız?",
    options: [
      { value: "living", label: "Salon", hint: "Dekorasyonun güçlü tamamlayıcısı" },
      { value: "bedroom", label: "Yatak odası", hint: "Huzurlu ve yumuşak bir atmosfer" },
      { value: "work", label: "Mutfak / çalışma alanı", hint: "Pratik ve kolay kullanım" },
    ],
  },
];

function getCurtainFinderRecommendation(answers: Partial<Record<CurtainFinderKey, string>>) {
  if (answers.room === "work" || answers.light === "controlled") {
    return {
      slug: answers.privacy === "high" ? "stor-perde" : "zebra-perde",
      title: "Zebra veya stor perde",
      description: "Işığı günün saatine göre ayarlayabileceğiniz, pratik bir çözüm.",
    };
  }
  if (answers.room === "bedroom" && answers.privacy === "high") {
    return {
      slug: "fonperdeler",
      title: "Fon perde",
      description: "Yatak odanıza derinlik ve daha korunaklı bir his kazandırır.",
    };
  }
  if (answers.light === "soft" || answers.privacy === "light") {
    return {
      slug: "tul-perde",
      title: "Tül perde",
      description: "Gün ışığını yumuşatır, odanıza ferah ve zarif bir görünüm verir.",
    };
  }
  return {
    slug: "fonperdeler",
    title: "Tül + fon perde",
    description: "Katmanlı kullanım ile hem gün ışığını hem de dekorasyonu kontrol edin.",
  };
}

function CurtainFinder({ categories }: { categories: any[] }) {
  const [answers, setAnswers] = useState<Partial<Record<CurtainFinderKey, string>>>({});
  const [step, setStep] = useState(0);
  const currentStep = CURTAIN_FINDER_STEPS[step];
  const isComplete = CURTAIN_FINDER_STEPS.every(({ key }) => answers[key]);
  const recommendation = getCurtainFinderRecommendation(answers);
  const category = findCategory(categories, [recommendation.slug]);
  const recommendationHref = categoryHref(category, [recommendation.slug]);

  const choose = (value: string) => {
    setAnswers((current) => ({ ...current, [currentStep.key]: value }));
    setStep((current) => Math.min(current + 1, CURTAIN_FINDER_STEPS.length - 1));
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <section className="book-curtain-finder" aria-label="Perde seçim rehberi">
      <div className="book-curtain-finder__intro">
        <div className="book-curtain-finder__seal" aria-hidden="true"><Sun size={19} strokeWidth={1.6} /></div>
        <div>
          <span className="book-kicker">Kişisel seçim rehberi</span>
          <h3>Size en uygun perdeyi bulun.</h3>
          <p>Üç kısa seçimle ışık, mahremiyet ve kullanım alanınıza uygun kategoriyi keşfedin.</p>
        </div>
      </div>

      <div className="book-curtain-finder__body">
        <div className="book-curtain-finder__steps" role="tablist" aria-label="Perde seçim adımları">
          {CURTAIN_FINDER_STEPS.map((item, index) => (
            <button
              type="button"
              role="tab"
              key={item.key}
              aria-selected={step === index}
              className={step === index ? "is-active" : answers[item.key] ? "is-complete" : ""}
              onClick={() => setStep(index)}
            >
              <span>0{index + 1}</span>
              {item.label}
            </button>
          ))}
        </div>

        {!isComplete ? (
          <div className="book-curtain-finder__question">
            <div className="book-curtain-finder__question-heading">
              <span>Adım {step + 1} / {CURTAIN_FINDER_STEPS.length}</span>
              <strong>{currentStep.question}</strong>
            </div>
            <div className="book-curtain-finder__options">
              {currentStep.options.map((option) => (
                <button
                  type="button"
                  className={answers[currentStep.key] === option.value ? "is-selected" : ""}
                  key={option.value}
                  onClick={() => choose(option.value)}
                >
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.hint}</small>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="book-curtain-finder__result">
            <div>
              <span className="book-curtain-finder__result-label">Sizin için önerimiz</span>
              <strong>{recommendation.title}</strong>
              <p>{recommendation.description}</p>
            </div>
            <div className="book-curtain-finder__result-actions">
              <Link href={recommendationHref} className="book-curtain-finder__result-link">
                Seçkiyi keşfet <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="book-curtain-finder__measure-link">Ölçü desteği al</Link>
              <button type="button" onClick={reset} aria-label="Perde seçim rehberini baştan başlat">
                <RotateCcw size={14} aria-hidden="true" /> Baştan başla
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BestsellerBookShowcase({ products, section }: { products: Product[]; section: HomepageSection }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const [loadedImageIds, setLoadedImageIds] = useState<Set<string>>(() => new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const markImageFailed = useCallback((productId: string) => {
    setFailedImageIds((current) => {
      if (current.has(productId)) return current;
      const next = new Set(current);
      next.add(productId);
      return next;
    });
  }, []);
  const markImageLoaded = useCallback((productId: string) => {
    setLoadedImageIds((current) => {
      if (current.has(productId)) return current;
      const next = new Set(current);
      next.add(productId);
      return next;
    });
  }, []);
  const books = useMemo(() => {
    const selected = section.productIds.length
      ? section.productIds
          .map((id) => products.find((product) => product.id === id))
          .filter(Boolean)
      : products;
    return selected
      .filter((product): product is Product => Boolean(product && getFirstProductImage(product)))
      .filter((product): product is Product => !failedImageIds.has(product.id))
      .filter((product): product is Product => product?.category?.slug === section.categorySlug)
      .slice(0, section.limit);
  }, [failedImageIds, products, section.categorySlug, section.limit, section.productIds]);

  const move = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + books.length) % books.length);
    setDragOffset(0);
  }, [books.length]);

  useEffect(() => {
    if (books.length < 2 || isDragging || dragOffset !== 0) return;
    const timer = window.setInterval(() => move(1), 4400);
    return () => window.clearInterval(timer);
  }, [books.length, dragOffset, isDragging, move]);

  useEffect(() => {
    setActiveIndex((current) => (books.length ? Math.min(current, books.length - 1) : 0));
  }, [books.length]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    setIsDragging(false);
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    const touch = event.touches[0];
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 8) return;
    event.preventDefault();
    setIsDragging(true);
    setDragOffset(deltaX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    if (!start || end === undefined) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }
    const delta = end - start.x;
    if (Math.abs(delta) >= 42) move(delta < 0 ? 1 : -1);
    else setDragOffset(0);
    setIsDragging(false);
  };

  if (!books.length) return null;

  const activeProduct = books[activeIndex];

  return (
    <section
      className="book-bestseller"
      aria-label="Haftanın en çok satan kitapları"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="book-section-width">
        <div className="book-bestseller__panel">
          <div className="book-bestseller__heading">
            <span className="book-bestseller__eyebrow">Göçmen kitap kulübü</span>
            <div className="book-bestseller__title-row">
              <h2>{section.title}</h2>
               <Link href={section.categorySlug ? `/kategori/${section.categorySlug}` : "/products"} className="book-bestseller__all-link">
                Tümünü göster <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {section.subtitle && <p className="book-bestseller__subtitle">{section.subtitle}</p>}
          </div>

          <div className="book-bestseller__stage">
            <span className="book-bestseller__shine book-bestseller__shine--one" />
            <span className="book-bestseller__shine book-bestseller__shine--two" />
            <div className="book-bestseller__orbit" aria-hidden="true" />
            <div className={`book-bestseller__stack ${isDragging ? "is-dragging" : ""}`} style={{ transform: `translateX(${dragOffset}px)` }}>
              {books.map((product, index) => {
                const rawOffset = (index - activeIndex + books.length) % books.length;
                const signedOffset = rawOffset > Math.floor(books.length / 2) ? rawOffset - books.length : rawOffset;
                const distance = Math.abs(signedOffset);
                if (distance > 2) return null;
                return (
                  <Link
                    href={`/products/${product.slug}`}
                    prefetch={false}
                    key={product.id}
                    className={`book-bestseller__cover ${signedOffset === 0 ? "is-active" : ""} ${loadedImageIds.has(product.id) ? "" : "invisible"}`}
                    style={{
                      zIndex: 10 - distance,
                      opacity: 1 - distance * .12,
                      transform: `translateX(calc(-50% + ${signedOffset * 92}px)) scale(${1 - distance * .13}) rotate(${signedOffset * 5}deg)`,
                    }}
                    aria-label={`${product.name} ürününü incele`}
                  >
                    <ProductImage
                      src={getFirstProductImage(product)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 767px) 174px, 250px"
                      className="object-contain p-3"
                      priority={signedOffset === 0}
                      fallbackLabel=""
                      hideOnError
                      onImageLoad={() => markImageLoaded(product.id)}
                      onImageError={() => markImageFailed(product.id)}
                    />
                  </Link>
                );
              })}
            </div>
            <button type="button" className="book-bestseller__arrow book-bestseller__arrow--left" onClick={() => move(-1)} aria-label="Önceki çok satan kitap">
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <button type="button" className="book-bestseller__arrow book-bestseller__arrow--right" onClick={() => move(1)} aria-label="Sonraki çok satan kitap">
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="book-bestseller__caption">
            <strong>{activeProduct.name}</strong>
            <span>{activeProduct.brand?.name || "Göçmen kitap seçkisi"}</span>
          </div>
          <div className="book-bestseller__dots" aria-label="Çok satan kitaplar arasında gezin">
            {books.map((product, index) => (
              <button
                type="button"
                key={product.id}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => { setActiveIndex(index); setDragOffset(0); }}
                aria-label={`${index + 1}. kitap`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BookShelfShowcase({ products, section }: { products: Product[]; section: HomepageSection }) {
  const shelf = products.slice(0, section.limit);
  if (!shelf.length) return null;

  return (
    <section className="book-shelf-section" aria-label="Haftanın seçtikleri vitrini">
      <div className="book-section-width">
        <div className="book-shelf-heading">
          <div>
            <span className="book-kicker">Editörün rafı</span>
            <h2>{section.title}</h2>
            <p>{section.subtitle}</p>
          </div>
           <Link href={section.categorySlug ? `/kategori/${section.categorySlug}` : "/products"} className="book-all-link">Rafın tamamı <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="book-shelf">
          {shelf.map((product, index) => (
            <Link
              href={`/products/${product.slug}`}
              prefetch={false}
              className={`book-shelf__item book-shelf__item--${index + 1}`}
              key={product.id}
            >
              <span className="book-shelf__rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="book-shelf__cover">
                <ProductImage
                  src={product.images?.[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 767px) 82px, 138px"
                  className="object-contain p-1"
                  fallbackLabel=""
                />
              </span>
              <span className="book-shelf__meta">
                <strong>{product.name}</strong>
                <small>{product.brand?.name || "Göçmen seçkisi"}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyDeal({ products, newProducts, section }: { products: Product[]; newProducts: Product[]; section: HomepageSection }) {
  const addItem = useCartStore((state) => state.addItem);
  const [adding, setAdding] = useState(false);
  const deal = [...products, ...newProducts]
    .filter((product, index, all) => product?.id && all.findIndex((item) => item.id === product.id) === index && getDiscount(product) > 0)
    .sort((a, b) => getDiscount(b) - getDiscount(a))[0];

  if (!deal) return null;
  const discount = getDiscount(deal);

  const addDealToCart = () => {
    if (!deal.stock || adding) return;
    addItem({ id: deal.id, slug: deal.slug, name: deal.name, price: Number(deal.price), image: deal.images?.[0] ?? "", quantity: 1 });
    setAdding(true);
    window.setTimeout(() => setAdding(false), 1300);
    toast.success("Fırsat sepete eklendi.", { style: { fontSize: "13px" } });
  };

  return (
    <section className="book-deal-section" aria-label="Günün fırsatı">
      <div className="book-section-width">
        <div className="book-deal">
          <div className="book-deal__copy">
            <span className="book-deal__eyebrow"><Tag size={13} aria-hidden="true" /> Günün fırsatı</span>
            <h2>{section.title}</h2>
            <p>{section.subtitle || `Seçili üründe %${discount} avantaj. Stoklar tükenmeden inceleyin.`}</p>
            <Link href={`/products/${deal.slug}`} prefetch={false} className="book-deal__link">Ürünü incele <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <Link href={`/products/${deal.slug}`} prefetch={false} className="book-deal__visual">
            <span className="book-deal__discount">-%{discount}</span>
            <span className="book-deal__image">
              <ProductImage src={deal.images} alt={deal.name} fill sizes="(max-width: 767px) 150px, 230px" className="object-contain p-4" fallbackLabel="Ürün" />
            </span>
          </Link>
          <div className="book-deal__product">
            <strong>{deal.name}</strong>
            <small>{deal.brand?.name || "Göçmen Perde"}</small>
            <div className="book-deal__price">
              <del>{money(deal.comparePrice)}</del>
              <b>{money(deal.price)}</b>
            </div>
            <button type="button" className={adding ? "is-added" : ""} onClick={addDealToCart} disabled={!deal.stock}>
              {adding ? <><Check size={14} /> Eklendi</> : deal.stock ? <>Sepete ekle <ShoppingCart size={14} /></> : "Tükendi"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumDiscovery({ categories, section }: { categories: any[]; section: HomepageSection }) {
  const modes = [
    { title: "Salon", note: "Zarif ışık dengesi", keywords: ["tul-perde", "fonperdeler"], Icon: Heart, accent: "#b1872f" },
    { title: "Yatak odası", note: "Daha iyi uyku", keywords: ["stor-perde", "guneslik"], Icon: ShieldCheck, accent: "#8f6b28" },
    { title: "Gün ışığı", note: "Pratik kontrol", keywords: ["zebra-perde", "plise-perde"], Icon: Sparkles, accent: "#c69e43" },
    { title: "Dekorasyon", note: "Son dokunuş", keywords: ["koltuk", "fonperdeler"], Icon: Gift, accent: "#a57b2b" },
  ];

  return (
    <section className="book-premium-discovery" aria-label="Alışverişe göre seçkiler">
      <div className="book-section-width">
        <div className="book-premium-heading">
          <div>
            <span className="book-kicker">Göçmen seçkileri</span>
            <h2>{section.title}</h2>
            <p>{section.subtitle}</p>
          </div>
          <Sparkles className="book-premium-heading__sparkle" size={23} aria-hidden="true" />
        </div>
        <div className="book-intent-grid">
          {modes.map(({ title, note, keywords, Icon, accent }) => {
            const category = findCategory(categories, keywords);
             return (
               <Link href={categoryHref(category, keywords)} className="book-intent-card" key={title}>
                <span className="book-intent-card__icon" style={{ color: accent }}>
                  <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="book-intent-card__copy"><strong>{title}</strong><small>{note}</small></span>
                <ArrowRight className="book-intent-card__arrow" size={15} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PremiumPerks({ section }: { section: HomepageSection }) {
  const perks = [
    { title: "Ücretsiz ölçü", note: "Bursa içi keşif ve doğru ölçü desteği.", Icon: Ruler },
    { title: "Profesyonel montaj", note: "Ölçüden kuruluma kadar özenli uygulama.", Icon: Truck },
    { title: "1993'ten beri", note: "Bursa'dan üç kuşağa ulaşan güvenilir alışveriş deneyimi.", Icon: Sparkles },
  ];

  return (
    <section className="book-premium-perks" aria-label="Göçmen güvencesi">
      <div className="book-section-width book-premium-perks__inner">
        <div className="book-premium-perks__intro">
          <span className="book-kicker">Göçmen güvencesi</span>
          <h2>{section.title}</h2>
          <p className="book-premium-perks__subtitle">{section.subtitle}</p>
          <Link href="/about" className="book-premium-perks__link">Hikayemizi keşfet <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className="book-perks-grid">
          {perks.map(({ title, note, Icon }) => (
            <div className="book-perk" key={title}>
              <span className="book-perk__icon">
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div><strong>{title}</strong><p>{note}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product, featured = false }: { product: Product; featured?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const hasWishlist = useWishlistStore((state) => state.has);
  const [adding, setAdding] = useState(false);
  const wished = hasWishlist(product.id);
  const discount = getDiscount(product);
  const rating = product.reviews?.length
    ? Math.round(product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length)
    : 5;

  const addToCart = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product.stock || adding) return;
    addItem({ id: product.id, productId: product.id, slug: product.slug, name: product.name, price: Number(product.price), image: product.images?.[0] ?? "", quantity: 1 });
    setAdding(true);
    window.setTimeout(() => setAdding(false), 1300);
    toast.success("Sepete eklendi.", { style: { fontSize: "13px" } });
  };

  const toggleFavorite = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.id, product.name, Number(product.price), product.images?.[0], product.slug);
  };

  return (
    <article className={`book-product-card ${featured ? "book-product-card--featured" : ""}`}>
      <div className="book-product-image">
        <Link href={`/products/${product.slug}`} prefetch={false} className="absolute inset-0">
          <ProductImage src={product.images} alt={product.name} fill sizes="(max-width: 640px) 230px, 280px" className="object-contain p-3" priority={featured} fallbackLabel="Görsel hazırlanıyor" />
          {discount > 0 && <span className="book-product-discount">%{discount}</span>}
        </Link>
        <button type="button" className={`book-product-heart ${wished ? "is-active" : ""}`} onClick={toggleFavorite} aria-label={wished ? "Favorilerden çıkar" : "Favorilere ekle"}><Heart size={15} fill={wished ? "currentColor" : "none"} /></button>
      </div>
      <div className="book-product-content">
        <Link href={`/products/${product.slug}`} prefetch={false} className="book-product-details">
          <div className="book-stars" aria-label={`${rating} yıldız puan`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={12} fill={star <= rating ? "currentColor" : "none"} />)}</div>
          <h3>{product.name}</h3>
          <p>{product.brand?.name || "Göçmen Perde"}</p>
          <div className="book-price-row">
            <div>
              {product.comparePrice && <del>{money(product.comparePrice)}</del>}
              <strong>{money(product.price)}</strong>
            </div>
            {discount > 0 && <b>%{discount}</b>}
          </div>
        </Link>
        <button type="button" className={`book-add-button ${adding ? "is-added" : ""}`} onClick={addToCart} disabled={!product.stock}>
          {adding ? <><Check size={15} /> Eklendi</> : product.stock ? <>Sepete Ekle <ShoppingCart size={15} /></> : "Tükendi"}
        </button>
      </div>
    </article>
  );
}

type ShowcaseVariant = "favorites" | "new";

function ProductShowcase({
  products,
  title,
  subtitle,
  limit = 8,
  variant = "favorites",
  href = "/products",
}: {
  products: Product[];
  title: string;
  subtitle: string;
  limit?: number;
  variant?: ShowcaseVariant;
  href?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeProduct, setActiveProduct] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isTouching = useRef(false);
  const visibleProducts = useMemo(() => products.slice(0, limit), [limit, products]);
  const tabbedProducts = useMemo(() => {
    if (activeTab === 1) return visibleProducts.slice().reverse();
    if (activeTab === 2) return visibleProducts.filter((product) => getDiscount(product) > 0);
    return visibleProducts;
  }, [activeTab, visibleProducts]);

  const getProductStep = () => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.querySelector<HTMLElement>(".book-product-card");
    const track = carousel?.querySelector<HTMLElement>(".book-carousel__track");
    if (firstCard) {
      const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap || "0") : 0;
      return firstCard.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
    }
    if (typeof window === "undefined") return 294;
    return window.innerWidth >= 768 ? 294 : Math.max(148, (window.innerWidth - 44) / 2) + 12;
  };

  useEffect(() => {
    setActiveProduct(0);
    const frame = window.requestAnimationFrame(() => {
      const carousel = carouselRef.current;
      if (!carousel || !tabbedProducts.length) return;
      carousel.scrollTo({ left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, tabbedProducts.length]);

  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;
    const count = tabbedProducts.length;
    if (!carousel || count < 1) return;

    const step = getProductStep();
    const relativeIndex = Math.round(carousel.scrollLeft / Math.max(step, 1));
    setActiveProduct(Math.min(count - 1, Math.max(0, relativeIndex)));
  }, [tabbedProducts.length]);

  const move = useCallback((direction: number) => {
    const carousel = carouselRef.current;
    const count = tabbedProducts.length;
    if (!carousel || count < 2) return;

    const step = getProductStep();
    const nextIndex = activeProduct + direction < 0
      ? count - 1
      : activeProduct + direction >= count
        ? 0
        : activeProduct + direction;
    carousel.scrollTo({
      left: nextIndex * step,
      behavior: Math.abs(nextIndex - activeProduct) > 1 ? "auto" : "smooth",
    });
    setActiveProduct(nextIndex);
  }, [activeProduct, tabbedProducts.length]);

  useEffect(() => {
    if (tabbedProducts.length < 2) return;
    const timer = window.setInterval(() => {
      if (!isTouching.current) move(1);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [activeTab, move, tabbedProducts.length]);

  if (!tabbedProducts.length) return null;

  const tabs = variant === "favorites"
    ? ["İlgi Görenler", "Çok Kaydedilenler", "Avantajlı Perdeler"]
    : ["Yeni Modeller", "Salon Seçkisi", "Özel Ölçü"];
  const kicker = variant === "favorites" ? "Göçmen Perde seçkisi" : "Yeni perde modelleri";
  const badge = variant === "favorites" ? "Çok tercih edilen" : "Yeni keşif";

  return (
    <section className={`book-showcase book-showcase--${variant}`}>
      <div className="book-section-width">
        <div className="book-showcase-heading">
          <div className="book-showcase-heading__copy">
            <div className="book-showcase-heading__top">
              <span className="book-kicker">{kicker}</span>
              <span className="book-showcase-badge">{badge}</span>
            </div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
           <Link href={href} className="book-all-link">Tümünü gör <ArrowRight size={15} aria-hidden="true" suppressHydrationWarning /></Link>
        </div>
        <div className="book-tabs" role="tablist" aria-label="Ürün vitrinleri">
          {tabs.map((tab, index) => (
            <button type="button" key={tab} className={index === activeTab ? "is-active" : ""} onClick={() => setActiveTab(index)} role="tab" aria-selected={index === activeTab}>{tab}</button>
          ))}
        </div>
        <div className="book-carousel-wrap">
          <button type="button" className="book-carousel-arrow book-carousel-arrow--left" onClick={() => move(-1)} aria-label="Önceki ürün"><ArrowLeft size={18} aria-hidden="true" suppressHydrationWarning /></button>
          <div
            ref={carouselRef}
            className="book-carousel book-swipe-zone"
            onScroll={handleScroll}
            onTouchStart={() => { isTouching.current = true; }}
            onTouchEnd={() => { isTouching.current = false; }}
            onTouchCancel={() => { isTouching.current = false; }}
          >
            <div className="book-carousel__track">
               {tabbedProducts.map((product, productIndex) => {
                 return <ProductTile key={`${product.id}-${productIndex}`} product={product} featured={productIndex === activeProduct} />;
              })}
            </div>
          </div>
          <button type="button" className="book-carousel-arrow book-carousel-arrow--right" onClick={() => move(1)} aria-label="Sonraki ürün"><ArrowRight size={18} aria-hidden="true" suppressHydrationWarning /></button>
        </div>
        <div className="book-carousel-footer">
          <div className="book-carousel-dots" aria-hidden="true">
            {tabbedProducts.slice(0, Math.min(tabbedProducts.length, 8)).map((product, index) => <span key={product.id} className={index === activeProduct ? "is-active" : ""} />)}
          </div>
          <span className="book-swipe-hint" aria-hidden="true"><ArrowLeft size={11} suppressHydrationWarning /> Parmağınla keşfet <ArrowRight size={11} suppressHydrationWarning /></span>
        </div>
      </div>
    </section>
  );
}

function getSectionProducts(section: HomepageSection, fallback: Product[], curated: Product[]) {
  const pool = [...curated, ...fallback].filter(
    (product, index, all) => product?.id && all.findIndex((item) => item.id === product.id) === index,
  );
  if (!section.productIds.length) return pool.slice(0, section.limit);
  return section.productIds
    .map((id) => pool.find((product) => product.id === id))
    .filter(Boolean)
    .slice(0, section.limit);
}

function BrandDetailBand({ section }: { section: HomepageSection }) {
  return (
    <div className="book-brand-detail" aria-label="Göçmen marka bilgisi">
      <div className="book-section-width book-brand-detail__inner">
        <span className="book-brand-detail__seal" aria-hidden="true">B / 93</span>
        <p><strong>{section.title}</strong> {section.subtitle}</p>
        <span className="book-brand-detail__since">1993&apos;ten beri</span>
        <Link href="/about" className="book-brand-detail__link">Hikâyemiz <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

export default function BookstoreHome({
  products,
  newProducts,
  curatedProducts = [],
  categories,
  brands,
  banners = [],
  categoryProducts = {},
  homepageConfig,
}: {
  products: Product[];
  newProducts: Product[];
  curatedProducts?: Product[];
  categories: any[];
  brands: any[];
  banners?: Banner[];
  categoryProducts?: Record<string, Product[]>;
  homepageConfig?: string | null;
}) {
  const config = parseHomepageConfig(homepageConfig);
  const allProducts = [...curatedProducts, ...products].filter(
    (product, index, all) => product?.id && all.findIndex((item) => item.id === product.id) === index,
  );

  return (
    <div className="bookstore-home">
      {config.sections.filter((section) => section.visible).map((section) => {
        switch (section.id) {
          case "banner":
            return (
              <BookBanner
                key={section.id}
                products={allProducts.length ? allProducts : newProducts}
                fallbackProducts={products.length ? products : newProducts}
                banners={banners}
                categories={categories}
                categoryProducts={categoryProducts}
              />
            );
          case "brandSignature":
            return <BrandDetailBand key={section.id} section={section} />;
          case "editorShelf":
            return <BookShelfShowcase key={section.id} products={getSectionProducts(section, products.length ? products : newProducts, curatedProducts)} section={section} />;
          case "categories":
            return <CategoryRail key={section.id} categories={categories} section={section} />;
          case "brands":
            return <BrandCatalog key={section.id} brands={brands} title={section.title} subtitle={section.subtitle} />;
          case "story":
            return <CurtainStorySection key={section.id} section={section} />;
          case "projects":
            return <CustomerProjectsSection key={section.id} section={section} />;
          case "reviews":
            return <CustomerReviewsSection key={section.id} section={section} />;
          case "inspiration":
            return <InspirationSection key={section.id} section={section} />;
          case "featured":
             return <ProductShowcase key={section.id} products={getSectionProducts(section, products, curatedProducts)} title={section.title} subtitle={section.subtitle} limit={section.limit} variant="favorites" href={section.categorySlug ? `/kategori/${section.categorySlug}` : "/products"} />;
          case "dailyDeal":
            return <DailyDeal key={section.id} products={getSectionProducts(section, allProducts, curatedProducts)} newProducts={newProducts} section={section} />;
          case "discovery":
            return <PremiumDiscovery key={section.id} categories={categories} section={section} />;
          case "perks":
            return <PremiumPerks key={section.id} section={section} />;
          case "new":
             return <ProductShowcase key={section.id} products={getSectionProducts(section, newProducts, curatedProducts)} title={section.title} subtitle={section.subtitle} limit={section.limit} variant="new" href={section.categorySlug ? `/kategori/${section.categorySlug}` : "/products"} />;
          default:
            return null;
        }
      })}
    </div>
  );
}