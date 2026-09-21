-- Add adminNote to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "adminNote" TEXT;

-- RestockNotification table
CREATE TABLE IF NOT EXISTS "RestockNotification" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestockNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RestockNotification_productId_idx" ON "RestockNotification"("productId");
CREATE INDEX IF NOT EXISTS "RestockNotification_notifiedAt_idx" ON "RestockNotification"("notifiedAt");
