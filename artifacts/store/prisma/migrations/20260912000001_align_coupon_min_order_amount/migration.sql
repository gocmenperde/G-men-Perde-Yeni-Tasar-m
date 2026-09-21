-- The imported Supabase schema used minPurchase while the Prisma model uses
-- minOrderAmount. Keep the legacy column for compatibility and add the
-- application column without dropping or rewriting existing coupon data.
ALTER TABLE "Coupon"
  ADD COLUMN IF NOT EXISTS "minOrderAmount" DECIMAL(10,2);

UPDATE "Coupon"
SET "minOrderAmount" = COALESCE("minOrderAmount", "minPurchase", 0)
WHERE "minOrderAmount" IS NULL;

ALTER TABLE "Coupon"
  ALTER COLUMN "minOrderAmount" SET DEFAULT 0,
  ALTER COLUMN "minOrderAmount" SET NOT NULL;