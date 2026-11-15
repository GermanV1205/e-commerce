ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT;
ALTER TABLE "payments" ALTER COLUMN "expires_at" DROP NOT NULL;
