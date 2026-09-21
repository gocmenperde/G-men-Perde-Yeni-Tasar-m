"use client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function optimizeImage(file: File) {
  if (ACCEPTED_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_SIZE) {
    return file;
  }

  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.88);
    });
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}

export async function uploadAdminImage(file: File) {
  const optimized = await optimizeImage(file);
  const formData = new FormData();
  formData.append("file", optimized);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.url !== "string") {
    throw new Error(payload.error ?? "Görsel yüklenemedi.");
  }

  return payload.url as string;
}