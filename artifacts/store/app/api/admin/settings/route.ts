import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { bustSettingsCache } from "@/lib/settings";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "data", "site-settings.json");
const IS_DEV = process.env.NODE_ENV === "development";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.SESSION_SECRET ??
  process.env.SECRET ??
  "";

function readFileSettings(): Record<string, any> {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeFileSettings(data: Record<string, any>) {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    const existing = readFileSettings();
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify({ ...existing, ...data }, null, 2),
      "utf-8"
    );
  } catch {}
}

function getSettingsDbErrorMessage(dbErr: any): string {
  const message = String(dbErr?.message ?? "Bilinmeyen hata");
  const missingShippingColumn =
    message.includes("freeShippingThreshold") ||
    message.includes("shippingFee");

  if (missingShippingColumn && message.includes("does not exist")) {
    return "Veritabanı şeması güncel değil. Yeni migration'ı uygulamak için uygulamanızı yeniden publish edin, ardından ayarı tekrar kaydedin.";
  }

  return message;
}

function isMissingSiteSettingsColumnError(dbErr: any): boolean {
  const message = String(dbErr?.message ?? "");
  return (
    message.includes("does not exist") &&
    (message.includes("freeShippingThreshold") ||
      message.includes("shippingFee") ||
      message.includes("homepageVideoUrl") ||
      message.includes("homepageVideoSource") ||
      message.includes("indexNowKey"))
  );
}

async function repairSiteSettingsSchema() {
  // Production was originally created with `prisma db push`, so it may not
  // have migration history. Repair only the additive settings columns needed
  // by this route, and only after Prisma reports that one is missing.
  await db.$executeRawUnsafe(`
    ALTER TABLE "SiteSettings"
      ADD COLUMN IF NOT EXISTS "homepageVideoUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "homepageVideoSource" TEXT,
      ADD COLUMN IF NOT EXISTS "freeShippingThreshold" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "shippingFee" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "indexNowKey" TEXT
  `);
  await db.$executeRawUnsafe(`
    UPDATE "SiteSettings"
    SET
      "freeShippingThreshold" = COALESCE("freeShippingThreshold", 1500),
      "shippingFee" = COALESCE("shippingFee", 79.90)
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "SiteSettings"
      ALTER COLUMN "freeShippingThreshold" SET DEFAULT 1500,
      ALTER COLUMN "freeShippingThreshold" SET NOT NULL,
      ALTER COLUMN "shippingFee" SET DEFAULT 79.90,
      ALTER COLUMN "shippingFee" SET NOT NULL
  `);
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
  if (IS_DEV) return true;
  try {
    // getToken() doğrudan JWT cookie'yi okur — NEXTAUTH_URL'den bağımsızdır
    const token = await getToken({ req, secret: JWT_SECRET });
    return !!(token && (token as any).role === "ADMIN");
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      try {
        const created = await db.siteSettings.create({ data: { id: "global" } });
        return NextResponse.json({ data: created });
      } catch {
        return NextResponse.json({ data: { id: "global", ...readFileSettings() } });
      }
    }
    return NextResponse.json({ data: settings });
  } catch {
    const fileData = readFileSettings();
    return NextResponse.json({ data: { id: "global", ...fileData } });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authorized = await isAuthorized(req);
    if (!authorized)
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = await req.json();

    writeFileSettings(body);

    let settings: any = { id: "global", ...readFileSettings() };

    const upsertSettings = () =>
      db.siteSettings.upsert({
        where: { id: "global" },
        create: { id: "global", ...body },
        update: body,
      });

    try {
      settings = await upsertSettings();
    } catch (dbErr: any) {
      if (!isMissingSiteSettingsColumnError(dbErr)) {
        console.error("[settings PUT] DB upsert hatası:", dbErr?.message ?? dbErr);
        return NextResponse.json(
          { error: "Veritabanına kaydedilemedi: " + getSettingsDbErrorMessage(dbErr) },
          { status: 500 }
        );
      }

      try {
        await repairSiteSettingsSchema();
        settings = await upsertSettings();
      } catch (repairErr: any) {
        console.error("[settings PUT] DB şema onarım hatası:", repairErr?.message ?? repairErr);
        return NextResponse.json(
          {
            error:
              "Veritabanı şeması otomatik güncellenemedi: " +
              getSettingsDbErrorMessage(repairErr),
          },
          { status: 500 }
        );
      }
    }

    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/products", "layout");
    revalidatePath("/about");
    revalidatePath("/about", "layout");
    revalidatePath("/contact");
    revalidatePath("/contact", "layout");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/faq");
    revalidatePath("/delivery");
    revalidatePath("/returns");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidateTag("storefront-settings");
    bustSettingsCache();

    return NextResponse.json({ data: settings, ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Kaydedilemedi." }, { status: 500 });
  }
}
