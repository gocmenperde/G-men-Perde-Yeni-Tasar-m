-- The imported Supabase schema used minPurchase while the Prisma model uses
-- minOrderAmount. Keep the legacy column for compatibility when it exists,
-- while also supporting databases created from the current Prisma baseline.
ALTER TABLE "Coupon"
  ADD COLUMN IF NOT EXISTS "minOrderAmount" DECIMAL(10,2);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Coupon'
      AND column_name = 'minPurchase'
  ) THEN
    UPDATE "Coupon"
    SET "minOrderAmount" = COALESCE("minOrderAmount", "minPurchase", 0)
    WHERE "minOrderAmount" IS NULL;
  ELSE
    UPDATE "Coupon"
    SET "minOrderAmount" = COALESCE("minOrderAmount", 0)
    WHERE "minOrderAmount" IS NULL;
  END IF;
END $$;

ALTER TABLE "Coupon"
  ALTER COLUMN "minOrderAmount" SET DEFAULT 0,
  ALTER COLUMN "minOrderAmount" SET NOT NULL;