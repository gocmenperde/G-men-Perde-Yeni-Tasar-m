/**
 * Runtime Prisma queries use the deployment's DATABASE_URL.
 *
 * DIRECT_URL is intentionally not used here. Prisma uses it for direct
 * schema/migration operations through the datasource configuration.
 */
export function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL?.trim();

  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    return url.toString();
  } catch {
    // Let Prisma report malformed connection strings instead of hiding them.
    return rawUrl;
  }
}