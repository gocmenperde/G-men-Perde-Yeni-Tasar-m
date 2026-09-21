import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const FALLBACK_LOGO = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Marka")}&background=f59e0b&color=111827&bold=true&format=png&size=256`;

const BRAND_LOGOS: Record<string, string> = {
  // ── Uluslararası kırtasiye markaları (doğrulanmış Wikimedia SVG) ──
  "faber-castell":  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Faber-Castell_Logo.svg/320px-Faber-Castell_Logo.svg.png",
  "faber":          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Faber-Castell_Logo.svg/320px-Faber-Castell_Logo.svg.png",
  "pelikan":        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Pelikan_Logo.svg/320px-Pelikan_Logo.svg.png",
  "staedtler":      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Staedtler_Mars_GmbH_Logo_2013.svg/320px-Staedtler_Mars_GmbH_Logo_2013.svg.png",
  "pentel":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Pentel_logo.svg/320px-Pentel_logo.svg.png",
  "stabilo":        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Stabilo_Logo_2019.svg/320px-Stabilo_Logo_2019.svg.png",
  "bic":            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bic_logo.svg/320px-Bic_logo.svg.png",
  "parker":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Parker_Pen_Company_logo.svg/320px-Parker_Pen_Company_logo.svg.png",
  "pilot":          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Pilot_pen_logo.svg/320px-Pilot_pen_logo.svg.png",
  "crayola":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Crayola_logo.svg/320px-Crayola_logo.svg.png",
  "schneider":      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Schneider_Schreibger%C3%A4te_Logo.svg/320px-Schneider_Schreibger%C3%A4te_Logo.svg.png",
  "edding":         "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Edding_logo.svg/320px-Edding_logo.svg.png",
  "eastpak":        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Eastpak_logo.svg/320px-Eastpak_logo.svg.png",
  "play-doh":       "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Play-Doh_logo.svg/320px-Play-Doh_logo.svg.png",
  "tombow":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tombow_logo.svg/320px-Tombow_logo.svg.png",
  "maped":          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Maped_logo.svg/320px-Maped_logo.svg.png",
  "lego":           "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/320px-LEGO_logo.svg.png",
  "playmobil":      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Playmobil_logo.svg/320px-Playmobil_logo.svg.png",
  "samsung":        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png",
  "moleskine":      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Moleskine_logo.svg/320px-Moleskine_logo.svg.png",
  "koh-i-noor":     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Koh-i-Noor_Hardtmuth_logo.svg/320px-Koh-i-Noor_Hardtmuth_logo.svg.png",
  "koh-i-noor-hardtmuth": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Koh-i-Noor_Hardtmuth_logo.svg/320px-Koh-i-Noor_Hardtmuth_logo.svg.png",
  "winsor-newton":  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Winsor_%26_Newton_logo.svg/320px-Winsor_%26_Newton_logo.svg.png",
  "winsor":         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Winsor_%26_Newton_logo.svg/320px-Winsor_%26_Newton_logo.svg.png",
  "daler-rowney":   "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Daler-Rowney_logo.svg/320px-Daler-Rowney_logo.svg.png",
  "uni-ball":       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uni-ball_logo.svg/320px-Uni-ball_logo.svg.png",
  "uniball":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uni-ball_logo.svg/320px-Uni-ball_logo.svg.png",
  "mitsubishi":     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mitsubishi_logo.svg/320px-Mitsubishi_logo.svg.png",
};

function normSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    const { brandId, brandSlug, brandName } = (await req.json()) as {
      brandId: string;
      brandSlug: string;
      brandName: string;
    };
    if (!brandId || !brandSlug)
      return NextResponse.json({ error: "brandId ve brandSlug gerekli" }, { status: 400 });

    const logoUrl =
      BRAND_LOGOS[brandSlug] ??
      BRAND_LOGOS[normSlug(brandSlug)] ??
      BRAND_LOGOS[normSlug(brandName ?? "")] ??
      BRAND_LOGOS[(brandName ?? "").toLowerCase().replace(/\s+/g, "-")] ??
      FALLBACK_LOGO(brandName || brandSlug);

    await db.brand.update({
      where: { id: brandId },
      data: { logo: logoUrl },
    });
    revalidateTag("storefront-homepage");

    return NextResponse.json({ saved: true, logo: logoUrl });
  } catch (e) {
    console.error("[brand-images]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
