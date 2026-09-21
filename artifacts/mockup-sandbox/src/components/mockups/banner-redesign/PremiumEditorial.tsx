import "./_group.css";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "GÖÇMEN SEÇKİSİ / 01",
    title: "Düşünmeye",
    accent: "alan aç.",
    description: "Çalışma masanı daha iyi fikirler için yeniden kur. Seçilmiş ürünler, sakin bir başlangıç.",
    collection: "Masa başı seçkisi",
    products: ["Paper", "Studio", "Daily", "Focus"],
  },
  {
    eyebrow: "GÖÇMEN SEÇKİSİ / 02",
    title: "Renkleri",
    accent: "serbest bırak.",
    description: "Çizimden hobiye, elindeki fikri gerçeğe dönüştüren malzemeleri keşfet.",
    collection: "Sanat & hobi seçkisi",
    products: ["Brush", "Color", "Craft", "Form"],
  },
  {
    eyebrow: "GÖÇMEN SEÇKİSİ / 03",
    title: "Yeni bir",
    accent: "sayfa aç.",
    description: "Okuma köşene iyi kitaplar ve gününü güzelleştiren küçük seçimler ekle.",
    collection: "Okuma seçkisi",
    products: ["Novel", "Note", "Classic", "Story"],
  },
];

export function PremiumEditorial() {
  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => setIndex((current) => (current + direction + slides.length) % slides.length);

  return (
    <div className="banner-mockup">
      <div className="banner-frame premium-banner" aria-label="Premium kampanya bannerı">
        <div className="premium-banner__wash" />
        <div className="premium-banner__grain" />
        <div className="premium-banner__inner">
          <div className="premium-banner__copy">
            <span className="premium-banner__kicker">{active.eyebrow}</span>
            <h2>{active.title}<em>{active.accent}</em></h2>
            <p className="premium-banner__sub">{active.description}</p>
            <div className="premium-banner__actions">
              <a className="premium-banner__primary" href="#collection">Seçkiyi keşfet <ArrowRight size={15} /></a>
              <a className="premium-banner__secondary" href="#products">Tüm ürünler</a>
            </div>
          </div>

          <div className="premium-banner__stage" aria-label={`${active.collection} ürünleri`}>
            <div className="premium-banner__halo" />
            <div className="premium-banner__products">
              {active.products.map((product, productIndex) => (
                <div
                  className="premium-banner__product"
                  key={`${active.eyebrow}-${product}`}
                  style={{ "--rotation": `${(productIndex - 1.5) * 5}deg`, "--lift": `${Math.abs(productIndex - 1.5) * 8}px` } as React.CSSProperties}
                >
                  <span className="premium-banner__product-number">0{productIndex + 1}</span>
                  <span className="premium-banner__product-label">{product}</span>
                </div>
              ))}
            </div>
            <div className="premium-banner__meta">
              <span>{active.collection}</span>
              <strong>{String(index + 1).padStart(2, "0")} / 03</strong>
            </div>
          </div>
        </div>

        <div className="premium-banner__nav">
          <button type="button" onClick={() => move(-1)} aria-label="Önceki banner"><ChevronLeft size={15} /></button>
          <div className="premium-banner__progress"><span style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
          <button type="button" onClick={() => move(1)} aria-label="Sonraki banner"><ChevronRight size={15} /></button>
          <span className="premium-banner__count">{String(index + 1).padStart(2, "0")} — 03</span>
        </div>
      </div>
    </div>
  );
}