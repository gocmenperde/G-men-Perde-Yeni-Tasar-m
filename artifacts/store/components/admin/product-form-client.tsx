"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Save, ArrowLeft, X, Upload, Loader2, Globe, Check, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { uploadAdminImage } from "./media-upload";

interface ProductFormData {
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl?: string;
}

interface EnrichResult {
  images: string[];
  price: number | null;
  descriptionCandidates: { text: string; source: string }[];
  sources: string[];
  googleSearchUrl?: string;
  trendyolUrl?: string;
}

export default function ProductFormClient({
  product,
  categories,
  brands,
}: {
  product?: any;
  categories: any[];
  brands: any[];
}) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [brandOptions, setBrandOptions] = useState(brands);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [taxonomyModal, setTaxonomyModal] = useState<"category" | "brand" | null>(null);
  const [taxonomyName, setTaxonomyName] = useState("");
  const [taxonomyImage, setTaxonomyImage] = useState("");
  const [taxonomyUploading, setTaxonomyUploading] = useState(false);
  const [taxonomySaving, setTaxonomySaving] = useState(false);
  const isEdit = !!product;

  const [fetchingFor, setFetchingFor] = useState<"image" | "price" | "description" | null>(null);
  const [enrichData, setEnrichData] = useState<EnrichResult | null>(null);
  const [enrichPanel, setEnrichPanel] = useState<"image" | "price" | "description" | null>(null);
  const [expandDesc, setExpandDesc] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ? Number(product.price) : 0,
      comparePrice: product?.comparePrice ? Number(product.comparePrice) : undefined,
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  const watchedName = watch("name");
  const watchedBrand = watch("brandId");
  const brandName = brandOptions.find(b => b.id === watchedBrand)?.name ?? "";

  const removeImage = (url: string) => setImages((prev) => prev.filter((i) => i !== url));

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const imageUrl = await uploadAdminImage(file);
      setImages((prev) => (prev.includes(imageUrl) ? prev : [...prev, imageUrl]));
      toast.success("Görsel yüklendi!");
    } catch (err: any) {
      toast.error(err.message ?? "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await uploadImage(file);
  };

  const openTaxonomyModal = (type: "category" | "brand") => {
    setTaxonomyModal(type);
    setTaxonomyName("");
    setTaxonomyImage("");
  };

  const uploadTaxonomyImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setTaxonomyUploading(true);
    try {
      setTaxonomyImage(await uploadAdminImage(file));
      toast.success("Görsel yüklendi.");
    } catch (err: any) {
      toast.error(err.message ?? "Görsel yüklenemedi.");
    } finally {
      setTaxonomyUploading(false);
    }
  };

  const createTaxonomy = async () => {
    const name = taxonomyName.trim();
    if (!taxonomyModal || !name) {
      toast.error("Ad zorunludur.");
      return;
    }

    setTaxonomySaving(true);
    try {
      const isCategory = taxonomyModal === "category";
      const response = await fetch(isCategory ? "/api/categories" : "/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCategory
          ? { name, image: taxonomyImage || null }
          : { name, logo: taxonomyImage || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Kayıt oluşturulamadı.");

      if (isCategory) {
        setCategoryOptions((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name, "tr")));
        setValue("categoryId", result.data.id, { shouldDirty: true });
      } else {
        setBrandOptions((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name, "tr")));
        setValue("brandId", result.data.id, { shouldDirty: true });
      }
      setTaxonomyModal(null);
      toast.success(`${isCategory ? "Kategori" : "Marka"} oluşturuldu ve ürüne seçildi.`);
    } catch (err: any) {
      toast.error(err.message ?? "Kayıt oluşturulamadı.");
    } finally {
      setTaxonomySaving(false);
    }
  };

  const fetchFromInternet = async (field: "image" | "price" | "description") => {
    const name = watchedName?.trim();
    if (!name) { toast.error("Önce ürün adını girin."); return; }
    setFetchingFor(field);
    setEnrichData(null);
    setEnrichPanel(null);
    try {
      const res = await fetch("/api/admin/product-enrich/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand: brandName || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Arama başarısız");
      setEnrichData(data);
      setEnrichPanel(field);
    } catch (err: any) {
      toast.error(err.message ?? "İnternet araması başarısız.");
    } finally {
      setFetchingFor(null);
    }
  };

  const applyPrice = (price: number) => {
    setValue("price", price, { shouldValidate: true });
    setEnrichPanel(null);
    toast.success(`Fiyat güncellendi: ₺${price.toLocaleString("tr-TR")}`);
  };

  const applyDescription = (text: string) => {
    setValue("description", text, { shouldValidate: true });
    setEnrichPanel(null);
    toast.success("Açıklama güncellendi.");
  };

  const applyImage = (url: string) => {
    setImages((prev) => prev.includes(url) ? prev : [...prev, url]);
    toast.success("Görsel eklendi.");
  };

  const applyAllImages = () => {
    if (!enrichData) return;
    const newImgs = enrichData.images.filter(u => !images.includes(u)).slice(0, 5);
    setImages((prev) => [...prev, ...newImgs]);
    setEnrichPanel(null);
    toast.success(`${newImgs.length} görsel eklendi.`);
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
          stock: Number(data.stock),
          images,
          sku: data.sku || null,
          categoryId: data.categoryId || null,
          brandId: data.brandId || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Hata");
      toast.success(isEdit ? "Ürün güncellendi!" : "Ürün oluşturuldu!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message ?? "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-black text-white">{isEdit ? "Ürün Düzenle" : "Yeni Ürün"}</h1>
      </div>

      {/* Enrich Panels */}
      {enrichPanel && enrichData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {enrichPanel === "image" && "Görsel Seç"}
                  {enrichPanel === "price" && "Fiyat Seç"}
                  {enrichPanel === "description" && "Açıklama Seç"}
                </h2>
                {enrichData.sources.length > 0 && (
                  <p className="text-xs text-zinc-400 mt-0.5">Kaynak: {enrichData.sources.join(", ")}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {enrichData.googleSearchUrl && (
                  <a href={enrichData.googleSearchUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700">
                    <Globe className="w-3.5 h-3.5" /> Google'da Ara
                  </a>
                )}
                <button onClick={() => setEnrichPanel(null)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              {/* IMAGE PANEL */}
              {enrichPanel === "image" && (
                <div className="space-y-4">
                  {enrichData.images.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-8">Görsel bulunamadı. Google'da manuel arayabilirsiniz.</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-zinc-400">{enrichData.images.length} görsel bulundu. Eklemek istediklerinize tıklayın.</p>
                        <button onClick={applyAllImages}
                          className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-3 py-1.5 rounded-lg transition-colors">
                          Tümünü Ekle (max 5)
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {enrichData.images.slice(0, 20).map((url, i) => {
                          const already = images.includes(url);
                          return (
                            <button key={i} onClick={() => applyImage(url)} disabled={already}
                              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${already ? "border-green-500 opacity-60" : "border-zinc-700 hover:border-amber-500"}`}>
                              <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              {already && (
                                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-green-400" />
                                </div>
                              )}
                              {!already && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100">Ekle</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PRICE PANEL */}
              {enrichPanel === "price" && (
                <div className="space-y-3">
                  {enrichData.price === null ? (
                    <p className="text-zinc-400 text-sm text-center py-8">Fiyat bulunamadı.</p>
                  ) : (
                    <button onClick={() => applyPrice(enrichData.price!)}
                      className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500 rounded-xl px-5 py-4 transition-all group">
                      <div>
                        <p className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                          ₺{enrichData.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">Kaynak: {enrichData.sources.join(", ")}</p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 group-hover:text-amber-400 transition-colors">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-semibold">Uygula</span>
                      </div>
                    </button>
                  )}
                  {enrichData.trendyolUrl && (
                    <a href={enrichData.trendyolUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors mt-2">
                      <Globe className="w-4 h-4" /> Trendyol'da kontrol et
                    </a>
                  )}
                </div>
              )}

              {/* DESCRIPTION PANEL */}
              {enrichPanel === "description" && (
                <div className="space-y-3">
                  {enrichData.descriptionCandidates.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-8">Açıklama bulunamadı.</p>
                  ) : (
                    enrichData.descriptionCandidates.map((candidate, i) => (
                      <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{candidate.source}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setExpandDesc(expandDesc === i ? null : i)}
                              className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                              {expandDesc === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button onClick={() => applyDescription(candidate.text)}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              <Check className="w-3.5 h-3.5" /> Uygula
                            </button>
                          </div>
                        </div>
                        <div className={`px-4 py-3 text-sm text-zinc-300 leading-relaxed ${expandDesc === i ? "" : "line-clamp-3"}`}>
                          {candidate.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {taxonomyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Yeni {taxonomyModal === "category" ? "Kategori" : "Marka"}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">Oluşturulduktan sonra bu ürün için otomatik seçilir.</p>
              </div>
              <button type="button" onClick={() => setTaxonomyModal(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              value={taxonomyName}
              onChange={(event) => setTaxonomyName(event.target.value)}
              placeholder={`${taxonomyModal === "category" ? "Kategori" : "Marka"} adı`}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/70 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-300">
                {taxonomyUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {taxonomyUploading ? "Yükleniyor..." : "Bilgisayar/telefondan görsel seç"}
                <input type="file" accept="image/*" className="hidden" onChange={uploadTaxonomyImage} disabled={taxonomyUploading} />
              </label>
              {taxonomyImage && (
                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-2">
                  <img src={taxonomyImage} alt="Seçilen görsel" className="h-14 w-14 rounded-lg object-cover" />
                  <button type="button" onClick={() => setTaxonomyImage("")} className="text-xs text-zinc-400 hover:text-red-400">Görseli kaldır</button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setTaxonomyModal(null)} className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-700">İptal</button>
              <button type="button" onClick={createTaxonomy} disabled={taxonomySaving || taxonomyUploading} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-900 hover:bg-amber-400 disabled:opacity-50">
                {taxonomySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Oluştur ve seç
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5">
          <h2 className="font-semibold text-white">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Ürün Adı *</label>
              <input {...register("name", { required: true })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm" />
              {errors.name && <p className="text-red-400 text-xs mt-1">Zorunlu alan.</p>}
            </div>

            {/* Fiyat + Çek Butonu */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Fiyat (₺) *</label>
              <div className="flex gap-2">
                <input {...register("price", { required: true, min: 0 })} type="number" step="0.01"
                  className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm" />
                <button type="button" onClick={() => fetchFromInternet("price")} disabled={fetchingFor === "price"}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0">
                  {fetchingFor === "price" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  {fetchingFor === "price" ? "Arıyor..." : "Çek"}
                </button>
              </div>
              {errors.price && <p className="text-red-400 text-xs mt-1">Zorunlu alan.</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Karşılaştırma Fiyatı (₺)</label>
              <input {...register("comparePrice")} type="number" step="0.01" className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Stok</label>
              <input {...register("stock")} type="number" className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">SKU</label>
              <input {...register("sku")} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Kategori</label>
              <div className="flex gap-2">
                <select {...register("categoryId")} className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500">
                  <option value="">Seçiniz</option>
                  {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => openTaxonomyModal("category")} className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-amber-400 transition-colors hover:border-amber-500 hover:bg-zinc-700" title="Yeni kategori ekle">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Marka</label>
              <div className="flex gap-2">
                <select {...register("brandId")} className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500">
                  <option value="">Seçiniz</option>
                  {brandOptions.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button type="button" onClick={() => openTaxonomyModal("brand")} className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-amber-400 transition-colors hover:border-amber-500 hover:bg-zinc-700" title="Yeni marka ekle">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Açıklama + Çek Butonu */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Açıklama</label>
                <button type="button" onClick={() => fetchFromInternet("description")} disabled={fetchingFor === "description"}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  {fetchingFor === "description" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                  {fetchingFor === "description" ? "Arıyor..." : "İnternetten Çek"}
                </button>
              </div>
              <textarea {...register("description")} rows={4}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-500 text-sm resize-none" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isFeatured")} type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm text-zinc-300">Öne Çıkan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register("isActive")} type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              <span className="text-sm text-zinc-300">Aktif</span>
            </label>
          </div>
        </div>

        {/* Görseller */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">Görseller</h2>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Yükleniyor..." : "Cihazdan Seç"}
              <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} disabled={uploading} />
            </label>
            <button type="button" onClick={() => fetchFromInternet("image")} disabled={fetchingFor === "image"}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              {fetchingFor === "image" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {fetchingFor === "image" ? "Arıyor..." : "İnternetten Görsel Çek"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Telefon veya bilgisayarınızdan görsel seçebilirsiniz. (Maks. 5MB)</p>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt="Ürün görseli" className="w-24 h-24 rounded-xl object-cover border border-zinc-700" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-8 py-3 rounded-xl disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" /> {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <Link href="/admin/products" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition-colors">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
