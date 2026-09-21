"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Camera,
  ChevronRight,
  Gift,
  ImagePlus,
  Package,
  PackagePlus,
  Plus,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Truck,
  X,
  Search,
  User,
  Menu,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

type Category = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  image?: string;
};
type Brand = { id: string; name: string; image?: string };

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  source?: "original" | "fake";
};

type Product = {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  comparePrice: number;
  image: string;
  shippingCost: number;
  freeShipping: boolean;
  reviews: Review[];
};

type Coupon = {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  image: string;
};

const PLACEHOLDER_IMAGE = "";

function makeSampleImage(title: string, emoji: string, from: string, to: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 650'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs><rect width='900' height='650' rx='48' fill='url(#bg)'/><circle cx='690' cy='150' r='110' fill='rgba(255,255,255,0.35)'/><circle cx='190' cy='510' r='140' fill='rgba(255,255,255,0.22)'/><text x='450' y='275' text-anchor='middle' font-size='150'>${emoji}</text><rect x='120' y='380' width='660' height='120' rx='36' fill='rgba(255,255,255,0.9)'/><text x='450' y='455' text-anchor='middle' font-family='Arial, sans-serif' font-size='42' font-weight='800' fill='#18181b'>${title}</text><text x='450' y='540' text-anchor='middle' font-family='Arial, sans-serif' font-size='26' font-weight='700' fill='#78350f'>Göçmen Kırtasiye</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function isLikelyImageSource(value: string) {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

function buildFallbackProductImage(productName: string, categoryEmoji: string) {
  return makeSampleImage(productName.slice(0, 28), categoryEmoji || "🛍️", "#fef9c3", "#fb923c");
}

const initialCategories: Category[] = [
  { id: "defter", name: "Defter & Kağıt", emoji: "📒", description: "Çizgili, kareli, spiralli defter ve fotokopi kağıdı" },
  { id: "kalem", name: "Kalem & Yazım", emoji: "✏️", description: "Kurşun, tükenmez, keçeli, fosforlu ve uçlu kalemler" },
  { id: "boya", name: "Boya & Sanat", emoji: "🎨", description: "Pastel, sulu boya, akrilik, fırça ve hobi setleri" },
  { id: "canta", name: "Çanta & Matara", emoji: "🎒", description: "Okul çantası, beslenme çantası, matara ve suluk" },
  { id: "ofis", name: "Ofis & Dosyalama", emoji: "📎", description: "Klasör, zımba, ataş, etiket, arşiv ve masaüstü ürünleri" },
  { id: "kitap", name: "Kitap & Yardımcı", emoji: "📚", description: "Okuma kitabı, test kitabı ve yardımcı kaynak seçenekleri" },
  { id: "silgi-kalemtras", name: "Silgi & Kalemtıraş", emoji: "🧽", description: "Kokusuz silgi, hazneli kalemtıraş ve düzeltici ürünler" },
  { id: "yapistirici", name: "Yapıştırıcı & Bant", emoji: "🧴", description: "Stick yapıştırıcı, sıvı yapıştırıcı, koli bandı ve makas" },
  { id: "oyuncak-egitici", name: "Eğitici Oyuncak", emoji: "🧩", description: "Okul öncesi gelişim, puzzle ve öğrenme kartları" },
  { id: "sinav-hazirlik", name: "Sınav Hazırlık", emoji: "📝", description: "Deneme, soru bankası, optik form ve sınav aksesuarları" },
];

const initialBrands: Brand[] = [
  { id: "faber-castell", name: "Faber-Castell", image: makeSampleImage("Faber-Castell", "✒️", "#ecfeff", "#dbeafe") },
  { id: "bic", name: "BIC", image: makeSampleImage("BIC", "🖊️", "#fef3c7", "#fde68a") },
  { id: "stabilo", name: "Stabilo", image: makeSampleImage("Stabilo", "🖍️", "#fee2e2", "#fecaca") },
  { id: "pensan", name: "Pensan", image: makeSampleImage("Pensan", "📝", "#dbeafe", "#bfdbfe") },
];

const reviewNames = ["Ayşe Yılmaz", "Mehmet Demir", "Elif Kaya", "Can Özkan", "Zeynep Şahin", "Emre Çelik", "Derya Arslan", "Mert Aydın"];
const reviewTexts = [
  "Paketleme çok özenliydi, okul alışverişim hızlıca tamamlandı.",
  "Ürün kalitesi fiyatına göre çok iyi, tekrar sipariş vereceğim.",
  "Renkleri canlı ve çocuklar severek kullanıyor.",
  "Kargo bilgilendirmesi netti, ürün sorunsuz geldi.",
  "Mağaza iletişimi başarılı, stok bilgisi doğru görünüyor.",
  "Hediye paketi gibi temiz hazırlanmış, tavsiye ederim.",
];
const fakeReviewPool = [
  "Kumaş kalitesi beklediğimden iyi, dokusu yumuşak.",
  "Renk ekrandakiyle aynı geldi, teşekkürler.",
  "Dikişleri düzgün, ev için şık bir seçim oldu.",
  "Fiyat/performans açısından gerçekten iyi.",
  "Kısa sürede elime ulaştı, memnun kaldım.",
];

const initialProducts: Product[] = [
  { id: "p1", name: "Spiralli Okul Defteri 120 Yaprak", categoryId: "defter", brandId: "faber-castell", price: 74.9, comparePrice: 99.9, image: makeSampleImage("Spiralli Defter", "📒", "#fef3c7", "#f97316"), shippingCost: 34.9, freeShipping: false, reviews: [{ id: "r1", name: "Ayşe Yılmaz", rating: 5, text: "Sayfaları kalın, çantada kıvrılmadı." }, { id: "r2", name: "Mert Aydın", rating: 4, text: "Fiyat performans ürünü, paketleme güzeldi." }] },
  { id: "p2", name: "Pastel Boya 24 Renk Jumbo Set", categoryId: "boya", brandId: "stabilo", price: 189.9, comparePrice: 249.9, image: makeSampleImage("24 Renk Pastel Boya", "🎨", "#fde68a", "#ec4899"), shippingCost: 0, freeShipping: true, reviews: [{ id: "r4", name: "Elif Kaya", rating: 5, text: "Renkler çok canlı, resim dersi için ideal." }, { id: "r5", name: "Emre Çelik", rating: 5, text: "Ücretsiz kargo avantajı güzel oldu." }] },
  { id: "p3", name: "Metal Kalem Kutusu Organizer", categoryId: "kalem", brandId: "bic", price: 129.9, comparePrice: 159.9, image: makeSampleImage("Kalem Kutusu", "✏️", "#dbeafe", "#3b82f6"), shippingCost: 24.9, freeShipping: false, reviews: [{ id: "r7", name: "Zeynep Şahin", rating: 4, text: "Bölmeleri kullanışlı, görseldeki gibi." }, { id: "r8", name: "Can Özkan", rating: 5, text: "Kalemlerim düzenli duruyor, sağlam." }] },
  { id: "p4", name: "A4 Fotokopi Kağıdı 500 Yaprak", categoryId: "defter", brandId: "pensan", price: 154.9, comparePrice: 189.9, image: makeSampleImage("A4 Fotokopi Kağıdı", "📄", "#f8fafc", "#94a3b8"), shippingCost: 39.9, freeShipping: false, reviews: [{ id: "r10", name: "Derya Arslan", rating: 5, text: "Ofis yazıcısında sorunsuz kullandık." }] },
  { id: "p5", name: "Hazneli Kalemtıraş ve Silgi Seti", categoryId: "silgi-kalemtras", brandId: "pensan", price: 54.9, comparePrice: 69.9, image: makeSampleImage("Silgi Seti", "🧽", "#dcfce7", "#22c55e"), shippingCost: 19.9, freeShipping: false, reviews: [{ id: "r12", name: "Ayşe Yılmaz", rating: 5, text: "Silgi iz bırakmıyor, kalemtıraş haznesi pratik." }] },
  { id: "p6", name: "Stick Yapıştırıcı 3'lü Paket", categoryId: "yapistirici", brandId: "pensan", price: 82.5, comparePrice: 99.9, image: makeSampleImage("Yapıştırıcı 3'lü", "🧴", "#ffedd5", "#fb7185"), shippingCost: 24.9, freeShipping: false, reviews: [{ id: "r14", name: "Emre Çelik", rating: 5, text: "Proje ödevlerinde iyi tutuyor." }] },
  { id: "p7", name: "İlkokul Okul Çantası ve Matara Seti", categoryId: "canta", brandId: "pensan", price: 649.9, comparePrice: 799.9, image: makeSampleImage("Çanta + Matara", "🎒", "#ede9fe", "#8b5cf6"), shippingCost: 0, freeShipping: true, reviews: [{ id: "r16", name: "Mehmet Demir", rating: 5, text: "Askıları rahat, matara sızdırmıyor." }] },
  { id: "p8", name: "8. Sınıf Deneme Sınavı Paketi", categoryId: "sinav-hazirlik", brandId: "pensan", price: 219.9, comparePrice: 279.9, image: makeSampleImage("Deneme Paketi", "📝", "#e0f2fe", "#06b6d4"), shippingCost: 0, freeShipping: true, reviews: [{ id: "r18", name: "Can Özkan", rating: 5, text: "Sorular güncel müfredata uygun." }] },
  { id: "p9", name: "Keçeli Kalem 12 Renk Yıkanabilir Set", categoryId: "kalem", brandId: "pensan", price: 139.9, comparePrice: 179.9, image: makeSampleImage("Keçeli Kalem Seti", "🖍️", "#fee2e2", "#fb7185"), shippingCost: 24.9, freeShipping: false, reviews: [{ id: "r20", name: "Elif Kaya", rating: 5, text: "Renkler canlı ve kolay temizleniyor." }] },
  { id: "p10", name: "Masaüstü Organizer Ofis Seti 5 Parça", categoryId: "ofis", brandId: "pensan", price: 299.9, comparePrice: 369.9, image: makeSampleImage("Ofis Organizer", "📎", "#d1fae5", "#10b981"), shippingCost: 0, freeShipping: true, reviews: [{ id: "r22", name: "Mehmet Demir", rating: 5, text: "Masa düzeni için çok şık bir set." }] },
];

const STORAGE_KEYS = {
  products: "gocmen-products",
  categories: "gocmen-categories",
  coupons: "gocmen-coupons",
  brands: "gocmen-brands",
};

const initialCoupons: Coupon[] = [
  { id: "c1", code: "OKULA10", discount: 10, minOrder: 250, image: "" },
  { id: "c2", code: "KIRTASIYE25", discount: 25, minOrder: 750, image: "" },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

function makeReviews(seed: number, count = 4): Review[] {
  return Array.from({ length: count }).map((_, offset) => ({
    id: `r-${Date.now()}-${offset}`,
    name: reviewNames[(seed + offset) % reviewNames.length],
    rating: offset === 1 ? 4 : 5,
    text: offset < 2 ? reviewTexts[(seed + offset) % reviewTexts.length] : fakeReviewPool[(seed + offset) % fakeReviewPool.length],
    source: offset < 2 ? "original" : ("fake" as "original" | "fake"),
  }));
}

function fileToDataUrl(event: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) {
  const input = event.currentTarget as EventTarget & { files?: FileList };
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(String(reader.result));
  reader.readAsDataURL(file);
}

function readStoredList<T>(key: string, fallback: T[]): T[] {
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
}

function mergeById<T extends { id: string }>(seedItems: T[], storedItems: T[]) {
  const seedMap = new Map(seedItems.map((item) => [item.id, item]));
  const mergedStored = storedItems.map((item) => {
    const seed = seedMap.get(item.id);
    return seed ? { ...seed, ...item } : item;
  });
  const storedIds = new Set(mergedStored.map((item) => item.id));
  return [...mergedStored, ...seedItems.filter((item) => !storedIds.has(item.id))];
}

function ProductImage({ image, name, fallbackImage }: { image: string; name: string; fallbackImage?: string }) {
  const [hasError, setHasError] = useState(false);
  useEffect(() => { setHasError(false); }, [image]);
  const src = !hasError && isLikelyImageSource(image) ? image : fallbackImage;
  if (src) {
    return <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setHasError(true)} />;
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-6 text-center">
      <p className="text-sm font-bold text-amber-800">Göçmen Kırtasiye</p>
      <p className="mt-1 text-xs text-amber-600">Görsel hazırlanıyor</p>
    </div>
  );
}

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [activeCategory, setActiveCategory] = useState("all");
  const [couponCode, setCouponCode] = useState(initialCoupons[0].code);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "📌", description: "", image: "" });
  const [newBrand, setNewBrand] = useState({ name: "", image: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: 10, minOrder: 0, image: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: initialCategories[0].id,
    brandId: initialBrands[0].id,
    price: 0,
    comparePrice: 0,
    image: PLACEHOLDER_IMAGE,
    shippingCost: 39.9,
    freeShipping: false,
  });

  const { items, addItem, removeItem, updateQuantity, total, itemCount } = useCartStore();

  useEffect(() => {
    const storedProducts = readStoredList<Product>(STORAGE_KEYS.products, []);
    const storedCategories = readStoredList<Category>(STORAGE_KEYS.categories, []);
    const storedCoupons = readStoredList<Coupon>(STORAGE_KEYS.coupons, []);
    const storedBrands = readStoredList<Brand>(STORAGE_KEYS.brands, []);
    setProducts(mergeById(initialProducts, storedProducts).map((product) => {
      const seed = initialProducts.find((item) => item.id === product.id);
      return {
        ...product,
        image: isLikelyImageSource(product.image) ? product.image : seed?.image || buildFallbackProductImage(product.name, initialCategories.find((cat) => cat.id === product.categoryId)?.emoji || "🛍️"),
        reviews: product.reviews?.length ? product.reviews.map((review, index) => ({ ...review, source: review.source ?? (index < 2 ? "original" : "fake") })) : makeReviews(product.name.length),
      };
    }));
    setCategories(mergeById(initialCategories, storedCategories));
    setBrands(mergeById(initialBrands, storedBrands));
    setCoupons(mergeById(initialCoupons, storedCoupons));
    setHasHydrated(true);
  }, []);

  useEffect(() => { if (!hasHydrated) return; window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products)); }, [hasHydrated, products]);
  useEffect(() => { if (!hasHydrated) return; window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories)); }, [categories, hasHydrated]);
  useEffect(() => { if (!hasHydrated) return; window.localStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(coupons)); }, [coupons, hasHydrated]);
  useEffect(() => { if (!hasHydrated) return; window.localStorage.setItem(STORAGE_KEYS.brands, JSON.stringify(brands)); }, [brands, hasHydrated]);

  useEffect(() => {
    if (!cartNotice) return;
    const t = setTimeout(() => setCartNotice(""), 3000);
    return () => clearTimeout(t);
  }, [cartNotice]);

  const visibleProducts = useMemo(() => {
    let list = activeCategory === "all" ? products : products.filter((p) => p.categoryId === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
      list = list.filter((p) => p.name.toLocaleLowerCase("tr-TR").includes(q));
    }
    return list;
  }, [activeCategory, products, searchQuery]);

  const selectedCoupon = coupons.find((c) => c.code.toLocaleUpperCase("tr-TR") === couponCode.toLocaleUpperCase("tr-TR"));
  const subtotal = total();
  const shippingTotal = items.reduce((sum, item) => sum + (item.freeShipping ? 0 : (item.shippingCost ?? 0)) * item.quantity, 0);
  const couponDiscount = selectedCoupon && subtotal >= selectedCoupon.minOrder ? Math.min(subtotal, (subtotal * selectedCoupon.discount) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + shippingTotal - couponDiscount);

  const addProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newProduct.name || !newProduct.categoryId || newProduct.price <= 0) return;
    const product: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      categoryId: newProduct.categoryId,
      brandId: newProduct.brandId,
      price: Number(newProduct.price),
      comparePrice: Number(newProduct.comparePrice || newProduct.price),
      image: isLikelyImageSource(newProduct.image) ? newProduct.image : buildFallbackProductImage(newProduct.name, categories.find((cat) => cat.id === newProduct.categoryId)?.emoji || "🛍️"),
      shippingCost: newProduct.freeShipping ? 0 : Number(newProduct.shippingCost || 0),
      freeShipping: newProduct.freeShipping,
      reviews: makeReviews(products.length),
    };
    setProducts((current) => [product, ...current]);
    setCartNotice(`${product.name} eklendi.`);
    setNewProduct({ name: "", categoryId: categories[0]?.id ?? "", brandId: brands[0]?.id ?? "", price: 0, comparePrice: 0, image: "", shippingCost: 39.9, freeShipping: false });
  };

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCategory.name) return;
    const id = newCategory.name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9ğüşöçı]+/gi, "-");
    setCategories((current) => [...current, { id: `${id}-${Date.now()}`, ...newCategory }]);
    setNewCategory({ name: "", emoji: "📌", description: "", image: "" });
  };

  const addBrand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newBrand.name.trim()) return;
    const id = newBrand.name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9ğüşöçı]+/gi, "-");
    setBrands((current) => [{ id: `${id}-${Date.now()}`, name: newBrand.name.trim(), image: newBrand.image || undefined }, ...current]);
    setNewBrand({ name: "", image: "" });
  };

  const addCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCoupon.code) return;
    setCoupons((current) => [{ id: `c-${Date.now()}`, ...newCoupon, code: newCoupon.code.toLocaleUpperCase("tr-TR") }, ...current]);
    setNewCoupon({ code: "", discount: 10, minOrder: 0, image: "" });
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, shippingCost: product.shippingCost, freeShipping: product.freeShipping });
    setCartNotice(`${product.name} sepete eklendi`);
    setCartOpen(true);
  };

  const restoreSamples = () => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setBrands(initialBrands);
    setCoupons(initialCoupons);
    setActiveCategory("all");
    setCartNotice("Örnek veriler geri yüklendi.");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#171717]">

      {/* Toast Bildirimi */}
      {cartNotice && (
        <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-2xl bg-[#1C1C1E] px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          {cartNotice}
        </div>
      )}

      {/* Sepet Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[90] flex">
          <button className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="flex w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#1C1C1E]">Sepetim</h2>
                <p className="text-sm text-zinc-500">{itemCount()} ürün</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-zinc-100 p-6">
                    <ShoppingCart className="h-8 w-8 text-zinc-400" />
                  </div>
                  <p className="mt-4 font-semibold text-zinc-600">Sepetiniz boş</p>
                  <p className="mt-1 text-sm text-zinc-400">Ürün eklemek için alışverişe başlayın</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                        <ProductImage image={item.image} name={item.name} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-sm font-bold text-amber-700">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-sm font-bold hover:bg-zinc-100">−</button>
                        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-sm font-bold hover:bg-zinc-100">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="rounded-full p-1 text-zinc-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-zinc-100 px-6 py-5">
                <div className="mb-4 space-y-1">
                  <div className="flex justify-between text-sm text-zinc-600"><span>Ara toplam</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-zinc-600"><span>Kargo</span><span>{shippingTotal === 0 ? "Ücretsiz" : formatPrice(shippingTotal)}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-sm font-semibold text-emerald-600"><span>Kupon indirimi</span><span>-{formatPrice(couponDiscount)}</span></div>}
                </div>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Kupon kodu" className="flex-1 bg-transparent text-sm outline-none" />
                  {selectedCoupon && <span className="text-xs font-bold text-emerald-600">✓ Uygulandı</span>}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#1C1C1E] px-4 py-4">
                  <span className="font-semibold text-white">Toplam</span>
                  <span className="text-lg font-bold text-amber-400">{formatPrice(grandTotal)}</span>
                </div>
                <button className="mt-3 w-full rounded-xl bg-amber-500 py-4 font-bold text-white transition hover:bg-amber-600">
                  Ödemeye Geç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ürün Detay Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative h-72 overflow-hidden bg-zinc-100">
              <ProductImage
                image={selectedProduct.image}
                name={selectedProduct.name}
                fallbackImage={buildFallbackProductImage(selectedProduct.name, categories.find((c) => c.id === selectedProduct.categoryId)?.emoji || "🛍️")}
              />
              <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm">
                <X className="h-5 w-5 text-zinc-700" />
              </button>
              {selectedProduct.comparePrice > selectedProduct.price && (
                <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  %{Math.round(((selectedProduct.comparePrice - selectedProduct.price) / selectedProduct.comparePrice) * 100)} İndirim
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                {categories.find((c) => c.id === selectedProduct.categoryId)?.emoji} {categories.find((c) => c.id === selectedProduct.categoryId)?.name}
              </p>
              <h3 className="mt-1 text-2xl font-bold">{selectedProduct.name}</h3>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1C1C1E]">{formatPrice(selectedProduct.price)}</span>
                {selectedProduct.comparePrice > selectedProduct.price && (
                  <span className="text-lg text-zinc-400 line-through">{formatPrice(selectedProduct.comparePrice)}</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3">
                  <button onClick={() => setDetailQty(Math.max(1, detailQty - 1))} className="font-bold text-zinc-600">−</button>
                  <span className="w-6 text-center font-bold">{detailQty}</span>
                  <button onClick={() => setDetailQty(detailQty + 1)} className="font-bold text-zinc-600">+</button>
                </div>
                <button
                  onClick={() => { for (let i = 0; i < detailQty; i++) handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                  className="flex-1 rounded-xl bg-[#1C1C1E] py-3 font-bold text-white transition hover:bg-zinc-800"
                >
                  Sepete Ekle · {formatPrice(selectedProduct.price * detailQty)}
                </button>
              </div>
              {selectedProduct.reviews.slice(0, 2).length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedProduct.reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="rounded-xl bg-zinc-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{review.name}</span>
                        <span className="text-amber-500">{"★".repeat(review.rating)}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {adminOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <button className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setAdminOpen(false)} />
          <div className="flex w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">Yönetim Paneli</h2>
                <p className="text-sm text-zinc-500">Ürün, kategori ve kupon yönetimi</p>
              </div>
              <button onClick={() => setAdminOpen(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 p-6">

              {/* Ürün Ekleme */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold"><PackagePlus className="h-5 w-5 text-amber-600" /> Yeni Ürün Ekle</h3>
                <form onSubmit={addProduct} className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="col-span-2 grid gap-1 text-xs font-semibold text-zinc-600">
                    Ürün Adı
                    <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Ör. A4 Fotokopi Kağıdı" />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Kategori
                    <select value={newProduct.categoryId} onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400">
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Marka
                    <select value={newProduct.brandId} onChange={(e) => setNewProduct({ ...newProduct, brandId: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400">
                      {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Satış Fiyatı (₺)
                    <input type="number" value={newProduct.price || ""} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Eski Fiyat (₺)
                    <input type="number" value={newProduct.comparePrice || ""} onChange={(e) => setNewProduct({ ...newProduct, comparePrice: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Kargo Ücreti (₺)
                    <input type="number" value={newProduct.shippingCost} disabled={newProduct.freeShipping} onChange={(e) => setNewProduct({ ...newProduct, shippingCost: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:bg-zinc-100" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold text-zinc-600">
                    <input type="checkbox" checked={newProduct.freeShipping} onChange={(e) => setNewProduct({ ...newProduct, freeShipping: e.target.checked })} className="h-4 w-4 accent-amber-500" />
                    Ücretsiz Kargo
                  </label>
                  <label className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 py-4 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                    <Camera className="h-4 w-4" /> Fotoğraf Yükle (Kamera / Galeri)
                    <input type="file" accept="image/*" onChange={(e) => fileToDataUrl(e, (img) => setNewProduct({ ...newProduct, image: img }))} className="hidden" />
                  </label>
                  {newProduct.image && (
                    <div className="col-span-2 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                      <div className="h-16 w-16 overflow-hidden rounded-lg"><ProductImage image={newProduct.image} name={newProduct.name || "Yeni Ürün"} /></div>
                      <div>
                        <p className="text-sm font-semibold">Görsel hazır</p>
                        <button type="button" onClick={() => setNewProduct({ ...newProduct, image: "" })} className="text-xs font-semibold text-red-500">Kaldır</button>
                      </div>
                    </div>
                  )}
                  <button type="submit" className="col-span-2 rounded-xl bg-[#1C1C1E] py-3 text-sm font-bold text-white transition hover:bg-zinc-800">
                    Ürünü Ekle
                  </button>
                </form>
              </div>

              {/* Kategori Yönetimi */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <h3 className="text-lg font-bold">Kategori Yönetimi</h3>
                <form onSubmit={addCategory} className="mt-4 grid gap-3">
                  <input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Kategori adı" />
                  <input value={newCategory.emoji} onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Emoji (örn. 📚)" />
                  <input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Açıklama" />
                  <button type="submit" className="rounded-xl bg-[#1C1C1E] py-3 text-sm font-bold text-white">Kategori Ekle</button>
                </form>
                <div className="mt-3 space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                      <span className="text-sm font-medium">{cat.emoji} {cat.name}</span>
                      <button type="button" onClick={() => setCategories((c) => c.filter((i) => i.id !== cat.id))} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marka Yönetimi */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <h3 className="text-lg font-bold">Marka Yönetimi</h3>
                <form onSubmit={addBrand} className="mt-4 grid gap-3">
                  <input value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Marka adı" />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-3 text-xs font-semibold text-zinc-500 hover:bg-zinc-100">
                    <ImagePlus className="h-4 w-4" /> Logo Yükle
                    <input type="file" accept="image/*" onChange={(e) => fileToDataUrl(e, (img) => setNewBrand({ ...newBrand, image: img }))} className="hidden" />
                  </label>
                  <button type="submit" className="rounded-xl bg-[#1C1C1E] py-3 text-sm font-bold text-white">Marka Ekle</button>
                </form>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium">
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100">
                        {brand.image ? <img src={brand.image} alt={brand.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">{brand.name.slice(0, 2)}</div>}
                      </div>
                      {brand.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kupon Yönetimi */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold"><Tag className="h-5 w-5 text-amber-600" /> Kupon Yönetimi</h3>
                <form onSubmit={addCoupon} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-amber-400" placeholder="KUPONKODU" />
                  <input type="number" value={newCoupon.discount} onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="İndirim %" />
                  <input type="number" value={newCoupon.minOrder || ""} onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" placeholder="Min. sipariş (₺)" />
                  <button type="submit" className="rounded-xl bg-[#1C1C1E] py-3 text-sm font-bold text-white">Kupon Ekle</button>
                </form>
                <div className="mt-3 space-y-2">
                  {coupons.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-bold">{c.code}</p>
                        <p className="text-xs text-zinc-500">%{c.discount} · Min {formatPrice(c.minOrder)}</p>
                      </div>
                      <button type="button" onClick={() => setCoupons((curr) => curr.filter((i) => i.id !== c.id))} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ürün Listesi */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Ürün Listesi ({products.length})</h3>
                  <button onClick={restoreSamples} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">Örnekleri Geri Yükle</button>
                </div>
                <div className="mt-3 space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100"><ProductImage image={product.image} name={product.name} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className="text-xs text-amber-700 font-semibold">{formatPrice(product.price)}</p>
                      </div>
                      <button type="button" onClick={() => setProducts((curr) => curr.filter((i) => i.id !== product.id))} className="flex-shrink-0 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigasyon */}
      <header className="sticky top-0 z-50 border-b border-[#e8e1d3]/80 bg-[#fffdf9]/95 shadow-[0_12px_35px_-24px_rgba(23,23,23,0.65)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-5 md:px-6 md:py-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl p-2 text-zinc-500 transition hover:bg-[#f3eee4] hover:text-[#171717] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-[148px] flex-1 items-center md:flex-none">
            <a href="/" className="group flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171717] text-lg font-black text-[#d6b85a] shadow-lg shadow-black/10 transition group-hover:rotate-[-6deg]">G</span>
              <span>
                <span className="block text-[15px] font-black uppercase tracking-[0.2em] text-[#171717]">Göçmen</span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.35em] text-amber-700">Kırtasiye</span>
              </span>
            </a>
          </div>
          <div className="hidden max-w-xl flex-1 items-center gap-3 rounded-2xl border border-[#e8e1d3] bg-[#f8f6f1] px-4 py-3 shadow-inner transition focus-within:border-[#b8973e] focus-within:bg-white md:flex">
            <Search className="h-4 w-4 flex-shrink-0 text-[#b8973e]" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ürün, marka veya kategori ara..." className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400" />
            <span className="hidden rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-bold text-zinc-400 lg:inline-flex">⌘ K</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAdminOpen(true)} className="hidden items-center gap-2 rounded-xl border border-[#e8e1d3] bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-[#b8973e] hover:text-[#171717] md:flex">
              <PackagePlus className="h-4 w-4 text-[#b8973e]" /> Yönetim
            </button>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 rounded-2xl bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#b8973e]">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline">Sepet</span>
              {itemCount() > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold">{itemCount()}</span>}
            </button>
          </div>
        </div>
        {/* Mobil arama */}
        <div className="flex items-center gap-2 border-t border-[#e8e1d3]/70 bg-[#fffdf9] px-4 py-3 md:hidden">
          <Search className="h-4 w-4 flex-shrink-0 text-[#b8973e]" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ürün, marka veya kategori ara..." className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400" />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative isolate overflow-hidden bg-[#171717] shadow-[0_30px_80px_-45px_rgba(23,23,23,0.95)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(184,151,62,0.28),transparent_32%),radial-gradient(circle_at_15%_100%,rgba(120,53,15,0.32),transparent_36%)]" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full border border-[#d6b85a]/20 md:h-96 md:w-96" />
        <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full border border-[#d6b85a]/10 md:h-72 md:w-72" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-[1.05fr_.95fr] md:px-6 md:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d6b85a]/35 bg-[#d6b85a]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#e7ca72]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d6b85a] shadow-[0_0_0_4px_rgba(214,184,90,0.12)]" /> Seçkin kırtasiye koleksiyonu
            </p>
            <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-7xl">
              Fikirlerini<br />
              <span className="bg-gradient-to-r from-[#f0d27b] via-amber-400 to-[#b8973e] bg-clip-text text-transparent">güzelleştir.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 md:text-lg">
              Defterden kaleme, boyadan okul malzemelerine kadar ilham veren seçkiler; işine ve hayaline eşlik eden kaliteli ürünler.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#urunler" className="inline-flex items-center gap-2 rounded-2xl bg-[#d6b85a] px-6 py-3.5 font-bold text-[#171717] shadow-[0_12px_30px_-12px_rgba(214,184,90,0.8)] transition hover:bg-[#e7ca72] hover:shadow-[0_16px_35px_-12px_rgba(214,184,90,0.9)]">
                Koleksiyonu keşfet <ChevronRight className="h-4 w-4" />
              </a>
              <button onClick={() => setCartOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 font-semibold text-zinc-200 transition hover:border-[#d6b85a]/50 hover:bg-white/[0.08] hover:text-white">
                <ShoppingCart className="h-4 w-4" /> Sepetim ({itemCount()})
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
              <span className="flex items-center gap-2"><span className="text-[#d6b85a]">✦</span> 1993'ten beri güven</span>
              <span className="flex items-center gap-2"><span className="text-[#d6b85a]">✦</span> Seçili markalar</span>
              <span className="flex items-center gap-2"><span className="text-[#d6b85a]">✦</span> Hızlı teslimat</span>
            </div>
          </div>
          <div className="relative hidden min-h-[390px] md:block">
            <div className="absolute inset-x-8 top-7 bottom-0 rounded-[2.5rem] border border-[#d6b85a]/20 bg-white/[0.04] backdrop-blur-sm" />
            <div className="absolute right-0 top-0 w-60 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[#e7ca72]"><span>Haftanın seçkisi</span><Star className="h-4 w-4 fill-[#d6b85a] text-[#d6b85a]" /></div>
              <div className="mt-5 flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7e8ad] via-[#d6b85a] to-[#8a6820] text-7xl shadow-inner">✒️</div>
              <p className="mt-4 text-sm font-bold text-white">Yazma ritüelini yükselt</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">Her fikir için özenle seçildi.</p>
            </div>
            <div className="absolute bottom-0 left-0 w-64 rounded-[2rem] border border-white/10 bg-[#fffdf9] p-5 text-[#171717] shadow-2xl">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Koleksiyonlar</span><span className="text-lg">✦</span></div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
                {[['📒', 'Defter'], ['✏️', 'Kalem'], ['🎨', 'Sanat'], ['🎒', 'Okul']].map(([emoji, label]) => <span key={label} className="rounded-xl bg-[#f8f6f1] px-3 py-2.5">{emoji} {label}</span>)}
              </div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-3 gap-px border-t border-white/10 bg-white/10 md:grid-cols-3">
          {[
            { icon: Truck, label: "Hızlı Kargo", sub: "Aynı gün paketleme" },
            { icon: Star, label: "Seçili Kalite", sub: "Güvenilir markalar" },
            { icon: BadgePercent, label: "Akıllı Fırsatlar", sub: "Kampanyaları keşfet" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 bg-[#1c1c1e]/95 px-3 py-5 text-center md:flex-row md:gap-3 md:px-6 md:text-left">
              <div className="rounded-xl border border-[#d6b85a]/20 bg-[#d6b85a]/10 p-2.5"><Icon className="h-5 w-5 text-[#d6b85a]" /></div>
              <div><p className="text-xs font-bold text-white md:text-sm">{label}</p><p className="mt-0.5 text-[10px] text-zinc-500 md:text-xs">{sub}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Aktif Kuponlar */}
      {coupons.length > 0 && (
        <section className="border-b border-[#e8e1d3] bg-[#f8f6f1]">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 md:px-6">
            <div className="flex items-center gap-4">
              <span className="flex flex-shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500"><Tag className="h-3.5 w-3.5 text-[#b8973e]" /> Özel fırsatlar</span>
              {coupons.map((coupon) => (
                <button key={coupon.id} onClick={() => { setCouponCode(coupon.code); setCartOpen(true); }} className="group flex flex-shrink-0 items-center gap-3 rounded-2xl border border-[#e8e1d3] bg-white px-4 py-2.5 text-left shadow-[0_8px_20px_-18px_rgba(23,23,23,0.8)] transition hover:-translate-y-0.5 hover:border-[#b8973e]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717] text-[10px] font-black text-[#d6b85a]">%</span>
                  <span><span className="block text-xs font-black tracking-wider text-[#171717]">{coupon.code}</span><span className="block text-[10px] text-zinc-500">%{coupon.discount} avantaj</span></span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kategori Filtreleri */}
      <section id="urunler" className="border-b border-[#e8e1d3] bg-[#fffdf9]">
        <div className="mx-auto max-w-7xl px-4 py-7 md:px-6 md:py-9">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-700">Kategorilere göre alışveriş</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[#171717] md:text-3xl">İlham veren seçimler</h2></div>
            <span className="hidden text-sm text-zinc-400 sm:block">{products.length} ürünlük seçki</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button onClick={() => setActiveCategory("all")} className={activeCategory === "all" ? "flex flex-shrink-0 items-center gap-2 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10" : "flex flex-shrink-0 items-center gap-2 rounded-2xl border border-[#e8e1d3] bg-white px-4 py-3 text-sm font-bold text-zinc-600 transition hover:border-[#b8973e] hover:text-[#171717]"}>
              <span className="text-base">✦</span> Tümü
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} title={cat.description} className={activeCategory === cat.id ? "flex flex-shrink-0 items-center gap-2 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10" : "flex flex-shrink-0 items-center gap-2 rounded-2xl border border-[#e8e1d3] bg-white px-4 py-3 text-sm font-bold text-zinc-600 transition hover:border-[#b8973e] hover:text-[#171717]"}>
                <span className="text-base">{cat.emoji}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ürün Grid */}
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-[#171717]">
            {activeCategory === "all" ? "Tüm Ürünler" : categories.find((c) => c.id === activeCategory)?.name}
            <span className="ml-2 text-sm font-normal text-zinc-400">{visibleProducts.length} ürün</span>
          </h2>
          <button onClick={() => setAdminOpen(true)} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 md:hidden">
            <PackagePlus className="h-4 w-4" /> Yönetim
          </button>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-100 bg-white py-20 text-center">
            <Package className="h-10 w-10 text-zinc-300" />
            <p className="mt-4 font-semibold text-zinc-500">Ürün bulunamadı</p>
            <p className="mt-1 text-sm text-zinc-400">Farklı bir kategori veya arama terimi deneyin</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId);
              const brand = brands.find((b) => b.id === product.brandId);
              const discount = product.comparePrice > product.price
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0;

              return (
                <article key={product.id} className="premium-lift group flex flex-col overflow-hidden rounded-[1.75rem] border border-[#e8e1d3] bg-white shadow-[0_18px_45px_-30px_rgba(23,23,23,0.65)]">
                  <div className="relative h-52 overflow-hidden bg-zinc-50">
                    <ProductImage
                      image={product.image}
                      name={product.name}
                      fallbackImage={buildFallbackProductImage(product.name, category?.emoji || "🛍️")}
                    />
                    {discount > 0 && (
                      <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white">
                        %{discount}
                      </div>
                    )}
                    {product.freeShipping && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <Truck className="h-3 w-3" /> Ücretsiz
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                      {category?.emoji} {category?.name}
                    </p>
                    <h3 className="mt-1 flex-1 text-sm font-bold leading-snug text-[#1C1C1E]">{product.name}</h3>
                    {brand && <p className="mt-1 text-xs text-zinc-400">{brand.name}</p>}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-black text-[#1C1C1E]">{formatPrice(product.price)}</span>
                      {product.comparePrice > product.price && (
                        <span className="text-sm text-zinc-400 line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                    {product.reviews.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex text-amber-400">{"★".repeat(5)}</div>
                        <span className="text-xs text-zinc-400">({product.reviews.length})</span>
                      </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setSelectedProduct(product); setDetailQty(1); }}
                        className="rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-400"
                      >
                        İncele
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1C1C1E] py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Sepete Ekle
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e8e1d3] bg-[#fffdf9]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-black uppercase tracking-[0.15em] text-[#1C1C1E]">Göçmen Kırtasiye</p>
              <p className="mt-1 text-sm text-zinc-500">Kaliteli kırtasiye, uygun fiyat, hızlı teslimat.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-800">Hakkımızda</a>
              <a href="#" className="hover:text-zinc-800">İletişim</a>
              <a href="#" className="hover:text-zinc-800">Kargo Bilgisi</a>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
            © {new Date().getFullYear()} Göçmen Kırtasiye. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
