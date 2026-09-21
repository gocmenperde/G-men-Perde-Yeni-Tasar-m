import { PrismaClient, type Prisma } from "@prisma/client";
import { getRuntimeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  catalogPrisma?: PrismaClient;
};

// The primary database owns the full application: catalog, accounts, sessions,
// addresses, carts, orders, settings, and admin data. Replit's runtime-managed
// DATABASE_URL is not necessarily the application's Supabase database, so an
// explicit SUPABASE_DATABASE_URL takes priority in both Replit and Vercel.
const explicitSupabaseDatabaseUrl = process.env.SUPABASE_DATABASE_URL?.trim();
const primaryDatabaseUrl = getRuntimeDatabaseUrl();

// Keep the legacy catalog connection as a compatibility fallback only. Once
// SUPABASE_DATABASE_URL is set, the connected new Supabase is the single source
// of truth and TARGET_SUPABASE_URL cannot silently override it.
const catalogDatabaseUrl =
  explicitSupabaseDatabaseUrl
    ? getRuntimeDatabaseUrl()
    : process.env.TARGET_SUPABASE_URL?.trim() ||
      primaryDatabaseUrl;

const clientOptions = (url?: string): Prisma.PrismaClientOptions => ({
  ...(url ? { datasources: { db: { url } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(clientOptions(primaryDatabaseUrl));

export const catalogDb =
  globalForPrisma.catalogPrisma ??
  (catalogDatabaseUrl === primaryDatabaseUrl
    ? db
    : new PrismaClient(clientOptions(catalogDatabaseUrl)));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.catalogPrisma = catalogDb;
}
