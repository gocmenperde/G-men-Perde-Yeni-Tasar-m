"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getCdnOptimizedImageUrl, getProductImageCandidates } from "@/lib/image-url";

type ProductImageProps = Omit<ImageProps, "src" | "onError" | "onLoad"> & {
  src?: unknown;
  fallbackSrc?: unknown;
  fallbackLabel?: string;
  onImageError?: () => void;
  onImageLoad?: () => void;
  hideOnError?: boolean;
  cdnWidth?: number;
};

export default function ProductImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  fallbackLabel = "Görsel yüklenemedi",
  onImageError,
  onImageLoad,
  hideOnError = false,
  cdnWidth,
  ...props
}: ProductImageProps) {
  const sourceCandidates = [
    ...getProductImageCandidates(src),
    ...getProductImageCandidates(fallbackSrc),
  ].filter((value, index, values) => values.indexOf(value) === index);
  const candidates = sourceCandidates.flatMap((value) => {
    const optimized = getCdnOptimizedImageUrl(value, cdnWidth);
    return optimized === value ? [value] : [optimized, value];
  });
  const candidateKey = candidates.join("\u0000");
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(candidates.length === 0);
  const [activeSrc, setActiveSrc] = useState(candidates[0] ?? "");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(candidates.length === 0);
    setActiveSrc(candidates[0] ?? "");
    setLoaded(false);
  }, [candidateKey]);

  if (failed) {
    if (hideOnError) return null;

    return (
      <div
        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fbf8f2] via-[#f6f0e6] to-[#eee5d7] px-3 text-center"
        role="img"
        aria-label={`${alt} — ${fallbackLabel}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dfd2c0] bg-white/75 text-[#b8973e] shadow-sm">
          <ImageOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold tracking-wide text-[#9c8d79]">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div
          className="skeleton absolute inset-0 z-[1] rounded-[inherit] opacity-70"
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        // next.config.js disables Next's image optimizer globally. This keeps
        // supplier/CDN image bytes off the application origin.
        unoptimized
        src={activeSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          setLoaded(true);
          onImageLoad?.();
        }}
        onError={() => {
          if (candidateIndex < candidates.length - 1) {
            const nextIndex = candidateIndex + 1;
            setCandidateIndex(nextIndex);
            setActiveSrc(candidates[nextIndex]);
            setLoaded(false);
          } else {
            setFailed(true);
            onImageError?.();
          }
        }}
      />
    </>
  );
}