-- Token-based usage instead of presentation count limits
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenBalance" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenResetAt" TIMESTAMP(3);

UPDATE "User"
SET "tokenBalance" = GREATEST(
  0,
  CASE COALESCE("plan", 'Free')
    WHEN 'Pro' THEN (30 - COALESCE("monthlyDeckCount", 0)) * 100
    WHEN 'Middle' THEN (15 - COALESCE("monthlyDeckCount", 0)) * 100
    WHEN 'Base' THEN (5 - COALESCE("monthlyDeckCount", 0)) * 100
    ELSE (1 - COALESCE("monthlyDeckCount", 0)) * 100
  END
)
WHERE "tokenResetAt" IS NULL;

UPDATE "User"
SET "tokenResetAt" = COALESCE("monthlyDeckResetAt", NOW() + INTERVAL '1 month')
WHERE "tokenResetAt" IS NULL;
