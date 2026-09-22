"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { uploadAdminImage } from "./media-upload";
import type {
  EditorialMedia,
  EditorialMediaItem,
  EditorialMediaKind,
} from "@/lib/homepage-config";

const KIND_COPY: Record<
  EditorialMediaKind,
  { title: string; description: string }
> = {
  projects: {
    title: "Sizden Gelenler",
    description: "Gerçek müşteri evlerinden uygulama fotoğrafları.",
  },
  inspiration: {
    title: "Uygulama & İlham Alanı",
    description: "Perde uygulamalarından ilham veren görsel seçkisi.",
  },
};

function createId(kind: EditorialMediaKind) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${kind}-${crypto.randomUUID()}`;
  }
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function EditorialMediaEditor({
  media,
  onChange,
}: {
  media: EditorialMedia;
  onChange: (media: EditorialMedia) => void;
}) {
  const [activeKind, setActiveKind] = useState<EditorialMediaKind>("projects");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const items = media[activeKind];

  function updateItem(id: string, patch: Partial<EditorialMediaItem>) {
    onChange({
      ...media,
      [activeKind]: items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function addItem() {
    const id = createId(activeKind);
    onChange({
      ...media,
      [activeKind]: [
        ...items,
        {
          id,
          imageUrl: "",
          label: "",
          alt: "",
          visible: true,
        },
      ],
    });
    setMessage(null);
  }

  function removeItem(id: string) {
    onChange({
      ...media,
      [activeKind]: items.filter((item) => item.id !== id),
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange({ ...media, [activeKind]: next });
  }

  async function uploadItem(id: string, file: File | undefined) {
    if (!file) return;
    setUploadingId(id);
    setMessage(null);
    try {
      const imageUrl = await uploadAdminImage(file);
      updateItem(id, { imageUrl });
      setMessage("Görsel yüklendi. Değişiklikleri kaydetmeyi unutmayın.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Görsel yüklenemedi.");
    } finally {
      setUploadingId(null);
    }
  }

  async function uploadMultiple(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    setUploadingBatch(true);
    setMessage(null);
    const uploadedItems: EditorialMediaItem[] = [];
    const failedFiles: string[] = [];

    for (const file of selectedFiles) {
      try {
        const imageUrl = await uploadAdminImage(file);
        const label =
          file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .trim() || "Yeni görsel";
        uploadedItems.push({
          id: createId(activeKind),
          imageUrl,
          label,
          alt: `${label} perde uygulaması`,
          visible: true,
        });
      } catch {
        failedFiles.push(file.name);
      }
    }

    if (uploadedItems.length > 0) {
      onChange({
        ...media,
        [activeKind]: [...items, ...uploadedItems],
      });
    }

    if (failedFiles.length > 0) {
      setMessage(
        `${uploadedItems.length} görsel yüklendi. ${failedFiles.length} görsel yüklenemedi: ${failedFiles.join(", ")}`,
      );
    } else {
      setMessage(
        `${uploadedItems.length} görsel yüklendi. Değişiklikleri kaydetmeyi unutmayın.`,
      );
    }
    setUploadingBatch(false);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.035] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-500">
            <ImagePlus className="h-3.5 w-3.5" />
            Görsel galerileri
          </div>
          <h2 className="mt-2 text-base font-bold text-white">
            Sizden Gelenler ve İlham Alanı
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
            Bu iki alana görsel ekleyin, başlıklarını düzenleyin, sıralayın veya kaldırın.
            Görsel seçme düğmesi telefon ve bilgisayarda çalışır.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <label
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-black text-zinc-950 transition-colors hover:bg-amber-400 ${
              uploadingBatch ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploadingBatch ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploadingBatch ? "Görseller yükleniyor..." : "Birden fazla görsel seç"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploadingBatch}
              onChange={(event) => {
                const files = event.target.files;
                event.target.value = "";
                void uploadMultiple(files);
              }}
            />
          </label>
          <button
            type="button"
            onClick={addItem}
            disabled={uploadingBatch}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-zinc-300 transition-colors hover:border-amber-500 hover:text-amber-300 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Boş kayıt ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-950/60 p-1">
        {(Object.keys(KIND_COPY) as EditorialMediaKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => {
              setActiveKind(kind);
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-colors ${
              activeKind === kind
                ? "bg-zinc-800 text-amber-300"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            <span className="block">{KIND_COPY[kind].title}</span>
            <span className="mt-1 block font-normal text-[10px] text-zinc-600">
              {media[kind].length} görsel
            </span>
          </button>
        ))}
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5 text-xs leading-5 text-emerald-200">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 px-5 py-10 text-center">
          <ImagePlus className="mx-auto h-7 w-7 text-zinc-700" />
          <p className="mt-3 text-sm font-semibold text-zinc-400">
            {KIND_COPY[activeKind].title} alanında henüz görsel yok.
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            İlk görseli eklemek için yukarıdaki düğmeyi kullanın.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <MediaItemCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              uploading={uploadingId === item.id || uploadingBatch}
              onChange={(patch) => updateItem(item.id, patch)}
              onUpload={(file) => uploadItem(item.id, file)}
              onMove={(direction) => moveItem(index, direction)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaItemCard({
  item,
  index,
  total,
  uploading,
  onChange,
  onUpload,
  onMove,
  onRemove,
}: {
  item: EditorialMediaItem;
  index: number;
  total: number;
  uploading: boolean;
  onChange: (patch: Partial<EditorialMediaItem>) => void;
  onUpload: (file: File | undefined) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/65 p-3 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 sm:h-28 sm:w-40">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.alt || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-zinc-700">
              <ImagePlus className="h-8 w-8" />
            </div>
          )}
          <label
            className={`absolute inset-x-2 bottom-2 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-950/85 px-2 py-2 text-[11px] font-bold text-white backdrop-blur transition-colors hover:bg-amber-500 hover:text-zinc-950 ${
              uploading ? "pointer-events-none opacity-70" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            {uploading ? "Yükleniyor..." : "Cihazdan görsel seç"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                onUpload(file);
              }}
            />
          </label>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-zinc-500">
                Görsel başlığı
              </span>
              <input
                value={item.label}
                onChange={(event) => onChange({ label: event.target.value })}
                placeholder="Salon uygulaması"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-amber-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-zinc-500">
                Alternatif metin
              </span>
              <input
                value={item.alt}
                onChange={(event) => onChange({ alt: event.target.value })}
                placeholder="Salon perde uygulaması"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-amber-500"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onChange({ visible: !item.visible })}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-bold transition-colors ${
                item.visible
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {item.visible ? "Yayında" : "Gizli"}
            </button>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] text-zinc-600">{index + 1}/{total}</span>
              <button
                type="button"
                onClick={() => onMove(-1)}
                disabled={index === 0}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-25"
                aria-label="Yukarı taşı"
              >
                <MoveUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                disabled={index === total - 1}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-25"
                aria-label="Aşağı taşı"
              >
                <MoveDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Görseli kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {!item.imageUrl && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-300">
          <X className="h-3.5 w-3.5" />
          Kaydetmeden önce bu kayıt için bir görsel seçin.
        </p>
      )}
    </article>
  );
}