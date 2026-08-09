-- Persist Better Auth rate limits across serverless instances.
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- Track invitation lifecycle without storing the plaintext token.
ALTER TABLE "Invitation"
ADD COLUMN "acceptedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Invitation_apartmentId_status_idx" ON "Invitation"("apartmentId", "status");
CREATE INDEX "Invitation_email_status_expiresAt_idx" ON "Invitation"("email", "status", "expiresAt");

ALTER TABLE "Apartment" ADD COLUMN "creationKey" TEXT;
CREATE UNIQUE INDEX "Apartment_creationKey_key" ON "Apartment"("creationKey");
