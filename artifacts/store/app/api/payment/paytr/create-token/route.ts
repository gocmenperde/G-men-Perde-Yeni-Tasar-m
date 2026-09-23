import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getUserFromToken } from "@/lib/get-user-token";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Giriş yapınız." }, { status: 401 });

    const { orderId, membershipId } = await req.json();
    if (!orderId && !membershipId)
      return NextResponse.json({ error: "orderId veya membershipId zorunludur." }, { status: 400 });

    const order = orderId
      ? await db.order.findUnique({
          where: { id: orderId },
          include: { user: true, items: { include: { product: true } } },
        })
      : null;
    const membership = membershipId
      ? await db.premiumMembership.findUnique({ where: { id: membershipId }, include: { user: true } })
      : null;

    if (order && order.userId !== user.id)
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    if (membership && membership.userId !== user.id)
      return NextResponse.json({ error: "Premium üyelik ödemesi bulunamadı." }, { status: 404 });
    if (!order && !membership)
      return NextResponse.json({ error: "Ödeme kaydı bulunamadı." }, { status: 404 });

    const merchant_id = process.env.PAYTR_MERCHANT_ID ?? "";
    const merchant_key = process.env.PAYTR_MERCHANT_KEY ?? "";
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT ?? "";

    if (!merchant_id || !merchant_key || !merchant_salt) {
      console.error("[PAYTR_CREATE_TOKEN] PayTR env variables eksik");
      return NextResponse.json({ error: "Ödeme sistemi yapılandırması eksik." }, { status: 503 });
    }

    const user_ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const merchant_oid = order?.id ?? membership!.id;
    const payer = order?.user ?? membership!.user;
    const email = payer.email;
    const amount = order ? Number(order.total) : Number(membership!.amount);
    const payment_amount = Math.round(amount * 100).toString();

    const basket = order
      ? order.items.map((i) => [i.product.name, Number(i.price).toFixed(2), i.quantity])
      : [["Göçmen Premium Üyelik", Number(membership!.amount).toFixed(2), 1]];
    const user_basket = Buffer.from(JSON.stringify(basket)).toString("base64");

    const no_installment = "0";
    const max_installment = "0";
    const currency = "TL";

    const configuredTestMode = process.env.PAYTR_TEST_MODE?.trim().toLowerCase();
    const test_mode =
      configuredTestMode === "1" || configuredTestMode === "true"
        ? "1"
        : process.env.NODE_ENV === "production"
        ? "0"
        : "1";

    const siteUrl =
      process.env.PAYTR_OK_URL
        ? null
        : (process.env.NEXT_PUBLIC_SITE_URL ??
           process.env.NEXTAUTH_URL ??
           "https://www.gocmenperde.com.tr");

    const ok_url =
      process.env.PAYTR_OK_URL ??
      (order
        ? `${siteUrl}/orders/success?orderId=${merchant_oid}`
        : `${siteUrl}/account?premium=success`);
    const fail_url =
      process.env.PAYTR_FAIL_URL ??
      `${siteUrl}/orders/failed`;

    const user_name = payer.name ?? email.split("@")[0];
    const user_address = "Türkiye";
    const user_phone = "05000000000";

    const hashStr = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(hashStr + merchant_salt)
      .digest("base64");

    const form = new URLSearchParams({
      merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      paytr_token,
      user_basket,
      debug_on: test_mode,
      no_installment,
      max_installment,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url: ok_url,
      merchant_fail_url: fail_url,
      timeout_limit: "30",
      currency,
      test_mode,
    });

    const tokenRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });
    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok || tokenJson.status !== "success" || !tokenJson.token) {
      console.error("[PAYTR_CREATE_TOKEN] Token API hatası", tokenJson);
      return NextResponse.json({ error: tokenJson.reason ?? "PayTR token alınamadı." }, { status: 502 });
    }

    return NextResponse.json({
      data: {
        paytr_token: tokenJson.token,
      },
    });
  } catch (error) {
    console.error("[PAYTR_CREATE_TOKEN]", error);
    return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
  }
}
