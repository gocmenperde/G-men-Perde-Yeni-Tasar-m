/**
 * Runtime Prisma queries use the explicitly supplied Neon URL when present.
 * Replit's provisioned DATABASE_URL can point at the empty workspace database,
 * while the imported storefront is configured to use NEON_DATABASE_URL.
 *
 * DIRECT_URL is intentionally not used here. Prisma uses it for direct
 * schema/migration operations through the datasource configuration.
 */
export function getRuntimeDatabaseUrl() {
  const rawUrl =
    process.env.NEON_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim();

  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    return url.toString();
  } catch {
    // Let Prisma report malformed connection strings instead of hiding them.
    return rawUrl;
  }
}