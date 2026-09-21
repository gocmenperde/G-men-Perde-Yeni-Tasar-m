"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ParsedProduct {
  name: string;
  barcode?: string;
  sku?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  category?: string;
  brand?: string;
}

interface ImportErrorItem {
  index: number;
  name: string;
  error: string;
}

interface ImportResult {
  success: number;
  errors: ImportErrorItem[];
  total: number;
}

interface Props {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

function toBoolean(value: string | undefined, fallback = true): boolean {
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "evet", "aktif"].includes(value.toLowerCase().trim());
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function rowToProduct(row: Record<string, string>, i: number): ParsedProduct {
  if (!row.name || !row.price) throw new Error(`${i + 1}. satırda ürün adı ve fiyat zorunludur.`);
  const regularPrice = Number(row.price);
  const discountedPrice = row.discounted_price ? Number(row.discounted_price) : undefined;
  if (isNaN(regularPrice) || (discountedPrice !== undefined && isNaN(discountedPrice)))
    throw new Error(`${i + 1}. satırda fiyat formatı geçersiz.`);
  const barcodeVal = row.barcode?.trim() || undefined;
  return {
    name: row.name,
    barcode: barcodeVal,
    sku: barcodeVal,
    description: row.description || undefined,
    price: discountedPrice !== undefined && discountedPrice > 0 && discountedPrice < regularPrice ? discountedPrice : regularPrice,
    comparePrice: discountedPrice !== undefined && discountedPrice > 0 && discountedPrice < regularPrice ? regularPrice : undefined,
    stock: row.stock ? Number(row.stock) || 0 : 0,
    images: row.image_url?.trim() ? [row.image_url.trim()] : [],
    isActive: toBoolean(row.is_active, true),
    category: row.category?.trim() || undefined,
    brand: row.brand?.trim() || undefined,
  };
}

export default function BulkImportClient({ categories, brands }: Props) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [noImageCount, setNoImageCount] = useState(0);

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const headers = ["barcode", "name", "description", "price", "discounted_price", "stock", "image_url", "category", "brand", "is_active"];
      const example1 = ["8690000000001", "Staedtler Fineliner Set 10'lu", "Premium keçeli kalem seti", "299.99", "249.99", "50", "", "Kalemler", "Staedtler", "true"];
      const example2 = ["8690000000002", "Faber-Castell Kuru Boya 12'li", "Profesyonel kuru boya kalemi seti", "159.90", "129.90", "20", "", "Sanat Malzemeleri", "Faber-Castell", "true"];

      const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2]);

      ws["!cols"] = [
        { wch: 16 }, { wch: 36 }, { wch: 40 }, { wch: 10 }, { wch: 16 },
        { wch: 8 }, { wch: 50 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
      ];

      const catNames = categories.map((c) => c.name);
      const brandNames = brands.map((b) => b.name);

      if (catNames.length > 0) {
        for (let row = 2; row <= 200; row++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: 7 });
          if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
          ws[cellRef].d = catNames.join(",");
        }
      }
      if (brandNames.length > 0) {
        for (let row = 2; row <= 200; row++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: 8 });
          if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
          ws[cellRef].d = brandNames.join(",");
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

      const catWs = XLSX.utils.aoa_to_sheet([["Kategori Adları"], ...catNames.map((n) => [n])]);
      const brandWs = XLSX.utils.aoa_to_sheet([["Marka Adları"], ...brandNames.map((n) => [n])]);
      XLSX.utils.book_append_sheet(wb, catWs, "Kategoriler");
      XLSX.utils.book_append_sheet(wb, brandWs, "Markalar");

      const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "urun-toplu-import-sablonu.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Excel şablonu indirildi!");
    } catch {
      toast.error("Şablon indirilemedi.");
    }
  };

  const parseExcel = async (file: File): Promise<ParsedProduct[]> => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    if (rows.length === 0) throw new Error("Excel dosyasında ürün bulunamadı.");

    const normalizeKey = (key: string) =>
      key.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    const parsed: ParsedProduct[] = [];
    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const row: Record<string, string> = {};
      for (const k of Object.keys(rawRow)) {
        row[normalizeKey(k)] = String(rawRow[k] ?? "").trim();
      }
      if (!row.name && !row.ad && !row.urun_adi) continue;
      if (row.ad && !row.name) row.name = row.ad;
      if (row.urun_adi && !row.name) row.name = row.urun_adi;
      if (row.fiyat && !row.price) row.price = row.fiyat;
      if (row.indirimli_fiyat && !row.discounted_price) row.discounted_price = row.indirimli_fiyat;
      if (row.stok && !row.stock) row.stock = row.stok;
      if (row.resim_url && !row.image_url) row.image_url = row.resim_url;
      if (row.kategori && !row.category) row.category = row.kategori;
      if (row.marka && !row.brand) row.brand = row.marka;
      parsed.push(rowToProduct(row, i));
    }
    return parsed;
  };

  const parseCsv = async (file: File): Promise<ParsedProduct[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV dosyasında en az 1 ürün satırı olmalı.");
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    if (!headers.includes("name") || !headers.includes("price"))
      throw new Error("Zorunlu sütunlar eksik: name, price");
    const parsed: ParsedProduct[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? ""]));
      parsed.push(rowToProduct(row, i));
    }
    return parsed;
  };

  const handleFileUpload = async (file: File) => {
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const isCsv = /\.csv$/i.test(file.name);
    if (!isExcel && !isCsv) throw new Error("Lütfen .xlsx, .xls veya .csv dosyası seçin.");
    const parsed = isExcel ? await parseExcel(file) : await parseCsv(file);
    const noImg = parsed.filter((p) => p.images.length === 0).length;
    setProducts(parsed);
    setNoImageCount(noImg);
    setResult(null);
    toast.success(`${parsed.length} ürün içe aktarma için hazır.`);
  };

  const handleImport = async () => {
    if (!products.length) return;
    setLoading(true);
    setProgress(0);
    setResult(null);
    const BATCH = 50;
    let success = 0;
    const errors: ImportErrorItem[] = [];
    const batches = Math.ceil(products.length / BATCH);
    for (let b = 0; b < batches; b++) {
      const slice = products.slice(b * BATCH, (b + 1) * BATCH);
      try {
        const res = await fetch("/api/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: slice }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Sunucu hatası");
        success += data.success;
        errors.push(...(data.errors ?? []).map((e: ImportErrorItem) => ({ ...e, index: e.index + b * BATCH })));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        errors.push(...slice.map((p, i) => ({ index: b * BATCH + i, name: p.name, error: message })));
      }
      setProgress(Math.round(((b + 1) / batches) * 100));
    }
    setResult({ success, errors, total: products.length });
    setLoading(false);
    if (success > 0) {
      toast.success(`${success} ürün başarıyla eklendi!`);
      router.refresh();
    } else {
      toast.error("Hiçbir ürün eklenemedi. Hata listesini inceleyin.");
    }
  };

  const reset = () => {
    setFileName("");
    setProducts([]);
    setResult(null);
    setProgress(0);
    setNoImageCount(0);
  };

  const updateProduct = (index: number, update: Partial<ParsedProduct>) =>
    setProducts(prev => prev.map((product, i) => i === index ? { ...product, ...update } : product));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Toplu İçe Aktar</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Excel (.xlsx) veya CSV dosyasıyla toplu ürün yükleyin.</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-bold text-white mb-1">Excel Şablonu</h2>
            <p className="text-zinc-400 text-sm">
              Şablonu indirin, doldurun ve yükleyin. Kategori ve marka adları şablona otomatik eklenir.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-xl transition-colors font-semibold"
          >
            <Download className="w-4 h-4" /> Excel Şablonunu İndir (.xlsx)
          </button>
        </div>

        <label className="block border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-xl p-8 text-center cursor-pointer transition-colors group">
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              try {
                await handleFileUpload(file);
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Dosya okunamadı.";
                toast.error(message);
              }
              e.target.value = "";
            }}
          />
          <FileSpreadsheet className="w-10 h-10 mx-auto text-zinc-600 group-hover:text-amber-500 mb-3 transition-colors" />
          <p className="text-zinc-300 font-semibold">Excel veya CSV dosyasını seçmek için tıklayın</p>
          <p className="text-zinc-500 text-xs mt-1">.xlsx, .xls, .csv desteklenir</p>
          {fileName && <p className="mt-3 text-xs font-semibold text-amber-400">📎 {fileName}</p>}
        </label>

        <div className="mt-4 p-4 bg-zinc-800/60 rounded-xl">
          <p className="text-zinc-400 text-xs font-semibold mb-2">Desteklenen sütunlar:</p>
          <div className="flex flex-wrap gap-1.5">
            {["barcode", "name *", "description", "price *", "discounted_price", "stock", "image_url", "category", "brand", "is_active"].map((col) => (
              <span key={col} className={`text-[11px] px-2 py-0.5 rounded-lg font-mono ${col.includes("*") ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-700 text-zinc-300"}`}>
                {col}
              </span>
            ))}
          </div>
          <p className="text-zinc-500 text-[11px] mt-2">* Zorunlu alanlar. Türkçe sütun adları da desteklenir (ad, fiyat, stok, vb.)</p>
        </div>
      </div>

      {products.length > 0 && !result && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-white font-bold">{products.length} ürün yüklendi</p>
              <p className="text-zinc-400 text-sm">İçe aktarmak için butona tıklayın.</p>
            </div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-7 py-3.5 rounded-xl disabled:opacity-50 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              {loading ? "İçe Aktarılıyor..." : `${products.length} Ürünü İçe Aktar`}
            </button>
          </div>

          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-zinc-800/60 flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-300">İçe aktarmadan önce düzenle</p>
              <p className="text-[11px] text-zinc-500">Satırdaki tüm alanlar kaydedilecektir</p>
            </div>
            <div className="max-h-[32rem] overflow-y-auto divide-y divide-zinc-800">
              {products.map((product, index) => (
                <div key={index} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-[10px] text-zinc-500 block mb-1">Ürün adı</label>
                    <input value={product.name} onChange={e => updateProduct(index, { name: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] text-zinc-500 block mb-1">Açıklama</label>
                    <textarea value={product.description ?? ""} rows={2} onChange={e => updateProduct(index, { description: e.target.value })}
                      className="w-full resize-y bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">Satış fiyatı (₺)</label>
                    <input type="number" min="0" step="0.01" value={product.price} onChange={e => updateProduct(index, { price: Number(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">Üst fiyat (₺)</label>
                    <input type="number" min="0" step="0.01" value={product.comparePrice ?? ""} onChange={e => updateProduct(index, { comparePrice: e.target.value === "" ? undefined : Number(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <span className="text-[10px] text-zinc-500">{index + 1}. ürün · {product.category ?? "Kategori yok"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {noImageCount > 0 && (
            <div className="flex items-start gap-3 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ImageIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-300 text-sm font-semibold">{noImageCount} ürün resim URL'si içermiyor</p>
                <p className="text-blue-400/70 text-xs mt-0.5">
                  Bu ürünler "Ürün resmi hazırlanıyor" görseli ile listelenir. Daha sonra ürün düzenleme sayfasından resim ekleyebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-zinc-400 text-sm text-center">%{progress} tamamlandı</p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">{result.success} ürün başarıyla eklendi</span>
          </div>
          {result.errors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{result.errors.length} hata oluştu</span>
              </div>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-zinc-400">
                    Satır {e.index + 2} ({e.name}): {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={reset} className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
            Yeni dosya yükle
          </button>
        </div>
      )}
    </div>
  );
}
