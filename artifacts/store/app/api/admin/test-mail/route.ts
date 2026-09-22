import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authorized = await isAdminAuthorized(req);
  if (!authorized) return unauthorizedResponse();

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass)
    return NextResponse.json(
      { error: "SMTP ayarları eksik. SMTP_HOST, SMTP_USER ve SMTP_PASS secret'larını ekleyin." },
      { status: 400 }
    );

  try {
    const { to } = await req.json().catch(() => ({}));
    const target = to ?? process.env.SMTP_USER;

    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });

    await transporter.verify();
    const from = process.env.SMTP_FROM ?? user;

    await transporter.sendMail({
      from: `"Göçmen Perde" <${from}>`,
      to: target,
      subject: "✅ Mail Sistemi Çalışıyor — Test Maili",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f5f0e8;">
          <div style="background:#1c1c1e;padding:20px 28px;border-radius:12px 12px 0 0;text-align:center;">
            <h2 style="color:#D4AF5A;margin:0;font-size:20px;">GÖÇMEN PERDE</h2>
            <p style="color:#aaa;font-size:12px;margin:4px 0 0;">Mail Sistemi Test</p>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8e0d5;border-top:none;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h3 style="color:#1c1c1e;font-size:18px;margin:0 0 8px;">Mail Sistemi Başarıyla Çalışıyor!</h3>
            <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 20px;">
              SMTP ayarlarınız doğru şekilde yapılandırılmış.<br/>
              Sipariş bildirimleri ve iletişim formları artık çalışmaktadır.
            </p>
            <table width="100%" style="font-size:13px;text-align:left;border-collapse:collapse;">
              <tr><td style="color:#999;padding:4px 0;">SMTP Sunucu:</td><td style="color:#333;font-weight:600;">${host}</td></tr>
              <tr><td style="color:#999;padding:4px 0;">Port:</td><td style="color:#333;font-weight:600;">${process.env.SMTP_PORT ?? 587}</td></tr>
              <tr><td style="color:#999;padding:4px 0;">Gönderen:</td><td style="color:#333;font-weight:600;">${from}</td></tr>
              <tr><td style="color:#999;padding:4px 0;">Alıcı:</td><td style="color:#333;font-weight:600;">${target}</td></tr>
            </table>
          </div>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px;">Göçmen Perde Admin Paneli</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, to: target });
  } catch (err: any) {
    console.error("[TEST_MAIL]", err);
    return NextResponse.json(
      { error: err.message ?? "Mail gönderilemedi. SMTP bilgilerini kontrol edin." },
      { status: 500 }
    );
  }
}
