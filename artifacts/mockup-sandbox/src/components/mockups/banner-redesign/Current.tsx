import "./_group.css";
import { useEffect, useState } from "react";

const products = [
  "https://www.cankuskirtasiye.com/wp-content/uploads/2025/08/245969461_1753094373551_org-300x300.jpg",
  "https://www.ankasanat.com/pebeo-110-seri-samur-sulu-boya-fircasi-akrilik-boya-fircalari-pebeo-indirimli-79705-26-K.jpg",
  "https://witcdn.guvensanat.com/fanart-123-serisi-sentetik-firca-0-numara-71214-sulu-boya-fircasi-fanart-93023-71-K.jpg",
  "https://asyaon.com/image/cache/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/catalog/image/data/asyaon/8695894759602-550x550h.jpg",
];

const slides = [
  {
    id: "school",
    eyebrow: "OKULA DÖNÜŞ",
    title: "Okula dönüş",
    accent: "hazırlıkları başladı.",
    description: "Çanta, defter ve okul ihtiyaçlarında seçili fırsatlar.",
    gradient: "current-banner--blue",
    cta: "Ürünleri keşfet",
  },
  {
    id: "art",
    eyebrow: "SANAT & HOBİ",
    title: "Üretenlere ilham",
    accent: "veren kırtasiye.",
    description: "Sanat ve hobi malzemeleriyle yeni projene başla.",
    gradient: "current-banner--emerald",
    cta: "Koleksiyonu gör",
  },
  {
    id: "books",
    eyebrow: "KİTAP",
    title: "Seçili kitaplarda",
    accent: "özel fırsatlar.",
    description: "Yeni kitaplar ve klasiklerle okuma köşeni yenile.",
    gradient: "current-banner--rose",
    cta: "Kitaplara göz at",
  },
];

export function Current() {
  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="banner-mockup">
      <div className="banner-frame current-banner" aria-label="Mevcut banner">
        <div className="current-banner__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide) => (
            <article className={`current-banner__slide ${slide.gradient}`} key={slide.id}>
              <div className="current-banner__content">
                <p className="current-banner__eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}<strong>{slide.accent}</strong></h1>
                <p className="current-banner__description">{slide.description}</p>
                <div className="current-banner__actions">
                  <a className="current-banner__button" href="#products">{slide.cta}<span aria-hidden="true">↗</span></a>
                  <a className="current-banner__button current-banner__button--secondary" href="#products">Tümünü gör</a>
                </div>
              </div>
              <div className="current-banner__covers" aria-hidden="true">
                {products.map((image, coverIndex) => (
                  <div className="current-banner__cover" key={`${slide.id}-${image}`} style={{ transform: `rotate(${(coverIndex - 1.5) * 5}deg) translateY(${Math.abs(coverIndex - 1.5) * 5}px)` }}>
                    <img src={image} alt="" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <button className="current-banner__arrow current-banner__arrow--left" type="button" onClick={() => setIndex((index - 1 + slides.length) % slides.length)} aria-label="Önceki banner">‹</button>
        <button className="current-banner__arrow current-banner__arrow--right" type="button" onClick={() => setIndex((index + 1) % slides.length)} aria-label="Sonraki banner">›</button>
        <div className="current-banner__dots" aria-label="Banner slaytları">
          {slides.map((slide, dotIndex) => (
            <button key={slide.id} type="button" className={`current-banner__dot ${dotIndex === index ? "is-active" : ""}`} onClick={() => setIndex(dotIndex)} aria-label={`${dotIndex + 1}. banner`} />
          ))}
        </div>
      </div>
    </div>
  );
}