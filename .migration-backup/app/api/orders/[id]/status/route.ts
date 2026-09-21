import { NextResponse } from "next/server";

export async function PUT() {
  try {
    return NextResponse.json({ message: "Sipariş durumu güncellendi." });
  } catch {
    return NextResponse.json({ error: "Sipariş durumu güncellenemedi." }, { status: 500 });
  }
}
