"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Tags, Edit2, Check, X, Upload, ImageIcon, Loader2, CheckCircle, AlertCircle, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadAdminImage } from "./media-upload";

interface CatForm { name: string; image?: string; }

type FetchStatus = "idle" | "running" | "done";
interface FetchLog { name: string; status: "ok" | "fail" }

export default function AdminCategoriesClient({ categories: initial }: { categories: any[] }) {
  const [categories, setCategories] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchLog, setFetchLog] = useState<FetchLog[]>([]);
  const [fetchCurrent, setFetchCurrent] = useState("");
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchTotal, setFetchTotal] = useState(0);
  const stopRef = useRef(false);

  const [emptyPreview, setEmptyPreview] = useState<any[] | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const previewEmpty = async () => {
    setIsPreviewing(true);
    try {
      const res = await fetch("/api/admin/fix-categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmptyPreview(data.preview ?? []);
      if ((data.preview ?? []).length === 0) toast.success("Boş kategori yok, tüm kategoriler temiz!");
    } catch (e: any) {
      toast.error(e.message ?? "Tarama başarısız.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const deleteEmpty = async () => {
    if (!confirm(`${emptyPreview?.length ?? 0} boş kategori silinecek. Emin misiniz?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/fix-categories", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setEmptyPreview(null);
      setCategories((prev) => prev.filter((c) => (c._count?.products ?? 0) > 0));
    } catch (e: any) {
      toast.error(e.message ?? "Silme başarısız.");
    } finally {
      setIsDeleting(false);
    }
  };

  const { register, handleSubmit, reset, setValue } = useForm<CatForm>();

  const onSubmit = async (data: CatForm) => {
    if (!data.image) data.image = undefined;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCategories((prev) => [...prev, { ...result.data, _count: { products: 0 } }]);
      toast.success("Kategori oluşturuldu!");
      reset();
      setImagePreview("");
    } catch (err: any) {
      toast.error(err.message ?? "Oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditImage(cat.image ?? "");
    setEditImagePreview(cat.image ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditImage("");
    setEditImagePreview("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) { toast.error("Ad boş olamaz."); return; }
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, image: editImage || null }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setCategories((prev) =>
        prev.map((c) => c.id === id ? { ...c, name: editName, image: editImage || null } : c)
      );
      toast.success("Kategori güncellendi!");
      cancelEdit();
    } catch (err: any) {
      toast.error(err.message ?? "Güncellenemedi.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? (res.status === 409 ? "Bu kategoriye ait ürünler var, önce ürünleri taşıyın." : "Silinemedi."));
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori silindi.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Silinemedi.");
    }
  };

  const fetchAllImages = async () => {
    const targets = categories.filter(c => !c.image);
    if (targets.length === 0) { toast("Tüm kategorilerin zaten resmi var!"); return; }
    stopRef.current = false;
    setFetchStatus("running");
    setFetchLog([]);
    setFetchProgress(0);
    setFetchTotal(targets.length);

    for (let i = 0; i < targets.length; i++) {
      if (stopRef.current) break;
      const cat = targets[i];
      setFetchCurrent(cat.name);
      setFetchProgress(i);
      try {
        const res = await fetch("/api/admin/category-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: cat.id, categoryName: cat.name, categorySlug: cat.slug }),
        });
        const data = await res.json();
        if (data.saved && data.image) {
          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, image: data.image } : c));
          setFetchLog(prev => [{ name: cat.name, status: "ok" }, ...prev]);
        } else {
          setFetchLog(prev => [{ name: cat.name, status: "fail" }, ...prev]);
        }
      } catch {
        setFetchLog(prev => [{ name: cat.name, status: "fail" }, ...prev]);
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    setFetchProgress(targets.length);
    setFetchCurrent("");
    setFetchStatus("done");
    toast.success("Kategori resimleri tamamlandı!");
  };

  const handleImageFile = async (
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
      toast.success("Kategori görseli yüklendi.");
    } catch (err: any) {
      toast.error(err.message ?? "Görsel yüklenemedi.");
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black text-white">Kategoriler</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={previewEmpty}
            disabled={isPreviewing || isDeleting}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {isPreviewing ? "Taranıyor…" : "Boş Kategorileri Tara & Sil"}
          </button>
          <button
            onClick={fetchStatus === "running" ? () => { stopRef.current = true; setFetchStatus("idle"); } : fetchAllImages}
            disabled={fetchStatus === "running" && stopRef.current}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              fetchStatus === "running"
                ? "bg-red-700 hover:bg-red-600 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-900"
            }`}
          >
            {fetchStatus === "running"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Durdur</>
              : <><ImageIcon className="w-4 h-4" /> Resimleri Otomatik Çek</>}
          </button>
        </div>
      </div>

      {/* Boş Kategori Silme Paneli */}
      {emptyPreview !== null && emptyPreview.length > 0 && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            <h2 className="font-bold text-base">{emptyPreview.length} boş kategori tespit edildi</h2>
          </div>
          <p className="text-sm text-red-300/80">
            Aşağıdaki kategorilerde hiç ürün yok. Sil butonuyla hepsini tek seferde kaldırabilirsiniz.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-800/50">
                  <th className="text-left py-2 px-3 text-red-400 text-xs uppercase">Kategori Adı</th>
                  <th className="text-left py-2 px-3 text-red-400 text-xs uppercase">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/30">
                {emptyPreview.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 px-3 text-red-200">{c.name}</td>
                    <td className="py-2 px-3 font-mono text-red-400/70 text-xs">{c.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={deleteEmpty}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Siliniyor…" : `${emptyPreview.length} Kategoriyi Sil`}
            </button>
            <button
              onClick={() => setEmptyPreview(null)}
              className="px-5 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Resim çekme ilerleme paneli */}
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
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {fetchLog.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item.status === "ok"
                    ? <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    : <AlertCircle className="w-3 h-3 text-zinc-600 flex-shrink-0" />}
                  <span className={item.status === "ok" ? "text-zinc-300" : "text-zinc-600"}>{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yeni Kategori Formu */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" /> Yeni Kategori Ekle
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            {...register("name", { required: true })}
            placeholder="Kategori adı"
            className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
          />
           <label className={`flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors text-sm text-zinc-400 ${uploadingKey === "new" ? "pointer-events-none opacity-60" : ""}`}>
             {uploadingKey === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
             <span>{uploadingKey === "new" ? "Yükleniyor..." : imagePreview ? "Görsel yüklendi ✓" : "Bilgisayar/telefondan görsel seç"}</span>
             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, "new", (v) => setValue("image", v), setImagePreview)} disabled={uploadingKey !== null} />
          </label>
          <input type="hidden" {...register("image")} />
          <button
            type="submit"
            disabled={isSubmitting || uploadingKey !== null}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </form>
        {imagePreview && (
          <img src={imagePreview} alt="Önizleme" className="mt-3 h-20 w-28 rounded-lg object-cover border border-zinc-700" />
        )}
      </div>

      {/* Kategori Listesi */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <p className="text-zinc-400 text-sm">{categories.length} kategori</p>
        </div>
        {categories.length === 0 ? (
          <div className="py-12 text-center">
            <Tags className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-400 text-sm">Henüz kategori yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Görsel", "Kategori", "Slug", "Ürün Sayısı", "İşlem"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2">
                          {editImagePreview && (
                            <img src={editImagePreview} alt="" className="w-10 h-10 rounded-lg object-cover border border-zinc-600" />
                          )}
                           <label className={`cursor-pointer text-xs text-amber-500 hover:underline ${uploadingKey === `edit-${cat.id}` ? "pointer-events-none opacity-60" : ""}`}>
                             {uploadingKey === `edit-${cat.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e, `edit-${cat.id}`, setEditImage, setEditImagePreview)} disabled={uploadingKey !== null} />
                          </label>
                        </div>
                      ) : cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <Tags className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1.5 bg-zinc-800 border border-amber-500/50 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500 w-48"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-zinc-200">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-zinc-400">{cat._count?.products ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {editingId === cat.id ? (
                          <>
                            <button onClick={() => saveEdit(cat.id)} className="p-2 hover:bg-green-950/30 rounded-lg transition-colors text-green-400 hover:text-green-300">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(cat)} className="p-2 hover:bg-amber-950/30 rounded-lg transition-colors text-zinc-500 hover:text-amber-400">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(cat.id)} className="p-2 hover:bg-red-950/30 rounded-lg transition-colors text-zinc-500 hover:text-red-400">
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
