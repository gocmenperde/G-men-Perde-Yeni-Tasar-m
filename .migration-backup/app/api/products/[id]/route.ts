import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: null });
  } catch {
    return NextResponse.json({ error: "Ürün getirilemedi." }, { status: 500 });
  }
}

export async function PUT() {
  try {
    return NextResponse.json({ message: "Ürün güncellendi." });
  } catch {
    return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    return NextResponse.json({ message: "Ürün silindi." });
  } catch {
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
  }
}
