import { NextRequest, NextResponse } from "next/server";

// SVG icon'u PNG olarak serve eder (basit gradient icon)
// Gerçek icon için admin'den yüklenebilir, şimdilik brand rengi ile SVG-based PNG
export async function GET(req: NextRequest) {
  const size = req.nextUrl.searchParams.get("size") ?? "192";
  const n = parseInt(size);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C9A84C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B6914;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${n}" height="${n}" rx="${Math.round(n * 0.2)}" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white"
    font-family="Georgia, serif" font-size="${Math.round(n * 0.42)}" font-weight="bold" letter-spacing="-1">G</text>
  <text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.7)"
    font-family="Arial, sans-serif" font-size="${Math.round(n * 0.1)}" letter-spacing="1">KIRTASIYE</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
