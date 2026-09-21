import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik görsel arama devre dışıdır. Görseller CSV/XLSX ile yönetilir." },
    { status: 410 },
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized(req))) return unauthorizedResponse();
  return NextResponse.json(
    { error: "Otomatik görsel arama devre dışıdır. Görseller CSV/XLSX ile yönetilir." },
    { status: 410 },
  );
}