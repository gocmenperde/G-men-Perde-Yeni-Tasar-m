import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const OK     = () => new NextResponse("OK",     { status: 200 });
const FAILED = () => new NextResponse("FAILED", { status: 200 }); // PayTR yeniden dener

export async function POST(req: NextRequest) {
  let merchant_oid = "";

  try {
    const form = await req.formData();

    merchant_oid  = String(form.get("merchant_oid")  ?? "");
    const status       = String(form.get("status")        ?? "");
    const total_amount = String(form.get("total_amount")  ?? "");
    const hash         = String(form.get("hash")          ?? "");

    // ── Zorunlu alan kontrolü ─────────────────────────────────────────────────
    if (!merchant_oid || !status || !total_amount || !hash) {
      console.error("[PAYTR_CALLBACK] Eksik alan:", { merchant_oid, status, total_amount, hash: !!hash });
      return FAILED();
    }

    const merchant_key  = process.env.PAYTR_MERCHANT_KEY  ?? "";
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT ?? "";

    if (!merchant_key || !merchant_salt) {
      console.error("[PAYTR_CALLBACK] PAYTR_MERCHANT_KEY veya PAYTR_MERCHANT_SALT tanımlı değil");
      return FAILED();
    }

    // ── Hash doğrulama ────────────────────────────────────────────────────────
    // PayTR resmi algoritması: HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key)
    const calculated = crypto
      .createHmac("sha256", merchant_key)
      .update(`${merchant_oid}${merchant_salt}${status}${total_amount}`)
      .digest("base64");

    if (calculated !== hash) {
      console.error("[PAYTR_CALLBACK] Hash doğrulaması başarısız:", {
        merchant_oid,
        status,
        total_amount,
        received:   hash,
        calculated,
      });
      // FAILED döndür → PayTR panelinde hata görünür, credential yanlışsa fark edilir
      return FAILED();
    }

    // ── Sipariş kontrolü ──────────────────────────────────────────────────────
    const order = await db.order.findUnique({
      where: { id: merchant_oid },
      include: { items: true },
    });

    if (!order) {
      console.error("[PAYTR_CALLBACK] Sipariş bulunamadı:", merchant_oid);
      return FAILED(); // Bilinmeyen sipariş → PayTR yeniden denesin
    }

    // İdempotent: zaten işlendiyse tekrar işleme
    if (order.status === "PAID" || order.status === "PAYMENT_FAILED") {
      console.log("[PAYTR_CALLBACK] Sipariş zaten işlenmiş, atlanıyor:", merchant_oid, order.status);
      return OK();
    }

    // ── Ödeme başarılı ────────────────────────────────────────────────────────
    if (status === "success") {
      const fullOrder = await db.order.findUnique({
        where: { id: merchant_oid },
        include: {
          user:  { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });

      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: merchant_oid },
          data:  { status: "PAID", stripeId: `PAYTR-${Date.now()}` },
        });

        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where:  { id: item.productId },
            select: { stock: true },
          });
          const decrement = Math.min(item.quantity, product?.stock ?? item.quantity);
          if (decrement > 0) {
            await tx.product.update({
              where: { id: item.productId },
              data:  { stock: { decrement } },
            });
          }
        }
      });

      if (fullOrder) {
        sendOrderStatusEmail({
          id:     fullOrder.id,
          status: "PAID",
          total:  Number(fullOrder.total),
          user:   fullOrder.user,
          items:  fullOrder.items.map((i) => ({
            quantity: i.quantity,
            price:    Number(i.price),
            product:  { name: i.product.name },
          })),
        }).catch((e) => console.error("[PAYTR_CALLBACK] Email hatası:", e));
      }

      console.log("[PAYTR_CALLBACK] Ödeme başarılı:", merchant_oid);

    // ── Ödeme başarısız ───────────────────────────────────────────────────────
    } else {
      await db.order.update({
        where: { id: merchant_oid },
        data:  { status: "PAYMENT_FAILED" },
      });
      console.log("[PAYTR_CALLBACK] Ödeme başarısız:", merchant_oid, status);
    }

    return OK();

  } catch (error) {
    // DB veya başka bir sunucu hatası → FAILED döndür, PayTR yeniden dener
    console.error("[PAYTR_CALLBACK] Sunucu hatası:", merchant_oid, error);
    return FAILED();
  }
}
