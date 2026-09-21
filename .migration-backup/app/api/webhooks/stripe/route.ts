import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "Endpoint hazır." });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
