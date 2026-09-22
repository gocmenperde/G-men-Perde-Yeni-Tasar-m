"use client";

import { useEffect, useState, useRef } from "react";
import {
  Settings, Image as ImageIcon, Megaphone, Layout, Phone,
  Instagram, Facebook, Twitter, Save, Upload, X, Check,
  Monitor, Globe, Palette, Mail, Send, Loader2, Video, Eye,
  MapPin, MessageCircle, Truck, KeyRound, RefreshCw,
} from "lucide-react";
import HomepageEditor, {
  type CategoryOption,
  type ProductOption,
} from "@/components/admin/homepage-editor";
import type { Banner } from "@/components/admin/banners-client";
import {
  parseHomepageConfig,
  serializeHomepageConfig,
  type HomepageSection,
} from "@/lib/homepage-config";

interface SiteSettings {
  id: string;
  siteName?: string;
  indexNowKey?: string | null;
  logoUrl?: string;
  faviconUrl?: string;
  announcementText?: string;
  announcementActive?: boolean;
  announcementColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroDesc?: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryHref?: string;
  heroCtaSecText?: string;
  heroCtaSecHref?: string;
  trustBadge1Text?: string;
  trustBadge1Sub?: string;
  trustBadge2Text?: string;
  trustBadge2Sub?: string;
  trustBadge3Text?: string;
  trustBadge3Sub?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  popularSetsJson?: string;
  homepageVideoUrl?: string;
  homepageVideoSource?: string;
  freeShippingThreshold?: number;
  shippingFee?: number;
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 1500;
const DEFAULT_SHIPPING_FEE = 79.9;

const TABS = [
  { id: "logo", label: "Logo & Favicon", icon: ImageIcon },
  { id: "homepage", label: "Ana Sayfa Alanları", icon: Layout },
  { id: "hero", label: "Anasayfa Hero", icon: Layout },
  { id: "announcement", label: "Duyuru Çubuğu", icon: Megaphone },
  { id: "shipping", label: "Kargo Ayarları", icon: Truck },
  { id: "video", label: "Video", icon: Video },
  { id: "contact", label: "İletişim & Sosyal", icon: Phone },
  { id: "mail", label: "Mail Testi", icon: Mail },
  { id: "indexnow", label: "SEO & IndexNow", icon: KeyRound },
];

const ANNOUNCEMENT_COLORS = [
  { id: "amber", label: "Altın", cls: "bg-amber-500" },
  { id: "red", label: "Kırmızı", cls: "bg-red-500" },
  { id: "green", label: "Yeşil", cls: "bg-emerald-600" },
  { id: "blue", label: "Mavi", cls: "bg-blue-600" },
  { id: "zinc", label: "Koyu", cls: "bg-zinc-900" },
  { id: "rose", label: "Pembe", cls: "bg-rose-500" },
];

export default function SettingsClient({
  initialSettings,
  initialTab,
}: {
  initialSettings: SiteSettings | null;
  initialTab?: string;
}) {
  const [tab, setTab] = useState(
    initialTab && TABS.some((item) => item.id === initialTab) ? initialTab : "logo",
  );
  const [form, setForm] = useState<SiteSettings>(initialSettings ?? { id: "global" });
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(
    () => parseHomepageConfig(initialSettings?.popularSetsJson).sections,
  );
  const [homepageProducts, setHomepageProducts] = useState<ProductOption[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<CategoryOption[]>([]);
  const [homepageProductsLoading, setHomepageProductsLoading] = useState(false);
  const [homepageCategoriesLoading, setHomepageCategoriesLoading] = useState(false);
  const [homepageOptionsLoaded, setHomepageOptionsLoaded] = useState(false);
  const [homepageOptionsError, setHomepageOptionsError] = useState<string | null>(null);
  const [homepageBanners, setHomepageBanners] = useState<Banner[]>([]);
  const [homepageBannersLoading, setHomepageBannersLoading] = useState(false);
  const [homepageBannersLoaded, setHomepageBannersLoaded] = useState(false);
  const [shippingInputs, setShippingInputs] = useState({
    freeShippingThreshold: String(initialSettings?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD),
    shippingFee: String(initialSettings?.shippingFee ?? DEFAULT_SHIPPING_FEE),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const [testMailTo, setTestMailTo] = useState("");
  const [testMailStatus, setTestMailStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testMailMsg, setTestMailMsg] = useState("");
  const [indexNowKey, setIndexNowKey] = useState<string | null>(null);
  const [indexNowLocation, setIndexNowLocation] = useState("");
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [indexNowGenerating, setIndexNowGenerating] = useState(false);
  const [indexNowError, setIndexNowError] = useState("");

  useEffect(() => {
    if (tab !== "indexnow" || indexNowKey !== null) return;
    let mounted = true;
    setIndexNowLoading(true);
    setIndexNowError("");
    fetch("/api/admin/indexnow-settings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "IndexNow ayarları alınamadı.");
        if (mounted) {
          setIndexNowKey(data.key ?? "");
          setIndexNowLocation(data.keyLocation ?? "");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setIndexNowError(error instanceof Error ? error.message : "IndexNow ayarları alınamadı.");
        }
      })
      .finally(() => {
        if (mounted) setIndexNowLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tab, indexNowKey]);

  async function generateIndexNowKey() {
    setIndexNowGenerating(true);
    setIndexNowError("");
    try {
      const response = await fetch("/api/admin/indexnow-settings", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "IndexNow anahtarı oluşturulamadı.");
      setIndexNowKey(data.key ?? "");
      setIndexNowLocation(data.keyLocation ?? "");
    } catch (error) {
      setIndexNowError(error instanceof Error ? error.message : "IndexNow anahtarı oluşturulamadı.");
    } finally {
      setIndexNowGenerating(false);
    }
  }

  const handleBannersChange = (banners: Banner[]) => {
    const previousBannerIds = new Set(homepageBanners.map((banner) => banner.id));
    const bannerProductIds = {
      ...parseHomepageConfig(form.popularSetsJson).bannerProductIds,
    };
    for (const bannerId of previousBannerIds) {
      delete bannerProductIds[bannerId];
    }
    for (const banner of banners) {
      const productIds = Array.from(new Set(banner.productIds ?? [])).slice(0, 4);
      if (productIds.length > 0) {
        bannerProductIds[banner.id] = productIds;
      }
    }
    setHomepageBanners(banners);
    setForm((current) => ({
      ...current,
      popularSetsJson: serializeHomepageConfig(homepageSections, bannerProductIds),
    }));
  };

  useEffect(() => {
    if (
      tab !== "homepage" ||
      homepageOptionsLoaded
    ) return;
    let mounted = true;
    setHomepageProductsLoading(true);
    setHomepageCategoriesLoading(true);
    setHomepageOptionsError(null);
    Promise.all([
      fetch("/api/products?take=10000"),
      fetch("/api/categories"),
    ])
      .then(async ([productsResponse, categoriesResponse]) => {
        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);
        if (!productsResponse.ok) throw new Error(productsData.error);
        if (!categoriesResponse.ok) throw new Error(categoriesData.error);
        if (mounted) {
          setHomepageProducts(Array.isArray(productsData.data) ? productsData.data : []);
          setHomepageCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setHomepageProducts([]);
          setHomepageCategories([]);
          setHomepageOptionsError(
            error instanceof Error && error.message
              ? error.message
              : "Ürün ve kategori listesi yüklenemedi.",
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setHomepageProductsLoading(false);
          setHomepageCategoriesLoading(false);
          setHomepageOptionsLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [homepageOptionsLoaded, tab]);

  useEffect(() => {
    if (tab !== "homepage" || homepageBannersLoaded) return;
    let mounted = true;
    setHomepageBannersLoading(true);
    fetch("/api/admin/banners")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Bannerlar yüklenemedi.");
        if (mounted) {
          setHomepageBanners(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (mounted) setHomepageBanners([]);
      })
      .finally(() => {
        if (mounted) {
          setHomepageBannersLoading(false);
          setHomepageBannersLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [homepageBannersLoaded, tab]);

  const sendTestMail = async () => {
    setTestMailStatus("sending");
    setTestMailMsg("");
    try {
      const res = await fetch("/api/admin/test-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testMailTo || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestMailStatus("ok");
      setTestMailMsg(`✅ Mail başarıyla gönderildi → ${data.to}`);
    } catch (e: any) {
      setTestMailStatus("error");
      setTestMailMsg(e.message ?? "Mail gönderilemedi.");
    }
  };
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof SiteSettings, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const parseShippingValue = (rawValue: string, label: string) => {
    const normalized = rawValue.trim().replace(",", ".");
    if (!normalized) {
      throw new Error(`${label} boş bırakılamaz.`);
    }

    const value = Number(normalized);
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${label} sıfır veya daha büyük geçerli bir sayı olmalıdır.`);
    }

    return value;
  };

  const uploadImage = async (
    file: File,
    onStart: () => void,
    onDone: (url: string | null) => void,
  ) => {
    onStart();
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      onDone(j.url ?? null);
    } catch {
      onDone(null);
    }
  };

  const uploadVideoDirectly = async (file: File): Promise<string> => {
    let signatureResponse: Response;
    try {
      signatureResponse = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: "video" }),
      });
    } catch {
      throw new Error("Video yükleme servisine bağlanılamadı. Sayfayı yenileyip tekrar deneyin.");
    }

    const signatureData = await signatureResponse.json().catch(() => ({}));
    if (!signatureResponse.ok) {
      throw new Error(
        signatureData.error ?? `Video yükleme başlatılamadı (${signatureResponse.status})`,
      );
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("api_key", signatureData.apiKey);
    uploadData.append("timestamp", String(signatureData.timestamp));
    uploadData.append("signature", signatureData.signature);
    uploadData.append("folder", signatureData.folder);

    const uploadEndpoint =
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signatureData.cloudName)}/video/upload`;

    // iOS Safari can reject large FormData uploads made with fetch as the
    // generic "Load failed". XHR has much better support for file uploads and
    // lets us distinguish network, timeout, abort, and provider errors.
    const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadEndpoint);
      xhr.timeout = 30 * 60 * 1000;
      xhr.onload = () => {
        let response: { secure_url?: string; error?: { message?: string } } = {};
        try {
          response = JSON.parse(xhr.responseText || "{}");
        } catch {
          // Keep the status-based error below when the provider returns non-JSON.
        }

        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve(response);
          return;
        }

        reject(
          new Error(
            response.error?.message ?? `Video yüklenemedi (${xhr.status || 500})`,
          ),
        );
      };
      xhr.onerror = () => {
        reject(new Error("Video yüklenirken bağlantı kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin."));
      };
      xhr.ontimeout = () => {
        reject(new Error("Video yükleme zaman aşımına uğradı. Daha kısa bir video deneyin."));
      };
      xhr.onabort = () => {
        reject(new Error("Video yükleme iptal edildi."));
      };
      xhr.send(uploadData);
    });

    if (!result.secure_url) {
      throw new Error("Cloudinary geçerli bir video adresi döndürmedi.");
    }

    return result.secure_url;
  };

  const handleSave = async () => {
    let payload: SiteSettings;
    try {
      const bannerProductIds = { ...parseHomepageConfig(form.popularSetsJson).bannerProductIds };
      // Do not replace persisted selections with an empty map while the
      // homepage editor is still loading its banner records.
      if (homepageBannersLoaded) {
        for (const banner of homepageBanners) {
          delete bannerProductIds[banner.id];
        }
        for (const banner of homepageBanners) {
          const productIds = Array.from(new Set(banner.productIds ?? [])).slice(0, 4);
          if (productIds.length > 0) {
            bannerProductIds[banner.id] = productIds;
          }
        }
      }
      payload = {
        ...form,
        popularSetsJson: serializeHomepageConfig(homepageSections, bannerProductIds),
        freeShippingThreshold: parseShippingValue(
          shippingInputs.freeShippingThreshold,
          "Ücretsiz kargo sınırı",
        ),
        shippingFee: parseShippingValue(
          shippingInputs.shippingFee,
          "Standart kargo ücreti",
        ),
      };
    } catch (e: any) {
      alert(`Kaydetme hatası: ${e.message}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Kaydetme hatası: ${err.error ?? res.status}`);
        return;
      }
      setForm(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      alert(`Bağlantı hatası: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const shippingThresholdPreview = Number(
    shippingInputs.freeShippingThreshold.trim().replace(",", "."),
  );
  const shippingFeePreview = Number(
    shippingInputs.shippingFee.trim().replace(",", "."),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            Site Ayarları
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Sitenizin görünümünü ve içeriğini buradan yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-all"
          >
            <Eye className="w-4 h-4" />
            Önizle
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-900"
            } disabled:opacity-60`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Kaydedildi!" : saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
              tab === id
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 space-y-6">
        {/* ── ANA SAYFA ALANLARI ── */}
        {tab === "homepage" && (
          <div className="space-y-5">
            <SectionHeader icon={Layout} title="Ana Sayfa Alanları" desc="Ana sayfada hangi bölümlerin görüneceğini buradan açıp kapatın." />
            {homepageOptionsError && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{homepageOptionsError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setHomepageOptionsLoaded(false);
                    setHomepageOptionsError(null);
                  }}
                  className="shrink-0 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/10"
                >
                  Tekrar dene
                </button>
              </div>
            )}
            <HomepageEditor
              sections={homepageSections}
              products={homepageProducts}
              categories={homepageCategories}
              productsLoading={homepageProductsLoading}
              categoriesLoading={homepageCategoriesLoading}
              bannerRecords={homepageBanners}
              bannersLoading={homepageBannersLoading}
              onBannersChange={handleBannersChange}
              onChange={setHomepageSections}
            />
          </div>
        )}

        {tab === "indexnow" && (
          <div className="space-y-5">
            <SectionHeader
              icon={KeyRound}
              title="SEO & IndexNow"
              desc="Ürün değişikliklerini arama motorlarına bildirmek için kullanılan doğrulama anahtarını yönetin."
            />
            {indexNowError && (
              <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">
                {indexNowError}
              </div>
            )}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
              <Field label="IndexNow API anahtarı">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={indexNowLoading ? "Yükleniyor..." : indexNowKey ?? ""}
                    className={`${inputCls} font-mono text-sm`}
                  />
                  <button
                    type="button"
                    onClick={generateIndexNowKey}
                    disabled={indexNowGenerating || indexNowLoading}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${indexNowGenerating ? "animate-spin" : ""}`} />
                    {indexNowGenerating ? "Oluşturuluyor..." : "Yeni anahtar"}
                  </button>
                </div>
              </Field>
              <Field label="Doğrulama dosyası">
                <input readOnly value={indexNowLocation} className={`${inputCls} font-mono text-xs text-zinc-400`} />
              </Field>
              <p className="text-xs leading-5 text-zinc-500">
                Yeni anahtar oluşturduğunuzda doğrulama dosyası aynı anahtarla otomatik olarak yayınlanır.
                IndexNow bildirimi yalnızca ürün ve ana sayfa değişikliklerinde gönderilir; sürekli polling yapılmaz.
              </p>
            </div>
          </div>
        )}

        {/* ── LOGO & FAVİCON ── */}
        {tab === "logo" && (
          <div className="space-y-6">
            <SectionHeader icon={Globe} title="Site Adı" />
            <Field label="Site Adı">
              <input
                value={form.siteName ?? ""}
                onChange={(e) => set("siteName", e.target.value)}
                placeholder="Göçmen Perde"
                className={inputCls}
              />
            </Field>

            <hr className="border-zinc-800" />
            <SectionHeader icon={Monitor} title="Logo" desc="Navbar'da görünen logo görseli" />

            <div className="flex items-start gap-5">
              <div className="w-32 h-20 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => logoRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingLogo ? "Yükleniyor..." : "Logo Yükle"}
                </button>
                {form.logoUrl && (
                  <button
                    onClick={() => set("logoUrl", "")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 text-sm font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" /> Logoyu Kaldır
                  </button>
                )}
                <p className="text-zinc-500 text-xs">PNG, JPG veya SVG · Önerilen: 400×120px</p>
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadImage(file, () => setUploadingLogo(true), (url) => {
                    setUploadingLogo(false);
                    if (url) set("logoUrl", url);
                  });
                  e.target.value = "";
                }}
              />
            </div>

            <hr className="border-zinc-800" />
            <SectionHeader icon={Palette} title="Favicon" desc="Tarayıcı sekmesinde görünen küçük ikon (Google arama sonuçlarında da gösterilir)" />

            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.faviconUrl ? (
                  <img src={form.faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-600" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => faviconRef.current?.click()}
                  disabled={uploadingFavicon}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingFavicon ? "Yükleniyor..." : "Favicon Yükle"}
                </button>
                {form.faviconUrl && (
                  <button
                    onClick={() => set("faviconUrl", "")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 text-sm font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" /> Favicon'ı Kaldır
                  </button>
                )}
                <p className="text-zinc-500 text-xs">PNG veya ICO · Önerilen: 32×32px veya 512×512px</p>
              </div>
              <input
                ref={faviconRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadImage(file, () => setUploadingFavicon(true), (url) => {
                    setUploadingFavicon(false);
                    if (url) set("faviconUrl", url);
                  });
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        )}

        {/* ── HERO ── */}
        {tab === "hero" && (
          <div className="space-y-5">
            <SectionHeader icon={Layout} title="Hero Bölümü" desc="Anasayfanın en üstündeki büyük banner alanı" />
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-zinc-400">
              Bu alan, yeni anasayfanın giriş bölümünü doğrudan yönetir. Kaydettiğinizde hero metni, butonları, güven kartları ve istatistikler canlı ana sayfada kullanılır. Video için <strong className="text-amber-400">Video</strong> sekmesini kullanın.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Rozet / Üst Etiket">
                <input
                  value={form.heroBadge ?? ""}
                  onChange={(e) => set("heroBadge", e.target.value)}
                  placeholder="Bursa · Osmangazi · 30 Yıllık Tecrübe"
                  className={inputCls}
                />
              </Field>
              <Field label="Ana Başlık">
                <input
                  value={form.heroTitle ?? ""}
                  onChange={(e) => set("heroTitle", e.target.value)}
                  placeholder="Göçmen Perde"
                  className={inputCls}
                />
              </Field>
              <Field label="Alt Başlık">
                <input
                  value={form.heroSubtitle ?? ""}
                  onChange={(e) => set("heroSubtitle", e.target.value)}
                  placeholder="Yaşam Alanınıza Özel"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Açıklama Metni">
              <textarea
                value={form.heroDesc ?? ""}
                onChange={(e) => set("heroDesc", e.target.value)}
                rows={3}
                placeholder="Defter, kalem, sanat malzemeleri ve okul gereçleri..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Birinci Buton Metni">
                <input
                  value={form.heroCtaPrimaryText ?? ""}
                  onChange={(e) => set("heroCtaPrimaryText", e.target.value)}
                  placeholder="Alışverişe Başla"
                  className={inputCls}
                />
              </Field>
              <Field label="Birinci Buton Linki">
                <input
                  value={form.heroCtaPrimaryHref ?? ""}
                  onChange={(e) => set("heroCtaPrimaryHref", e.target.value)}
                  placeholder="/products"
                  className={inputCls}
                />
              </Field>
              <Field label="İkinci Buton Metni">
                <input
                  value={form.heroCtaSecText ?? ""}
                  onChange={(e) => set("heroCtaSecText", e.target.value)}
                  placeholder="İndirimli Ürünler"
                  className={inputCls}
                />
              </Field>
              <Field label="İkinci Buton Linki">
                <input
                  value={form.heroCtaSecHref ?? ""}
                  onChange={(e) => set("heroCtaSecHref", e.target.value)}
                  placeholder="/products?sale=true"
                  className={inputCls}
                />
              </Field>
            </div>

            <hr className="border-zinc-800" />
            <p className="text-sm font-bold text-zinc-400">İstatistikler</p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-2">
                  <Field label={`Değer ${n}`}>
                    <input
                      value={(form as any)[`stat${n}Value`] ?? ""}
                      onChange={(e) => set(`stat${n}Value` as any, e.target.value)}
                      placeholder={n === 1 ? "30+" : n === 2 ? "500+" : "5★"}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`Etiket ${n}`}>
                    <input
                      value={(form as any)[`stat${n}Label`] ?? ""}
                      onChange={(e) => set(`stat${n}Label` as any, e.target.value)}
                      placeholder={n === 1 ? "Yıllık Tecrübe" : n === 2 ? "Ürün Çeşidi" : "Müşteri Puanı"}
                      className={inputCls}
                    />
                  </Field>
                </div>
              ))}
            </div>

            <hr className="border-zinc-800" />
            <p className="text-sm font-bold text-zinc-400">Güven Rozetleri</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-2">
                  <Field label={`Rozet ${n} Başlık`}>
                    <input
                      value={(form as any)[`trustBadge${n}Text`] ?? ""}
                      onChange={(e) => set(`trustBadge${n}Text` as any, e.target.value)}
                       placeholder={n === 1 ? "Hızlı Gönderim" : n === 2 ? "Güvenli Ödeme" : "Uzman Destek"}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`Rozet ${n} Alt Yazı`}>
                    <input
                      value={(form as any)[`trustBadge${n}Sub`] ?? ""}
                      onChange={(e) => set(`trustBadge${n}Sub` as any, e.target.value)}
                       placeholder={n === 1 ? "Türkiye geneli" : n === 2 ? "Korunaklı alışveriş" : "Bursa’dan gerçek destek"}
                      className={inputCls}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DUYURU ── */}
        {tab === "announcement" && (
          <div className="space-y-5">
            <SectionHeader icon={Megaphone} title="Duyuru Çubuğu" desc="Sitenin en üstünde çıkan bildirim bandı" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => set("announcementActive", !form.announcementActive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  form.announcementActive ? "bg-amber-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.announcementActive ? "translate-x-6" : ""
                  }`}
                />
              </button>
              <span className="text-sm font-semibold text-zinc-300">
                {form.announcementActive ? "Duyuru Aktif" : "Duyuru Kapalı"}
              </span>
            </div>

            <Field label="Duyuru Metni">
              <input
                value={form.announcementText ?? ""}
                onChange={(e) => set("announcementText", e.target.value)}
                placeholder="🎉 Yeni perde koleksiyonu geldi! Özel ölçü seçeneklerini keşfedin..."
                className={inputCls}
              />
            </Field>

            <Field label="Renk Teması">
              <div className="flex gap-2 flex-wrap mt-1">
                {ANNOUNCEMENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set("announcementColor", c.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                      form.announcementColor === c.id
                        ? "border-white"
                        : "border-transparent hover:border-zinc-600"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.cls}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>

            {form.announcementText && (
              <div className="rounded-xl overflow-hidden border border-zinc-800">
                <p className="text-xs text-zinc-500 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">Önizleme</p>
                <div className={`flex items-center justify-center gap-2 px-10 py-2.5 text-sm font-semibold ${
                  { amber: "bg-amber-500", red: "bg-red-500", green: "bg-emerald-600", blue: "bg-blue-600", zinc: "bg-zinc-900", rose: "bg-rose-500" }[form.announcementColor ?? "amber"]
                } text-white`}>
                  <Megaphone className="w-4 h-4 opacity-80" />
                  {form.announcementText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VIDEO ── */}
        {tab === "video" && (
          <div className="space-y-6">
            <SectionHeader icon={Video} title="Anasayfa Video" desc="YouTube linki girin veya doğrudan cihazınızdan video yükleyin." />

            {/* YouTube URL */}
            <div className="space-y-3">
              <Field label="YouTube Linki">
                <input
                  value={form.homepageVideoSource === "youtube" ? (form.homepageVideoUrl ?? "") : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    set("homepageVideoUrl", val || null);
                    set("homepageVideoSource", val ? "youtube" : null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputCls}
                />
              </Field>
              <p className="text-xs text-zinc-500">youtube.com, m.youtube.com veya youtu.be/... linklerini destekler.</p>

              {form.homepageVideoSource === "youtube" && form.homepageVideoUrl && (() => {
                const ytMatch = form.homepageVideoUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                const ytId = ytMatch?.[1];
                return ytId ? (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-400 font-semibold">✓ Video ID: {ytId}</p>
                    <div className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-video max-w-sm">
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube önizleme" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white ml-1"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/></svg>
                        YouTube
                      </div>
                    </div>
                  </div>
                ) : <p className="text-xs text-red-400">Geçerli bir YouTube linki girin.</p>;
              })()}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-700" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">VEYA</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>

            {/* Cihazdan yükle */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-zinc-400" />
                Cihazdan Video Yükle
              </p>
              <p className="text-xs text-zinc-500">Telefon veya bilgisayarınızdan MP4, WebM, MOV, M4V — maks 200 MB</p>
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                disabled={uploadingVideo}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {uploadingVideo ? <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...</> : <><Upload className="w-4 h-4" /> Telefon / Bilgisayardan Video Seç</>}
              </button>
              <input
                ref={videoRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.m4v"
                className="hidden"
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const file = input.files?.[0];
                  if (!file) return;
                  input.value = "";

                  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
                  const looksLikeVideo = file.type.toLowerCase().startsWith("video/") ||
                    ["mp4", "webm", "mov", "m4v", "avi"].includes(extension);
                  if (!looksLikeVideo) {
                    alert("Lütfen MP4, WebM, MOV veya M4V formatında bir video seçin.");
                    return;
                  }
                  if (file.size > 200 * 1024 * 1024) {
                    alert("Video dosyası 200 MB'dan büyük olamaz.");
                    return;
                  }

                  setUploadingVideo(true);
                  try {
                    const url = await uploadVideoDirectly(file);
                    set("homepageVideoUrl", url);
                    set("homepageVideoSource", "upload");
                  } catch (err: any) {
                    const message = err?.message === "The string did not match the expected pattern."
                      ? "Telefon tarayıcısı bu videoyu yüklemeye hazırlayamadı. Videoyu MP4 veya MOV olarak kaydedip tekrar deneyin."
                      : (err?.message ?? "Video yüklenemedi.");
                    alert(message);
                  } finally {
                    setUploadingVideo(false);
                  }
                }}
              />
              {form.homepageVideoSource === "upload" && form.homepageVideoUrl && (
                <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                  <Video className="w-5 h-5 text-violet-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300 truncate flex-1">{form.homepageVideoUrl.split("/").pop()}</span>
                  <button type="button" onClick={() => { set("homepageVideoUrl", null); set("homepageVideoSource", null); }} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mevcut videoyu temizle */}
            {form.homepageVideoUrl && (
              <button
                type="button"
                onClick={() => { set("homepageVideoUrl", null); set("homepageVideoSource", null); }}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" /> Videoyu Kaldır (Anasayfada gösterilmez)
              </button>
            )}

            <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">💡 Nasıl çalışır?</p>
              <p className="text-xs text-zinc-400">YouTube linki <span className="text-white">veya</span> cihazınızdan yüklediğiniz video — anasayfada müşterilerin göreceği bir bölümde oynatılır. Kaydet butonuna basmayı unutmayın.</p>
            </div>
          </div>
        )}

        {/* ── KARGO AYARLARI ── */}
        {tab === "shipping" && (
          <div className="space-y-6">
            <SectionHeader icon={Truck} title="Kargo Ayarları" desc="Ücretsiz kargo sınırı ve standart kargo ücreti" />

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Ücretsiz Kargo Sınırı (₺)" desc="Bu tutarın üzerindeki siparişlerde kargo ücretsiz">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₺</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={shippingInputs.freeShippingThreshold}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = Number(value.replace(",", "."));
                      setShippingInputs((prev) => ({ ...prev, freeShippingThreshold: value }));
                      set(
                        "freeShippingThreshold",
                        value.trim() && Number.isFinite(numericValue) ? numericValue : undefined,
                      );
                    }}
                    className={inputCls + " pl-7"}
                  />
                </div>
              </Field>

              <Field label="Standart Kargo Ücreti (₺)" desc="Ücretsiz kargo sınırının altındaki siparişler için">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₺</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={shippingInputs.shippingFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = Number(value.replace(",", "."));
                      setShippingInputs((prev) => ({ ...prev, shippingFee: value }));
                      set(
                        "shippingFee",
                        value.trim() && Number.isFinite(numericValue) ? numericValue : undefined,
                      );
                    }}
                    className={inputCls + " pl-7"}
                  />
                </div>
              </Field>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Önizleme
              </p>
              <p className="text-sm text-zinc-300">
                <span className="font-semibold text-white">
                  ₺{Number.isFinite(shippingThresholdPreview) ? shippingThresholdPreview.toLocaleString("tr-TR") : "—"}
                </span>{" "}
                ve üzeri siparişlerde ücretsiz kargo.
                <br />
                Altındaki siparişlerde{" "}
                <span className="font-semibold text-white">
                  ₺{Number.isFinite(shippingFeePreview)
                    ? shippingFeePreview.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
                    : "—"}
                </span>{" "}
                kargo ücreti uygulanır.
              </p>
            </div>

            <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                ⚠️ Bu ayarlar sepet sayfası, ödeme sayfası ve sipariş API'sindeki kargo hesaplamasını etkiler. Kaydet butonuna basıp sitenizi yenilemeniz gerekebilir.
              </p>
            </div>
          </div>
        )}

        {/* ── İLETİŞİM ── */}
        {tab === "mail" && (
          <div className="space-y-6">
            <SectionHeader icon={Mail} title="Mail Sistemi Testi" desc="SMTP ayarlarınızın çalışıp çalışmadığını doğrulayın" />

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
              <p className="text-zinc-400 text-sm leading-relaxed">
                SMTP bilgilerini Replit Secrets'a ekledikten sonra buradan test maili gönderebilirsiniz.
                Mail başarıyla ulaşırsa sistem çalışıyor demektir.
              </p>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1.5">
                    Alıcı E-posta (boş bırakırsanız kendi hesabınıza gider)
                  </label>
                  <input
                    type="email"
                    value={testMailTo}
                    onChange={(e) => { setTestMailTo(e.target.value); setTestMailStatus("idle"); setTestMailMsg(""); }}
                    placeholder="test@ornek.com"
                    className={inputCls}
                  />
                </div>
                <button
                  onClick={sendTestMail}
                  disabled={testMailStatus === "sending"}
                  className="self-end flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  {testMailStatus === "sending"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…</>
                    : <><Send className="w-4 h-4" /> Test Maili Gönder</>}
                </button>
              </div>

              {testMailMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm font-semibold border ${
                  testMailStatus === "ok"
                    ? "bg-green-950/30 border-green-700/50 text-green-400"
                    : "bg-red-950/30 border-red-700/50 text-red-400"
                }`}>
                  {testMailMsg}
                </div>
              )}
            </div>

            <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Gerekli Secrets (Replit Sol Menü → Secrets)</p>
              <div className="space-y-2 font-mono text-sm">
                {[
                  { key: "SMTP_HOST", val: "smtp.gmail.com" },
                  { key: "SMTP_PORT", val: "587" },
                  { key: "SMTP_USER", val: "gmail-adresiniz@gmail.com" },
                  { key: "SMTP_PASS", val: "16-haneli-uygulama-sifresi" },
                  { key: "SMTP_FROM", val: "gmail-adresiniz@gmail.com" },
                ].map(({ key, val }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-amber-400 w-28 flex-shrink-0">{key}</span>
                    <span className="text-zinc-500">→</span>
                    <span className="text-zinc-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "contact" && (
          <div className="space-y-5">
            <SectionHeader icon={Phone} title="İletişim Bilgileri" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Telefon">
                <input
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+90 555 555 55 55"
                  className={inputCls}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  value={form.whatsapp ?? ""}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  placeholder="+90 555 555 55 55"
                  className={inputCls}
                />
              </Field>
              <Field label="E-posta">
                <input
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="info@gocmenperde.com.tr"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Adres">
              <textarea
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
                placeholder="Osmangazi, Bursa"
                className={`${inputCls} resize-none`}
              />
            </Field>

            <hr className="border-zinc-800" />
            <SectionHeader icon={Instagram} title="Sosyal Medya" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Instagram">
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    value={form.socialInstagram ?? ""}
                    onChange={(e) => set("socialInstagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Facebook">
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    value={form.socialFacebook ?? ""}
                    onChange={(e) => set("socialFacebook", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Twitter / X">
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    value={form.socialTwitter ?? ""}
                    onChange={(e) => set("socialTwitter", e.target.value)}
                    placeholder="https://twitter.com/..."
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold border border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-all"
        >
          <Eye className="w-4 h-4" />
          Önizle
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 hover:bg-amber-400 text-zinc-900"
          } disabled:opacity-60`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Kaydedildi!" : saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {/* ── ÖNİZLEME PANELİ ── */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setPreviewOpen(false)}
        >
          {/* Karartma */}
          <div className="flex-1 bg-black/60 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 overflow-y-auto flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer başlık */}
            <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="font-black text-white text-sm">Canlı Önizleme</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">Kaydedilmemiş değişiklikler</span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Duyuru çubuğu */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Duyuru Çubuğu</p>
                {form.announcementActive && form.announcementText ? (
                  <div className={`text-white text-xs text-center py-2.5 px-4 rounded-xl font-semibold ${{
                    amber: "bg-amber-500",
                    red: "bg-red-500",
                    green: "bg-emerald-600",
                    blue: "bg-blue-600",
                    zinc: "bg-zinc-800",
                    rose: "bg-rose-500",
                  }[form.announcementColor ?? "amber"] ?? "bg-amber-500"}`}>
                    {form.announcementText}
                  </div>
                ) : (
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-2.5 px-4 text-xs text-zinc-500 text-center italic">
                    Duyuru kapalı veya metin girilmemiş
                  </div>
                )}
              </div>

              {/* Navbar */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Navbar (Site Başlığı)</p>
                <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-zinc-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <span className="font-black text-zinc-900 text-sm">{form.siteName || "Göçmen Perde"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-2">
                      {["Ürünler", "Hakkımızda", "İletişim"].map((t) => (
                        <div key={t} className="text-[10px] text-zinc-400 font-medium">{t}</div>
                      ))}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              {form.faviconUrl && (
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Tarayıcı Sekmesi (Favicon)</p>
                  <div className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-zinc-700">
                    <img src={form.faviconUrl} alt="Favicon" className="w-5 h-5 object-contain flex-shrink-0" />
                    <span className="text-xs text-zinc-300 truncate">{form.siteName || "Göçmen Perde"}</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Hero bölümü */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Anasayfa Hero Bölümü</p>
                <div className="bg-gradient-to-br from-zinc-50 to-amber-50/40 rounded-xl p-5 border border-zinc-100 space-y-2.5">
                  {form.heroBadge && (
                    <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                      {form.heroBadge}
                    </span>
                  )}
                  {form.heroTitle ? (
                    <h3 className="text-base font-black text-zinc-900 leading-tight">{form.heroTitle}</h3>
                  ) : (
                    <div className="h-5 w-2/3 bg-zinc-200 rounded-lg animate-pulse" />
                  )}
                  {form.heroSubtitle ? (
                    <p className="text-xs font-semibold text-amber-600">{form.heroSubtitle}</p>
                  ) : (
                    <div className="h-3 w-1/2 bg-zinc-200 rounded animate-pulse" />
                  )}
                  {form.heroDesc && (
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{form.heroDesc}</p>
                  )}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    {form.heroCtaPrimaryText ? (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">
                        {form.heroCtaPrimaryText}
                      </span>
                    ) : (
                      <div className="h-6 w-24 bg-amber-200 rounded-lg animate-pulse" />
                    )}
                    {form.heroCtaSecText && (
                      <span className="border border-zinc-300 text-zinc-600 text-[10px] font-semibold px-3 py-1.5 rounded-lg">
                        {form.heroCtaSecText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* İletişim bilgileri */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">İletişim & Sosyal</p>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-2 border border-zinc-800">
                  {[
                    { icon: Phone, label: form.phone, placeholder: "Telefon girilmemiş" },
                    { icon: Mail, label: form.email, placeholder: "E-posta girilmemiş" },
                    { icon: MessageCircle, label: form.whatsapp, placeholder: "WhatsApp girilmemiş" },
                    { icon: MapPin, label: form.address, placeholder: "Adres girilmemiş" },
                    { icon: Instagram, label: form.socialInstagram, placeholder: "Instagram girilmemiş" },
                  ].map(({ icon: Icon, label, placeholder }) => (
                    <div key={placeholder} className="flex items-start gap-2.5">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${label ? "text-amber-400" : "text-zinc-600"}`} />
                      <span className={`text-xs leading-snug ${label ? "text-zinc-200" : "text-zinc-600 italic"}`}>
                        {label || placeholder}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alt bar */}
            <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 flex gap-2">
              <button
                onClick={() => setPreviewOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={() => { setPreviewOpen(false); handleSave(); }}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600";

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</label>
      {desc && <p className="text-[11px] text-zinc-500">{desc}</p>}
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-amber-500" />
      </div>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        {desc && <p className="text-zinc-500 text-xs">{desc}</p>}
      </div>
    </div>
  );
}
