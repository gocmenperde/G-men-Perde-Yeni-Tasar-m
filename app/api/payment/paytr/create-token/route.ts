import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaytrEnv } from "@/lib/paytr-env";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const merchantOid = String(body.merchant_oid ?? "").trim();
    const paymentAmount = String(body.payment_amount ?? "").trim();
    const email = String(body.user_email ?? "").trim();
    const userName = String(body.user_name ?? "").trim() || "Müşteri";
    const userAddress = String(body.user_address ?? "").trim() || "Türkiye";
    const userPhone = String(body.user_phone ?? "").trim() || "05000000000";

    if (!merchantOid || !paymentAmount || !email) {
      return NextResponse.json({ error: "Eksik ödeme verisi." }, { status: 400 });
    }

    const amountInt = Number(paymentAmount);
    if (!Number.isFinite(amountInt) || amountInt <= 0) {
      return NextResponse.json({ error: "payment_amount geçersiz." }, { status: 400 });
    }

    const { merchantId, merchantKey, merchantSalt, okUrl, failUrl, testMode } = getPaytrEnv();
    const userIp = getClientIp(req);
    const basket = Buffer.from(JSON.stringify([[`Sipariş ${merchantOid}`, (amountInt / 100).toFixed(2), 1]])).toString("base64");

    const noInstallment = "0";
    const maxInstallment = "0";
    const currency = "TL";
    const timeoutLimit = "30";
    const debugOn = "1";
    const testModeFlag = testMode ? "1" : "0";

    const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${basket}${noInstallment}${maxInstallment}${currency}${testModeFlag}`;
    const paytrToken = crypto.createHmac("sha256", merchantKey).update(hashStr + merchantSalt).digest("base64");

    return NextResponse.json({
      data: {
        merchant_id: merchantId,
        user_ip: userIp,
        merchant_oid: merchantOid,
        email,
        payment_amount: paymentAmount,
        user_basket: basket,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        currency,
        test_mode: testModeFlag,
        user_name: userName,
        user_address: userAddress,
        user_phone: userPhone,
        merchant_ok_url: okUrl,
        merchant_fail_url: failUrl,
        timeout_limit: timeoutLimit,
        debug_on: debugOn,
        paytr_token: paytrToken,
      },
    });
  } catch (error) {
    console.error("[PAYTR_CREATE_TOKEN]", error);
    return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
  }
}
