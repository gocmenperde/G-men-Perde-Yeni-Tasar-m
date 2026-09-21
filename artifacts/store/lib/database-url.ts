/**
 * Supabase's session pooler has a small per-project connection limit.
 * Prisma application traffic should use the transaction pooler instead.
 * Migration commands intentionally keep using the original URL because they
 * need a direct/session connection when available.
 */
export function getRuntimeDatabaseUrl() {
  const rawUrl =
    process.env.SUPABASE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    const isSupabasePooler = url.hostname.endsWith(".pooler.supabase.com");

    if (isSupabasePooler) {
      url.port = "6543";
      url.searchParams.set("pgbouncer", "true");
    }

    return url.toString();
  } catch {
    // Let Prisma report malformed connection strings instead of hiding them.
    return rawUrl;
  }
}