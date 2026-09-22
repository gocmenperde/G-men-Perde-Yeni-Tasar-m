import { PrismaClient, type Prisma } from "@prisma/client";
import { getRuntimeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  catalogPrisma?: PrismaClient;
};

// The primary database owns the full application: catalog, accounts, sessions,
// addresses, carts, orders, settings, and admin data. Runtime queries use only
// DATABASE_URL; DIRECT_URL is reserved for Prisma direct schema operations.
const primaryDatabaseUrl = getRuntimeDatabaseUrl();

const clientOptions = (url?: string): Prisma.PrismaClientOptions => ({
  ...(url ? { datasources: { db: { url } } } : {}),
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(clientOptions(primaryDatabaseUrl));

export const catalogDb =
  globalForPrisma.catalogPrisma ??
  db;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.catalogPrisma = catalogDb;
}
