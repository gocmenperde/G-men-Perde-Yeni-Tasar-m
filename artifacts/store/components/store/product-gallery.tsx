"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, ZoomIn, X } from "lucide-react";
import ProductImage from "@/components/store/product-image";

const normalizeImageUrl = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

function ProductGalleryImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      unoptimized
      className={"absolute inset-0 h-full w-full " + className}
      priority={priority}
      fallbackLabel="Görsel yok"
    />
  );
}

export default function ProductGallery({ images, name }: { images?: unknown; name: string }) {
  const list = Array.isArray(images)
    ? images.map(normalizeImageUrl).filter(Boolean)
    : [];
  const hasImages = list.length > 0;
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const selectedIndex = hasImages ? Math.min(selected, list.length - 1) : 0;

  useEffect(() => {
    setSelected(0);
    setLightbox(false);
  }, [images]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox]);

  const lightboxContent = lightbox && hasImages && portalReady ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setLightbox(false)}
      className="fixed inset-0 z-[10000] flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} görseli`}
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.85 }}
        onClick={(event) => event.stopPropagation()}
        className="relative aspect-square w-[min(86vw,86vh)] max-h-[86vh] max-w-[88vw]"
      >
        <button
          type="button"
          onClick={() => setLightbox(false)}
          className="touch-target absolute -right-2 -top-2 z-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--ink)] shadow-lg"
          aria-label="Görseli kapat"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <ProductGalleryImage src={list[selectedIndex]} alt={name} className="object-contain" priority />
      </motion.div>
    </motion.div>
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-4 lg:sticky lg:top-[120px] self-start">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] dark:bg-[var(--surface-muted)] group shadow-[0_16px_50px_rgba(61,45,24,0.08)]"
          onClick={() => hasImages && setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {hasImages ? (
                <ProductGalleryImage
                  src={list[selectedIndex]}
                  alt={name}
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-300">
                  <ImageOff className="h-14 w-14" aria-hidden="true" />
                  <p className="text-sm text-zinc-400">Görsel yok</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {hasImages && (
            <div className="absolute right-4 top-4 rounded-xl bg-white/80 p-2 backdrop-blur transition-opacity group-hover:opacity-100 dark:bg-zinc-800/80">
              <ZoomIn className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
            </div>
          )}
        </div>

        {list.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {list.map((img, i) => (
              <button
                key={img + "-" + i}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={name + " görseli " + (i + 1)}
                aria-current={i === selectedIndex}
                 className={"touch-target relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 " + (i === selectedIndex
                  ? "scale-105 border-zinc-900 dark:border-white"
                  : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700")}
              >
                <ProductGalleryImage src={img} alt={name + " - " + (i + 1)} className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {portalReady && createPortal(<AnimatePresence>{lightboxContent}</AnimatePresence>, document.body)}
    </>
  );
}
