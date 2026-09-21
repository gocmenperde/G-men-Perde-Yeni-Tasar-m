-- Keep the settings schema aligned with prisma/schema.prisma.
-- IF NOT EXISTS makes this safe for installations that already received
-- one or more of these fields through an earlier schema sync.
ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "homepageVideoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "homepageVideoSource" TEXT,
  ADD COLUMN IF NOT EXISTS "freeShippingThreshold" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "shippingFee" DOUBLE PRECISION;

UPDATE "SiteSettings"
SET
  "freeShippingThreshold" = COALESCE("freeShippingThreshold", 1500),
  "shippingFee" = COALESCE("shippingFee", 79.90);

ALTER TABLE "SiteSettings"
  ALTER COLUMN "freeShippingThreshold" SET DEFAULT 1500,
  ALTER COLUMN "freeShippingThreshold" SET NOT NULL,
  ALTER COLUMN "shippingFee" SET DEFAULT 79.90,
  ALTER COLUMN "shippingFee" SET NOT NULL;