type PrismaClientLike = {
  [key: string]: unknown;
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientLike | undefined };

export const db: PrismaClientLike = globalForPrisma.prisma ?? {};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
