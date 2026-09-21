"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PAYTR_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYTR_CHECKOUT_URL ?? "https://www.paytr.com/odeme/guvenli/";

type PaytrPayload = {
  merchant_oid: string;
  payment_amount: string;
  user_email: string;
  user_name?: string;
  user_address?: string;
  user_phone?: string;
};

export default function PaytrFrameClient({ payload }: { payload: PaytrPayload }) {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/payment/paytr/create-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.paytr_token) setToken(String(json.data.paytr_token));
        else setError(json.error ?? "PayTR token oluşturulamadı.");
      })
      .catch(() => setError("Sunucu bağlantı hatası."));
  }, [payload]);

  if (error) {
    return <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  if (!token) {
    return <div className="text-sm text-zinc-500">Ödeme sayfası hazırlanıyor...</div>;
  }

  const tokenUrl = `${PAYTR_CHECKOUT_URL}${encodeURIComponent(token)}`;

  return (
    <>
      <iframe src={tokenUrl} className="w-full h-[640px] rounded-xl border border-zinc-200" title="PayTR Ödeme" />
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">Ana Sayfaya Dön</Link>
      </div>
    </>
  );
}
