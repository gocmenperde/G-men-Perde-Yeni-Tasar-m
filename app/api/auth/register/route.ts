import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { checkRateLimit, getRequestIp } from '@/artifacts/store/lib/rate-limit';

type RegisterPayload = { name?: string; email?: string; password?: string };

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const limit = checkRateLimit(`root-register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }, { status: 429 });
  }

  try {
    const { name, email, password } = (await req.json()) as RegisterPayload;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { name: name.trim(), email: normalizedEmail, password: hashed, role: 'USER' } });
    return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error('[ROOT_AUTH_REGISTER]', error);
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    return NextResponse.json({ error: process.env.NODE_ENV === 'development' ? message : 'Sunucu hatası' }, { status: 500 });
  }
}
