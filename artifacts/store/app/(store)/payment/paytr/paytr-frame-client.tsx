"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";

const DEFAULT_PAYTR_CHECKOUT_URL = "https://www.paytr.com/odeme/guvenli/";

function getPaytrCheckoutUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_PAYTR_CHECKOUT_URL?.trim();
  if (!configuredUrl) return DEFAULT_PAYTR_CHECKOUT_URL;

  try {
    const url = new URL(configuredUrl);
    const isPaytrHost =
      url.protocol === "https:" &&
      (url.hostname === "paytr.com" || url.hostname.endsWith(".paytr.com"));
    const isPaytrCheckoutPath = url.pathname.replace(/\/+$/, "") === "/odeme/guvenli";

    // The token is appended below. Ignore an accidentally pasted token,
    // query string, or any non-PayTR URL instead of generating a broken iframe URL.
    if (!isPaytrHost || !isPaytrCheckoutPath) {
      return DEFAULT_PAYTR_CHECKOUT_URL;
    }
  } catch {
    return DEFAULT_PAYTR_CHECKOUT_URL;
  }

  return DEFAULT_PAYTR_CHECKOUT_URL;
}

const PAYTR_CHECKOUT_URL = getPaytrCheckoutUrl();

export default function PaytrFrameClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToken = () => {
    setError(null);
    setLoading(true);
    setToken(null);
    fetch("/api/payment/paytr/create-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.paytr_token) {
          setToken(json.data.paytr_token);
        } else {
          setError(json.error ?? "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        }
      })
      .catch(() => setError("Sunucu bağlantı hatası. Lütfen tekrar deneyin."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!orderId) {
      setError("Geçersiz sipariş numarası.");
      setLoading(false);
      return;
    }
    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  /* ── Tam ekran wrapper ── */
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Üst bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 bg-white shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-zinc-800">
            PayTR Güvenli Ödeme
          </span>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          #{orderId.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* İçerik */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            <p className="text-zinc-500 text-sm">Ödeme sayfası hazırlanıyor...</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white px-6">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium text-center">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={fetchToken}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-xl text-sm transition-colors"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-sm transition-all"
              >
                Geri Dön
              </button>
            </div>
          </div>
        )}

        {token && !error && (
          <iframe
            src={`${PAYTR_CHECKOUT_URL}${token}`}
            className="w-full h-full border-0"
            allowFullScreen
            title="PayTR Ödeme"
          />
        )}
      </div>
    </div>
  );
}
