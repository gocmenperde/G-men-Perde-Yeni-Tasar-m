import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: [] });
  } catch {
    return NextResponse.json({ error: "Kayıtlar getirilemedi." }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({ message: "Kayıt oluşturuldu." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 500 });
  }
}
