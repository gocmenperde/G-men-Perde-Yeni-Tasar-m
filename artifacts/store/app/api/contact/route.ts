import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.success)
    return NextResponse.json({ error: "Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin." }, { status: 429 });

  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const subject = String(body?.subject ?? "İletişim Formu").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !email || !message)
      return NextResponse.json({ error: "Ad, e-posta ve mesaj zorunludur." }, { status: 400 });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });

    const toEmail = process.env.CONTACT_EMAIL ?? process.env.SMTP_USER ?? "muhammedemint76@gmail.com";
    const transporter = getTransporter();

    if (transporter) {
      const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
      await transporter.sendMail({
        from: `"Göçmen Perde İletişim" <${from}>`,
        to: toEmail,
        replyTo: `"${name}" <${email}>`,
        subject: `[İletişim] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f5f0e8;">
            <div style="background:#1c1c1e;padding:20px 28px;border-radius:12px 12px 0 0;">
              <h2 style="color:#D4AF5A;margin:0;font-size:18px;">Göçmen Perde — Yeni Mesaj</h2>
            </div>
            <div style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px;border:1px solid #e8e0d5;border-top:none;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:6px 0;color:#666;font-size:13px;width:100px;">Ad Soyad:</td><td style="padding:6px 0;color:#222;font-size:13px;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:13px;">E-posta:</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#B8973E;font-size:13px;">${email}</a></td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:13px;">Konu:</td><td style="padding:6px 0;color:#222;font-size:13px;">${subject}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #f0ebe3;margin:16px 0;">
              <p style="color:#333;font-size:14px;line-height:1.7;white-space:pre-line;margin:0;">${message}</p>
            </div>
            <p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px;">Bu mesaj gocmenperde.com.tr iletişim formundan gönderildi.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACT]", err);
    return NextResponse.json({ error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
