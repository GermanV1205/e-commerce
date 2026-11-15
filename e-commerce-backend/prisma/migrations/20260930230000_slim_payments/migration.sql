-- CreateDate: 20260930230000
-- Limpia columnas de PlacetoPay que ya no usa el checkout por transferencia.

DROP INDEX IF EXISTS "payments_request_id_key";

ALTER TABLE "payments" DROP COLUMN IF EXISTS "request_id";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "process_url";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "authorization";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "internal_reference";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "receipt";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "franchise";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "issuer_name";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "last_digits";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "stock_released_at";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "raw_response";
ALTER TABLE "payments" DROP COLUMN IF EXISTS "expires_at";
