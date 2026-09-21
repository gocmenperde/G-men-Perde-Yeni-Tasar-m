CREATE TABLE "ProductBackup" (
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

CREATE UNIQUE INDEX "ProductBackup_snapshotId_productId_key"
ON "ProductBackup"("snapshotId", "productId");

CREATE INDEX "ProductBackup_snapshotId_idx"
ON "ProductBackup"("snapshotId");

CREATE INDEX "ProductBackup_createdAt_idx"
ON "ProductBackup"("createdAt");