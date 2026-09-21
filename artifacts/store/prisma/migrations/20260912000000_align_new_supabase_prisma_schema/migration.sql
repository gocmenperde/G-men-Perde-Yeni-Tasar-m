-- Align the connected Supabase database with the current Prisma schema.
-- This migration is intentionally idempotent because the Supabase project
-- was provisioned without Prisma's _prisma_migrations table.

CREATE TABLE IF NOT EXISTS "ProductBackup" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "snapshotLabel" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL,
    "images" TEXT[] NOT NULL,
    "isFeatured" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "barcode" TEXT,
    "weight" DECIMAL(10,3),
    "tags" TEXT[] NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductBackup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductBackup_snapshotId_productId_key"
ON "ProductBackup"("snapshotId", "productId");

CREATE INDEX IF NOT EXISTS "ProductBackup_snapshotId_idx"
ON "ProductBackup"("snapshotId");

CREATE INDEX IF NOT EXISTS "ProductBackup_createdAt_idx"
ON "ProductBackup"("createdAt");

CREATE TABLE IF NOT EXISTS "ProductBotJob" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "nextOffset" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "lastProductId" TEXT,
    "lastProductName" TEXT,
    "lastError" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductBotJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductBotJob_status_idx"
ON "ProductBotJob"("status");

CREATE INDEX IF NOT EXISTS "ProductBotJob_updatedAt_idx"
ON "ProductBotJob"("updatedAt");