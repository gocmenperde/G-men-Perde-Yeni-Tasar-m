import { Ruler } from "lucide-react";
import { GOCMEN_MEASURE_GUIDE } from "@/data/gocmen-catalog";

export default function MeasureGuide() {
  return (
    <details className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold text-[var(--navy)]">
        <Ruler className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
        {GOCMEN_MEASURE_GUIDE.title}
        <span className="ml-auto text-xs font-semibold text-[var(--ink-muted)]">Rehberi aç</span>
      </summary>
      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <div
          className="prose prose-sm max-w-none text-[var(--ink-muted)] prose-headings:text-[var(--navy)] prose-strong:text-[var(--navy)] prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: GOCMEN_MEASURE_GUIDE.contentHtml }}
        />
        {GOCMEN_MEASURE_GUIDE.images.map((image) => (
          <img
            key={image.url}
            src={image.url}
            alt={image.alt}
            loading="lazy"
            className="mt-4 max-h-64 w-full rounded-xl border border-[var(--line)] object-contain"
          />
        ))}
      </div>
    </details>
  );
}
