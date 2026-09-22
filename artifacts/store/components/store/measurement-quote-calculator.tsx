"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Home, MapPin, MessageCircle, Ruler } from "lucide-react";

type CurtainType = "tul" | "fon" | "roller" | "unsure";

const CURTAIN_TYPES: { value: CurtainType; label: string; hint: string }[] = [
  { value: "tul", label: "Tül perde", hint: "Pile katsayısı ile kumaş ihtiyacı hesaplanır." },
  { value: "fon", label: "Fon perde", hint: "Kanat ve boy bilgisiyle teklif hazırlanır." },
  { value: "roller", label: "Stor / zebra / plise", hint: "En ve boy üzerinden değerlendirilir." },
  { value: "unsure", label: "Karar veremedim", hint: "Odanıza göre birlikte seçim yapalım." },
];

function parseMeasure(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function MeasurementQuoteCalculator() {
  const [curtainType, setCurtainType] = useState<CurtainType>("tul");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [pile, setPile] = useState("2.5");
  const [room, setRoom] = useState("Salon");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  const widthValue = parseMeasure(width);
  const heightValue = parseMeasure(height);
  const selectedType = CURTAIN_TYPES.find((item) => item.value === curtainType)!;

  const summary = useMemo(() => {
    if (curtainType === "unsure") return "Perde türü birlikte belirlenecek";
    if (!widthValue || !heightValue) return "En ve boy ölçünüzü girin";
    if (curtainType === "tul") {
      return `Yaklaşık kumaş eni: ${(widthValue * Number(pile)).toFixed(2)} m`;
    }
    return `Yaklaşık alan: ${(widthValue * heightValue).toFixed(2)} m²`;
  }, [curtainType, heightValue, pile, widthValue]);

  const whatsappHref = useMemo(() => {
    const lines = [
      "Merhaba, perde ölçü ve teklif desteği almak istiyorum.",
      `Perde türü: ${selectedType.label}`,
      `Oda: ${room}`,
      widthValue ? `En: ${widthValue} m` : "",
      heightValue ? `Boy: ${heightValue} m` : "",
      curtainType === "tul" ? `Pile: ${pile}` : "",
      city.trim() ? `Şehir: ${city.trim()}` : "",
      "Ölçülerimi teyit edip uygun ürün ve fiyat seçeneklerini paylaşabilir misiniz?",
    ].filter(Boolean);
    return `https://wa.me/905462851826?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [city, curtainType, heightValue, pile, room, selectedType.label, widthValue]);

  const requestQuote = () => {
    if (curtainType !== "unsure" && (!widthValue || !heightValue)) {
      setError("Teklifin doğru hazırlanması için en ve boy ölçüsünü girin.");
      return;
    }
    setError("");
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="rounded-[1.75rem] border border-[var(--gold-light)]/60 bg-[var(--navy)] p-5 text-white shadow-[0_20px_50px_rgba(23,40,44,.18)] sm:p-7" aria-labelledby="quote-calculator-title">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold-light)]">
          <Ruler className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-[var(--gold-light)]">Ücretsiz destek</p>
          <h2 id="quote-calculator-title" className="text-xl font-black">Ölçünüzü paylaşın, teklifinizi hızlandıralım</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/65">Yaklaşık bilgileri gönderin; ekibimiz ürün, kumaş ve montaj seçeneklerini netleştirsin.</p>
        </div>
      </div>

      <div className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-extrabold text-white/85">Perde türü</legend>
          <div className="grid grid-cols-2 gap-2">
            {CURTAIN_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => { setCurtainType(item.value); setError(""); }}
                className={`min-h-12 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${curtainType === item.value ? "border-[var(--gold-light)] bg-[var(--gold)] text-[var(--navy)]" : "border-white/15 bg-white/5 text-white/80 hover:border-white/35"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-white/55">{selectedType.hint}</p>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold text-white/85">
            En (m)
            <input
              type="text"
              inputMode="decimal"
              value={width}
              onChange={(event) => { setWidth(event.target.value.replace(/,/g, ".")); setError(""); }}
              placeholder="2.40"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[var(--gold-light)] focus:ring-2 focus:ring-[var(--gold)]/25"
            />
          </label>
          <label className="text-xs font-bold text-white/85">
            Boy (m)
            <input
              type="text"
              inputMode="decimal"
              value={height}
              onChange={(event) => { setHeight(event.target.value.replace(/,/g, ".")); setError(""); }}
              placeholder="2.60"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[var(--gold-light)] focus:ring-2 focus:ring-[var(--gold)]/25"
            />
          </label>
        </div>

        {curtainType === "tul" && (
          <label className="block text-xs font-bold text-white/85">
            Pile sıklığı
            <select value={pile} onChange={(event) => setPile(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:border-[var(--gold-light)] focus:ring-2 focus:ring-[var(--gold)]/25">
              <option value="2" className="text-zinc-900">Seyrek pile (2)</option>
              <option value="2.5" className="text-zinc-900">Orta pile (2,5)</option>
              <option value="3" className="text-zinc-900">Sık pile (3)</option>
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-bold text-white/85">
            Oda
            <span className="relative mt-1.5 block">
              <Home className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/40" aria-hidden="true" />
              <select value={room} onChange={(event) => setRoom(event.target.value)} className="min-h-11 w-full appearance-none rounded-xl border border-white/15 bg-white/10 pl-9 pr-2 text-sm font-semibold text-white outline-none focus:border-[var(--gold-light)]">
                {["Salon", "Yatak odası", "Çocuk odası", "Mutfak", "Ofis", "Diğer"].map((item) => <option key={item} className="text-zinc-900">{item}</option>)}
              </select>
            </span>
          </label>
          <label className="text-xs font-bold text-white/85">
            Şehir <span className="font-normal text-white/45">(opsiyonel)</span>
            <span className="relative mt-1.5 block">
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/40" aria-hidden="true" />
              <input type="text" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bursa" className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-2 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[var(--gold-light)]" />
            </span>
          </label>
        </div>

        <div className="rounded-xl border border-[var(--gold-light)]/20 bg-white/5 px-3.5 py-3 text-xs text-white/75">
          <span className="font-bold text-[var(--gold-light)]">Ölçü özeti: </span>{summary}
        </div>
        {error && <p className="text-xs font-bold text-[#F7B6A6]" role="alert">{error}</p>}
        <button type="button" onClick={requestQuote} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-black text-white transition-colors hover:bg-[#1ebe5d]">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp&apos;tan ücretsiz teklif iste
          <ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/45">
          <Check className="h-3.5 w-3.5 text-[var(--gold-light)]" aria-hidden="true" /> Ölçünüz ekip tarafından sipariş öncesi teyit edilir.
        </p>
      </div>
    </section>
  );
}