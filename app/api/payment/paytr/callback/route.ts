import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const merchantOid = String(form.get("merchant_oid") ?? "");
    const status = String(form.get("status") ?? "");
    const totalAmount = String(form.get("total_amount") ?? "");
    const paytrHash = String(form.get("hash") ?? "");

    if (!merchantOid || !status || !totalAmount || !paytrHash) {
      console.error("[PAYTR_CALLBACK] Eksik parametre", { merchantOid, status, totalAmount });
      return new NextResponse("OK", { status: 200 });
    }

    const merchantKey = process.env.PAYTR_MERCHANT_KEY ?? "";
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? "";

    if (!merchantKey || !merchantSalt) {
      console.error("[PAYTR_CALLBACK] PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT eksik");
      return new NextResponse("OK", { status: 200 });
    }

    const calculatedHash = crypto
      .createHmac("sha256", merchantKey)
      .update(`${merchantOid}${merchantSalt}${status}${totalAmount}`)
      .digest("base64");

    if (calculatedHash !== paytrHash) {
      console.error("[PAYTR_CALLBACK] Hash doğrulaması başarısız", { merchantOid, status });
      return new NextResponse("OK", { status: 200 });
    }

    const order = await db.order.findUnique({ where: { id: merchantOid } });
    if (!order) {
      console.error("[PAYTR_CALLBACK] Sipariş bulunamadı", { merchantOid });
      return new NextResponse("OK", { status: 200 });
    }

    if (status === "success") {
      await db.order.update({
        where: { id: merchantOid },
        data: {
          status: "PAID",
          paymentRef: `PAYTR-${merchantOid}`,
        },
      });
      console.log("[PAYTR_CALLBACK] Ödeme başarılı", { merchantOid });
    } else {
      await db.order.update({
        where: { id: merchantOid },
        data: { status: "CANCELLED" },
      });
      console.log("[PAYTR_CALLBACK] Ödeme başarısız", { merchantOid });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PAYTR_CALLBACK] Beklenmeyen hata", error);
    return new NextResponse("OK", { status: 200 });
  }
}
