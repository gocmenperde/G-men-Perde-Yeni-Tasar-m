"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <>
      <div className="flex flex-col gap-4">
        <div
          className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image src={list[selected]} alt={name} fill className="object-cover" priority />
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </div>
        </div>
        {list.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {list.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === selected ? "border-zinc-900 dark:border-white scale-105" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                }`}
              >
                <Image src={img} alt={`${name} - ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} className="relative max-w-3xl max-h-[90vh] w-full aspect-square">
              <Image src={list[selected]} alt={name} fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
