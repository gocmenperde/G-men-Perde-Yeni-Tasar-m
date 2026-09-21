"use client";

import { useEffect, useState } from "react";
import { Zap, Clock } from "lucide-react";

// Aynı gün kargo kesim saati (saat:dakika, 24h)
const CUTOFF_HOUR = 14;
const CUTOFF_MIN = 0;

function getTimeUntilCutoff() {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(CUTOFF_HOUR, CUTOFF_MIN, 0, 0);

  if (now >= cutoff) {
    // Bugünkü kesim geçti — yarına kadar
    cutoff.setDate(cutoff.getDate() + 1);
    // Hafta sonu kontrolü
    const day = cutoff.getDay();
    if (day === 0) cutoff.setDate(cutoff.getDate() + 1); // Pazar → Pazartesi
    if (day === 6) cutoff.setDate(cutoff.getDate() + 2); // Cumartesi → Pazartesi
  }

  const diff = cutoff.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const isToday = cutoff.getDate() === now.getDate();

  return { h, m, s, isToday, cutoffDay: cutoff };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function SameDayShipping({ stock }: { stock: number }) {
  const [info, setInfo] = useState<ReturnType<typeof getTimeUntilCutoff> | null>(null);

  useEffect(() => {
    setInfo(getTimeUntilCutoff());
    const iv = setInterval(() => setInfo(getTimeUntilCutoff()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!info || stock === 0) return null;

  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  return (
    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
      <div className="flex-shrink-0 mt-0.5">
        <Zap className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        {info.isToday && !isWeekend ? (
          <>
            <p className="text-sm font-bold text-emerald-700">
              Aynı gün kargo fırsatı!
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-emerald-600">
                Bugün saat {CUTOFF_HOUR}:00'a kadar sipariş ver, bugün kargolayalım.
              </span>
              <div className="flex items-center gap-1 bg-emerald-600 text-white rounded-lg px-2 py-0.5 text-xs font-black tabular-nums">
                <Clock className="w-3 h-3" />
                {pad(info.h)}:{pad(info.m)}:{pad(info.s)}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm font-bold text-emerald-700">
            {info.cutoffDay.toLocaleDateString("tr-TR", { weekday: "long" })} kargo — Saat {CUTOFF_HOUR}:00'a kadar sipariş ver
          </p>
        )}
      </div>
    </div>
  );
}
