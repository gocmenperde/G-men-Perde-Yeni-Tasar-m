import { NextRequest, NextResponse } from 'next/server';

function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cronHeader = req.headers.get('x-cron-secret');
  if (cronHeader) {
    return cronHeader.trim();
  }

  const keyFromQuery = req.nextUrl.searchParams.get('key');
  if (keyFromQuery) {
    return keyFromQuery.trim();
  }

  return null;
}

function getExpectedSecrets(): string[] {
  const candidates = [
    process.env.CRON_SECRET,
    process.env.CRON_SECRET_FALLBACK,
    process.env.BKM_CRON_SECRET_KEY,
  ];

  const fromList = process.env.CRON_SECRETS
    ?.split(',')
    .map((secret) => secret.trim())
    .filter(Boolean);

  return [...candidates, ...(fromList ?? [])]
    .map((secret) => secret?.trim())
    .filter((secret): secret is string => Boolean(secret));
}

function isAuthorized(req: NextRequest): boolean {
  const expectedSecrets = getExpectedSecrets();
  if (expectedSecrets.length === 0) {
    return false;
  }

  const providedToken = getTokenFromRequest(req);
  if (!providedToken) {
    return false;
  }

  return expectedSecrets.includes(providedToken);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        error: 'Yetkisiz erişim',
        detail:
          'Bu endpoint sadece cron tetikleyicisi içindir. Authorization: Bearer <CRON_SECRET>, x-cron-secret header veya ?key=<CRON_SECRET> kullanın.',
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Fiyat senkronizasyonu tetiklendi.',
    at: new Date().toISOString(),
  });
}
