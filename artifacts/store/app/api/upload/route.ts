import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import crypto from "crypto";

async function uploadToCloudinary(file: File, isVideo = false): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "premium-store";

  // Cloudinary imzası: gönderilen tüm parametreler alfabetik sırayla
  // birleştirilip API Secret eklenir, ardından SHA1 alınır.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${paramsToSign}${apiSecret}`)
    .digest("hex");

  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type || (isVideo ? "video/mp4" : "image/jpeg") });

  const formData = new FormData();
  formData.append("file", blob, file.name || "upload");
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  // Video dosyaları için /video/upload, görseller için /image/upload kullanılır
  const resourceType = isVideo ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, { method: "POST", body: formData });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary ${response.status}: ${errText}`);
  }

  const payload = (await response.json()) as { secure_url?: string; url?: string };
  return payload.secure_url ?? payload.url ?? null;
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthorized(request)) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const fileType = (file.type || "").toLowerCase();
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-m4v",
    "video/m4v",
    "video/hevc",
    "video/h265",
  ];
  const allowedVideoExtensions = ["mp4", "webm", "mov", "m4v", "avi"];
  const isVideo = allowedVideoTypes.includes(fileType) ||
    ((!fileType || fileType === "application/octet-stream") && allowedVideoExtensions.includes(fileExtension));
  const isImage = allowedImageTypes.includes(fileType);
  if (!isImage && !isVideo)
    return NextResponse.json({ error: "Geçersiz dosya türü. Görsel (JPEG/PNG/WebP) veya video (MP4/WebM/MOV/M4V) desteklenir." }, { status: 400 });
  const maxSize = isVideo ? 200 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize)
    return NextResponse.json({ error: isVideo ? "Video dosyası 200MB'dan büyük olamaz." : "Görsel dosyası 5MB'dan büyük olamaz." }, { status: 400 });

  try {
    const cloudinaryUrl = await uploadToCloudinary(file, isVideo);
    if (cloudinaryUrl) return NextResponse.json({ url: cloudinaryUrl });

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Görsel yükleme için Cloudinary ayarları gerekli. Vercel env'ye CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET ekleyin." },
        { status: 500 },
      );
    }

    const bytes = await file.arrayBuffer();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), Buffer.from(bytes));
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Dosya yüklenemedi";
    console.error("Upload failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
