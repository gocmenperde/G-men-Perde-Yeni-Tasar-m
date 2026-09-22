import nodemailer from "nodemailer";

const CARGO_TRACKING_URL: Record<string, string> = {
  "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=",
  "PTT Kargo":     "https://www.ptt.gov.tr/tr/kargo-takip?barcode=",
  "Sürat Kargo":   "https://www.suratkargo.com.tr/kargotakip/?",
  "MNG Kargo":     "https://www.mngkargo.com.tr/wps/portal/kargo-takip?barkod=",
  "Aras Kargo":    "https://kargotakip.araskargo.com.tr/?code=",
  "UPS Kargo":     "https://www.ups.com/track?loc=tr_TR&tracknum=",
};

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

const BASE_STYLE = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f0e8;
  margin: 0; padding: 0;
`;

const CARD_STYLE = `
  max-width: 560px;
  margin: 32px auto;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

function baseTemplate(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Göçmen Perde</title>
</head>
<body style="${BASE_STYLE}">
  ${preheader ? `<span style="display:none;font-size:1px;color:#f5f0e8;max-height:0;">${preheader}</span>` : ""}
  <div style="${CARD_STYLE}">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1c1c1e 0%, #2d2b26 100%); padding: 28px 36px; text-align: center;">
      <p style="color: #D4AF5A; font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 6px;">BURSA · EST. 1993</p>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
        GÖÇMEN <span style="color: #D4AF5A;">PERDE</span>
      </h1>
    </div>
    <!-- Body -->
    <div style="padding: 36px 36px 28px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background: #faf7f2; border-top: 1px solid #e8e0d5; padding: 20px 36px; text-align: center;">
      <p style="color: #a09880; font-size: 12px; margin: 0 0 4px;">Göçmen Perde · Bursa, Osmangazi</p>
      <p style="color: #c0b090; font-size: 11px; margin: 0;">Bu e-postayı sipariş verdiğiniz için alıyorsunuz.</p>
    </div>
  </div>
</body>
</html>`;
}

function statusBadge(label: string, color: string, bg: string) {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;">${label}</span>`;
}

function orderInfoBox(orderId: string, items: any[], total: number) {
  const itemRows = items
    .slice(0, 5)
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; color: #444; font-size: 14px; border-bottom: 1px solid #f0ebe3;">
          ${item.product?.name ?? "Ürün"} <span style="color:#999;">×${item.quantity}</span>
        </td>
        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px; text-align:right; border-bottom: 1px solid #f0ebe3; white-space:nowrap;">
          ₺${(item.quantity * Number(item.price)).toLocaleString("tr-TR")}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="background:#faf7f2;border-radius:12px;padding:20px 22px;margin:20px 0 0;">
      <p style="font-size:11px;font-weight:700;color:#a09880;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">
        Sipariş Özeti · #${orderId.slice(-8).toUpperCase()}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemRows}
        <tr>
          <td style="padding-top:12px;font-weight:900;color:#1c1c1e;font-size:15px;">Toplam</td>
          <td style="padding-top:12px;font-weight:900;color:#1c1c1e;font-size:15px;text-align:right;">₺${total.toLocaleString("tr-TR")}</td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendOrderStatusEmail(order: {
  id: string;
  status: string;
  total: number;
  trackingNumber?: string | null;
  trackingCompany?: string | null;
  user: { name: string | null; email: string };
  items: { quantity: number; price: number; product: { name: string } }[];
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@gocmenperde.com";
  const firstName = order.user.name?.split(" ")[0] ?? "Sayın Müşterimiz";
  const trackUrl =
    order.trackingCompany && order.trackingNumber && CARGO_TRACKING_URL[order.trackingCompany]
      ? `${CARGO_TRACKING_URL[order.trackingCompany]}${order.trackingNumber}`
      : null;

  let subject = "";
  let html = "";

  if (order.status === "PAID") {
    subject = `Ödemeniz alındı, siparişiniz onaylandı ✅ — #${order.id.slice(-8).toUpperCase()}`;
    html = baseTemplate(
      `<p style="font-size:16px;color:#444;margin:0 0 6px;">Merhaba ${firstName},</p>
       <h2 style="font-size:22px;font-weight:900;color:#1c1c1e;margin:4px 0 16px;">Siparişiniz Onaylandı! 🎉</h2>
       ${statusBadge("ÖDEMELİ", "#15803d", "#f0fdf4")}
       <p style="color:#555;font-size:14px;line-height:1.7;margin:18px 0 0;">
         Ödemeniz başarıyla alındı. Siparişiniz en kısa sürede hazırlanarak kargoya verilecek ve sizi bilgilendireceğiz.
       </p>
       ${orderInfoBox(order.id, order.items, order.total)}`,
      `Siparişiniz #${order.id.slice(-8).toUpperCase()} onaylandı.`
    );
  } else if (order.status === "PROCESSING") {
    subject = `Siparişiniz hazırlanıyor — #${order.id.slice(-8).toUpperCase()}`;
    html = baseTemplate(
      `<p style="font-size:16px;color:#444;margin:0 0 6px;">Merhaba ${firstName},</p>
       <h2 style="font-size:22px;font-weight:900;color:#1c1c1e;margin:4px 0 16px;">Siparişiniz Hazırlanıyor 📦</h2>
       ${statusBadge("İŞLENİYOR", "#1d4ed8", "#eff6ff")}
       <p style="color:#555;font-size:14px;line-height:1.7;margin:18px 0 0;">
         Siparişiniz depomuza ulaştı ve özenle hazırlanmaya başlandı. Kargoya verildiğinde size ayrıca bilgi vereceğiz.
       </p>
       ${orderInfoBox(order.id, order.items, order.total)}`,
      `Siparişiniz #${order.id.slice(-8).toUpperCase()} hazırlanmaya başlandı.`
    );
  } else if (order.status === "SHIPPED") {
    subject = `Siparişiniz kargoya verildi! 🚚 — #${order.id.slice(-8).toUpperCase()}`;
    html = baseTemplate(
      `<p style="font-size:16px;color:#444;margin:0 0 6px;">Merhaba ${firstName},</p>
       <h2 style="font-size:22px;font-weight:900;color:#1c1c1e;margin:4px 0 16px;">Siparişiniz Yola Çıktı! 🚚</h2>
       ${statusBadge("KARGODA", "#7c3aed", "#f5f3ff")}
       <p style="color:#555;font-size:14px;line-height:1.7;margin:18px 0 16px;">
         Siparişiniz kargoya teslim edildi. Aşağıdaki bilgilerle takip edebilirsiniz.
       </p>
       ${
         order.trackingCompany || order.trackingNumber
           ? `<div style="background:#faf7f2;border:1px solid #e8e0d5;border-radius:12px;padding:18px 22px;margin-bottom:8px;">
               <p style="font-size:11px;font-weight:700;color:#a09880;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Kargo Bilgisi</p>
               ${order.trackingCompany ? `<p style="margin:0 0 6px;font-size:14px;color:#444;"><strong>Kargo Firması:</strong> ${order.trackingCompany}</p>` : ""}
               ${order.trackingNumber ? `<p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Takip No:</strong> <span style="font-family:monospace;background:#f0ebe3;padding:2px 8px;border-radius:6px;">${order.trackingNumber}</span></p>` : ""}
               ${
                 trackUrl
                   ? `<a href="${trackUrl}" style="display:inline-block;background:#D4AF5A;color:#1c1c1e;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;">
                       🔍 Kargumu Takip Et
                     </a>`
                   : ""
               }
             </div>`
           : ""
       }
       ${orderInfoBox(order.id, order.items, order.total)}`,
      `Siparişiniz kargoya verildi. Takip no: ${order.trackingNumber ?? "—"}`
    );
  } else if (order.status === "DELIVERED") {
    subject = `Siparişiniz teslim edildi ✅ — #${order.id.slice(-8).toUpperCase()}`;
    html = baseTemplate(
      `<p style="font-size:16px;color:#444;margin:0 0 6px;">Merhaba ${firstName},</p>
       <h2 style="font-size:22px;font-weight:900;color:#1c1c1e;margin:4px 0 16px;">Siparişiniz Teslim Edildi ✅</h2>
       ${statusBadge("TESLİM EDİLDİ", "#15803d", "#f0fdf4")}
       <p style="color:#555;font-size:14px;line-height:1.7;margin:18px 0 16px;">
         Siparişiniz başarıyla teslim edildi. Alışverişiniz için teşekkür ederiz. Ürünlerimizden memnun kaldıysanız değerlendirme bırakmayı unutmayın!
       </p>
       ${orderInfoBox(order.id, order.items, order.total)}
       <div style="text-align:center;margin-top:24px;">
         <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/products" style="display:inline-block;background:#1c1c1e;color:#D4AF5A;font-weight:700;font-size:13px;padding:12px 28px;border-radius:12px;text-decoration:none;">
           Tekrar Alışveriş Yap →
         </a>
       </div>`,
      `Siparişiniz teslim edildi. Alışverişiniz için teşekkürler!`
    );
  } else if (order.status === "CANCELED") {
    subject = `Siparişiniz iptal edildi — #${order.id.slice(-8).toUpperCase()}`;
    html = baseTemplate(
      `<p style="font-size:16px;color:#444;margin:0 0 6px;">Merhaba ${firstName},</p>
       <h2 style="font-size:22px;font-weight:900;color:#1c1c1e;margin:4px 0 16px;">Sipariş İptal Edildi</h2>
       ${statusBadge("İPTAL EDİLDİ", "#dc2626", "#fef2f2")}
       <p style="color:#555;font-size:14px;line-height:1.7;margin:18px 0 16px;">
         Siparişiniz iptal edildi. Herhangi bir ödeme yapıldıysa 3-5 iş günü içinde iade edilecektir. Sorularınız için bizimle iletişime geçebilirsiniz.
       </p>
       ${orderInfoBox(order.id, order.items, order.total)}`,
      `Siparişiniz #${order.id.slice(-8).toUpperCase()} iptal edildi.`
    );
  } else {
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Göçmen Perde" <${from}>`,
      to: order.user.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Email] Gönderilemedi:", err);
  }
}
