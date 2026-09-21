"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Award, Edit2, Check, X, Upload, Wand2, AlertTriangle, ImageIcon, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { uploadAdminImage } from "./media-upload";

interface BrandForm { name: string; logo?: string; }

type FetchStatus = "idle" | "running" | "done";
interface FetchLog { name: string; status: "ok" | "fail" }

export default function AdminBrandsClient({ brands: initial }: { brands: any[] }) {
  const [brands, setBrands] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [editLogoPreview, setEditLogoPreview] = useState("");
  const [fixPreview, setFixPreview] = useState<any[] | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchLog, setFetchLog] = useState<FetchLog[]>([]);
  const [fetchCurrent, setFetchCurrent] = useState("");
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchTotal, setFetchTotal] = useState(0);
  const stopRef = useRef(false);

  const fetchAllLogos = async () => {
    const targets = brands.filter(b => !b.logo);
    if (targets.length === 0) { toast("Tüm markaların zaten logosu var!"); return; }
    stopRef.current = false;
    setFetchStatus("running");
    setFetchLog([]);
    setFetchProgress(0);
    setFetchTotal(targets.length);

    for (let i = 0; i < targets.length; i++) {
      if (stopRef.current) break;
      const brand = targets[i];
      setFetchCurrent(brand.name);
      setFetchProgress(i);
      try {
        const res = await fetch("/api/admin/brand-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandId: brand.id, brandSlug: brand.slug, brandName: brand.name }),
        });
        const data = await res.json();
        if (data.saved && data.logo) {
          setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, logo: data.logo } : b));
          setFetchLog(prev => [{ name: brand.name, status: "ok" }, ...prev]);
        } else {
          setFetchLog(prev => [{ name: brand.name, status: "fail" }, ...prev]);
        }
      } catch {
        setFetchLog(prev => [{ name: brand.name, status: "fail" }, ...prev]);
      }
      await new Promise(r => setTimeout(r, 800));
    }
    setFetchProgress(targets.length);
    setFetchCurrent("");
    setFetchStatus("done");
    toast.success("Marka logoları tamamlandı!");
  };

  const previewNumericBrands = async () => {
    setIsPreviewing(true);
    try {
      const res = await fetch("/api/admin/fix-brands");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFixPreview(data.preview ?? []);
      if ((data.preview ?? []).length === 0) {
        toast.success("Sayısal marka bulunamadı! Tüm markalar temiz.");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Ön izleme başarısız.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const applyFix = async () => {
    if (!confirm(`${fixPreview?.length ?? 0} sayısal marka silinecek ve ürünleri "Bilinmeyen Marka"ya taşınacak. Emin misiniz?`)) return;
    setIsFixing(true);
    try {
      const res = await fetch("/api/admin/fix-brands", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setFixPreview(null);
      // Listeyi yenile
      const brandsRes = await fetch("/api/brands");
      const brandsData = await brandsRes.json();
      setBrands(brandsData.data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Düzeltme başarısız.");
    } finally {
      setIsFixing(false);
    }
  };
  const { register, handleSubmit, reset, setValue } = useForm<BrandForm>();

  const handleLogoFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    setter: (v: string) => void,
    previewSetter: (v: string) => void,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadAdminImage(file);
      previewSetter(url);
      setter(url);
      toast.success("Marka logosu yüklendi.");
    } catch (err: any) {
      toast.error(err.message ?? "Logo yüklenemedi.");
    } finally {
      setUploadingKey(null);
    }
  };

  const onSubmit = async (data: BrandForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, logo: logoPreview || data.logo || null }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setBrands((prev) => [...prev, { ...result.data, _count: { products: 0 } }]);
      toast.success("Marka oluşturuldu!");
      reset();
      setLogoPreview("");
    } catch (err: any) {
      toast.error(err.message ?? "Oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (brand: any) => {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditLogo(brand.logo ?? "");
    setEditLogoPreview(brand.logo ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLogo("");
    setEditLogoPreview("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) { toast.error("Ad boş olamaz."); return; }
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, logo: editLogo || null }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setBrands((prev) =>
        prev.map((b) => b.id === id ? { ...b, name: editName, logo: editLogo || null } : b)
      );
      toast.success("Marka güncellendi!");
      cancelEdit();
    } catch (err: any) {
      toast.error(err.message ?? "Güncellenemedi.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Bu markayı silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi.");
      setBrands((prev) => prev.filter((b) => b.id !== id));
      toast.success("Marka silindi.");
    } catch {
      toast.error("Silinemedi. Bu markaya ait ürünler olabilir.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black text-white">Markalar</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={previewNumericBrands}
            disabled={isPreviewing || isFixing}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {isPreviewing ? "Taranıyor…" : "Sayısal Markaları Tara & Düzelt"}
          </button>
          <button
            onClick={fetchStatus === "running" ? () => { stopRef.current = true; setFetchStatus("idle"); } : fetchAllLogos}
            disabled={fetchStatus === "running" && stopRef.current}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              fetchStatus === "running"
                ? "bg-red-700 hover:bg-red-600 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-900"
            }`}
          >
            {fetchStatus === "running"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Durdur</>
              : <><ImageIcon className="w-4 h-4" /> Logoları Otomatik Çek</>}
          </button>
        </div>
      </div>

      {/* Logo çekme ilerleme paneli */}
      {(fetchStatus === "running" || fetchStatus === "done") && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              {fetchStatus === "running"
                ? <><Loader2 className="w-4 h-4 animate-spin text-amber-400" /> İşleniyor: <span className="text-amber-400">{fetchCurrent}</span></>
                : <><CheckCircle className="w-4 h-4 text-green-400" /> Tamamlandı</>}
            </p>
            <span className="text-xs text-zinc-500">{fetchProgress}/{fetchTotal}</span>
          </div>
          {fetchTotal > 0 && (
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((fetchProgress / fetchTotal) * 100, 100)}%` }}
              />
            </div>
          )}
          {fetchLog.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1 pt-1">
              {fetchLog.map((l, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {l.status === "ok"
                    ? <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    : <span className="w-3 h-3 rounded-full bg-zinc-700 shrink-0 inline-block" />}
                  <span className={l.status === "ok" ? "text-zinc-300" : "text-zinc-600"}>{l.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sayısal Marka Düzeltme Paneli */}
      {fixPreview !== null && fixPreview.length > 0 && (
        <div className="bg-orange-950/30 border border-orange-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-base">
              {fixPreview.length} sayısal/hatalı marka tespit edildi
            </h2>
          </div>
          <p className="text-sm text-orange-300/80">
            Aşağıdaki markalar tamamen rakamlardan veya barkod formatından oluşuyor.
            "Düzelt" butonuna basınca bu markalar silinir, ürünleri <strong>"Bilinmeyen Marka"</strong>ya taşınır.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-orange-800/50">
                  <th className="text-left py-2 px-3 text-orange-400 text-xs uppercase">Marka Adı</th>
                  <th className="text-left py-2 px-3 text-orange-400 text-xs uppercase">Slug</th>
                  <th className="text-left py-2 px-3 text-orange-400 text-xs uppercase">Ürün Sayısı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-900/30">
                {fixPreview.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 font-mono text-orange-200">{b.name}</td>
                    <td className="py-2 px-3 font-mono text-orange-400/70 text-xs">{b.slug}</td>
                    <td className="py-2 px-3 text-orange-300">{b._count?.products ?? 0} ürün</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={applyFix}
              disabled={isFixing}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              {isFixing ? "Düzeltiliyor…" : `${fixPreview.length} Markayı Düzelt`}
            </button>
            <button
              onClick={() => setFixPreview(null)}
              className="px-5 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Yeni Marka Formu */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" /> Yeni Marka Ekle
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            {...register("name", { required: true })}
            placeholder="Marka adı *"
            className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
          />
          <input
            {...register("logo")}
            placeholder="Logo URL (opsiyonel)"
            className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
          />
          <label className={`flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors text-sm text-zinc-400 ${uploadingKey === "new" ? "pointer-events-none opacity-60" : ""}`}>
            {uploadingKey === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploadingKey === "new" ? "Yükleniyor..." : logoPreview ? "Logo yüklendi ✓" : "Bilgisayar/telefondan logo seç"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e, "new", setLogoPreview, setLogoPreview)} disabled={uploadingKey !== null} />
          </label>
          <button
            type="submit"
            disabled={isSubmitting || uploadingKey !== null}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </form>
        {logoPreview && (
          <div className="mt-3 flex items-center gap-2">
            <img src={logoPreview} alt="Logo önizleme" className="h-12 max-w-[120px] object-contain bg-white rounded-lg p-1 border border-zinc-700" />
            <button onClick={() => setLogoPreview("")} className="text-xs text-zinc-500 hover:text-red-400">Kaldır</button>
          </div>
        )}
      </div>

      {/* Marka Listesi */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-zinc-400 text-sm">{brands.length} marka</p>
        </div>
        {brands.length === 0 ? (
          <div className="py-12 text-center">
            <Award className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-400 text-sm">Henüz marka yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Logo", "Marka", "Slug", "Ürün Sayısı", "İşlem"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === brand.id ? (
                        <div className="flex items-center gap-2">
                          {editLogoPreview && (
                            <img src={editLogoPreview} alt="" className="h-8 max-w-[80px] object-contain bg-white rounded p-0.5 border border-zinc-600" />
                          )}
                           <label className={`cursor-pointer text-amber-500 hover:text-amber-400 ${uploadingKey === `edit-${brand.id}` ? "pointer-events-none opacity-60" : ""}`}>
                             {uploadingKey === `edit-${brand.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e, `edit-${brand.id}`, setEditLogo, setEditLogoPreview)} disabled={uploadingKey !== null} />
                          </label>
                        </div>
                      ) : brand.logo ? (
                        <div className="bg-white rounded-lg p-1 inline-flex border border-zinc-700">
                          <img src={brand.logo} alt={brand.name} className="h-8 max-w-[80px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      ) : (
                        <div className="w-10 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <Award className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === brand.id ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-1.5 bg-zinc-800 border border-amber-500/50 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500 w-48"
                            autoFocus
                          />
                          <input
                            value={editLogo}
                            onChange={(e) => { setEditLogo(e.target.value); setEditLogoPreview(e.target.value); }}
                            placeholder="Logo URL"
                            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs focus:outline-none focus:border-amber-500 w-48"
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-zinc-200">{brand.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs">{brand.slug}</td>
                    <td className="px-6 py-4 text-zinc-400">{brand._count?.products ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {editingId === brand.id ? (
                          <>
                            <button onClick={() => saveEdit(brand.id)} className="p-2 hover:bg-green-950/30 rounded-lg transition-colors text-green-400 hover:text-green-300">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(brand)} className="p-2 hover:bg-amber-950/30 rounded-lg transition-colors text-zinc-500 hover:text-amber-400">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(brand.id)} className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-zinc-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
