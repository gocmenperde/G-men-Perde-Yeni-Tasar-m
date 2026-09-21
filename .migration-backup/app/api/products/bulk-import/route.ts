import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "Toplu içe aktarma endpointi hazır." });
  } catch {
    return NextResponse.json({ error: "İçe aktarma başarısız." }, { status: 500 });
  }
}
