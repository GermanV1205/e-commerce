-- Sesiones de PlacetoPay ligadas 1:1 a un pedido.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'APPROVED_PARTIAL',
            'PARTIAL_EXPIRED',
            'FAILED'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "request_id" VARCHAR(40),
    "reference" VARCHAR(32) NOT NULL,
    "process_url" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10, 2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "authorization" VARCHAR(50),
    "internal_reference" VARCHAR(50),
    "receipt" VARCHAR(50),
    "franchise" VARCHAR(30),
    "issuer_name" VARCHAR(100),
    "payment_method_name" VARCHAR(50),
    "last_digits" VARCHAR(4),
    "status_message" VARCHAR(255),
    "stock_released_at" TIMESTAMP(3),
    "raw_response" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_order_id_key" ON "payments"("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_request_id_key" ON "payments"("request_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_reference_key" ON "payments"("reference");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_order_id_fkey'
    ) THEN
        ALTER TABLE "payments"
            ADD CONSTRAINT "payments_order_id_fkey"
            FOREIGN KEY ("order_id") REFERENCES "orders"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
