import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: [] });
  } catch {
    return NextResponse.json({ error: "Ürünler alınamadı." }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({ message: "Ürün oluşturma endpointi hazır." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ürün oluşturulamadı." }, { status: 500 });
  }
}
