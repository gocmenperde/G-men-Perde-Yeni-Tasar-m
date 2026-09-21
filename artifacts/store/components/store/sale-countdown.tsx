"use client";

import { useEffect, useState } from "react";
import { Flame, Clock } from "lucide-react";

interface Props {
  endsAt?: Date | null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function SaleCountdown({ endsAt }: Props) {
  // endsAt verilmemişse 24 saatlik dinamik sayaç oluştur
  // (Her session için tutarlı olsun diye localStorage'a kaydediyoruz)
  const [target, setTarget] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    let t: Date;
    if (endsAt) {
      t = endsAt;
    } else {
      const KEY = "sale_countdown_end";
      const stored = localStorage.getItem(KEY);
      if (stored) {
        t = new Date(stored);
        if (t.getTime() < Date.now()) {
          // Süresi dolmuşsa yeni sayaç başlat
          t = new Date(Date.now() + 23 * 3600000 + Math.random() * 3600000);
          localStorage.setItem(KEY, t.toISOString());
        }
      } else {
        t = new Date(Date.now() + 23 * 3600000 + Math.random() * 3600000);
        localStorage.setItem(KEY, t.toISOString());
      }
    }
    setTarget(t);
    setTimeLeft(getTimeLeft(t));
  }, [endsAt]);

  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => {
      const left = getTimeLeft(target);
      setTimeLeft(left);
      if (!left) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-white">
        <Flame className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-bold">İndirim bitiyor!</span>
      </div>

      <div className="flex items-center gap-1.5">
        {[
          { value: timeLeft.h, label: "sa" },
          { value: timeLeft.m, label: "dk" },
          { value: timeLeft.s, label: "sn" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && <span className="text-red-200 font-black text-sm">:</span>}
            <div className="flex flex-col items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 min-w-[2.2rem] text-center">
                <span className="text-white font-black text-lg leading-none tabular-nums">
                  {pad(value)}
                </span>
              </div>
              <span className="text-red-100 text-[9px] mt-0.5 font-medium">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
