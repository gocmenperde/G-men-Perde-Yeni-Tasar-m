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

  const maxSide = 1600;

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * ratio));
      const height = Math.max(1, Math.round(bitmap.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(bitmap, 0, 0, width, height);
      }
      bitmap.close();
      if (context) {
        const blob = await canvasToBlob(canvas);
        if (blob) {
          return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
            type: blob.type,
          });
        }
      }
    } catch {
      // Safari may not implement createImageBitmap for every camera format.
      // Use the HTMLImageElement fallback below.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Görsel tarayıcıda okunamadı."));
      element.src = objectUrl;
    });
    const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Görsel işleme başlatılamadı.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error("Görsel sıkıştırılamadı.");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
      type: blob.type,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  const webp = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.88);
  });
  if (webp) return webp;

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.88);
  });
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