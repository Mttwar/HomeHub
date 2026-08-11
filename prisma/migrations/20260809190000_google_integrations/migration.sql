CREATE TYPE "CalendarEventStatus" AS ENUM ('ACTIVE', 'CANCELLED');
CREATE TYPE "IntegrationJobType" AS ENUM ('CALENDAR_UPSERT', 'CALENDAR_DELETE', 'GMAIL_SEND');
CREATE TYPE "IntegrationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

ALTER TABLE "CalendarEvent"
ADD COLUMN "status" "CalendarEventStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE "GoogleIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastErrorCode" TEXT,
    "calendarEnabledAt" TIMESTAMP(3),
    "gmailEnabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoogleIntegration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoogleCalendarTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "calendarName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoogleCalendarTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoogleEventLink" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "etag" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GoogleEventLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailDelivery" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "toEncrypted" TEXT NOT NULL,
    "subjectEncrypted" TEXT NOT NULL,
    "bodyEncrypted" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apartmentId" TEXT,
    "type" "IntegrationJobType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" "IntegrationJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntegrationJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoogleIntegration_userId_key" ON "GoogleIntegration"("userId");
CREATE UNIQUE INDEX "GoogleCalendarTarget_userId_apartmentId_key" ON "GoogleCalendarTarget"("userId", "apartmentId");
CREATE UNIQUE INDEX "GoogleCalendarTarget_userId_calendarId_key" ON "GoogleCalendarTarget"("userId", "calendarId");
CREATE INDEX "GoogleCalendarTarget_apartmentId_enabled_idx" ON "GoogleCalendarTarget"("apartmentId", "enabled");
CREATE UNIQUE INDEX "GoogleEventLink_targetId_eventId_key" ON "GoogleEventLink"("targetId", "eventId");
CREATE UNIQUE INDEX "GoogleEventLink_targetId_googleEventId_key" ON "GoogleEventLink"("targetId", "googleEventId");
CREATE INDEX "GoogleEventLink_eventId_idx" ON "GoogleEventLink"("eventId");
CREATE INDEX "EmailDelivery_senderUserId_createdAt_idx" ON "EmailDelivery"("senderUserId", "createdAt");
CREATE INDEX "EmailDelivery_status_createdAt_idx" ON "EmailDelivery"("status", "createdAt");
CREATE UNIQUE INDEX "IntegrationJob_dedupeKey_key" ON "IntegrationJob"("dedupeKey");
CREATE INDEX "IntegrationJob_status_availableAt_idx" ON "IntegrationJob"("status", "availableAt");
CREATE INDEX "IntegrationJob_userId_type_idx" ON "IntegrationJob"("userId", "type");

ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "GoogleIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarTarget" ADD CONSTRAINT "GoogleCalendarTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarTarget" ADD CONSTRAINT "GoogleCalendarTarget_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleEventLink" ADD CONSTRAINT "GoogleEventLink_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "GoogleCalendarTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleEventLink" ADD CONSTRAINT "GoogleEventLink_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationJob" ADD CONSTRAINT "IntegrationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationJob" ADD CONSTRAINT "IntegrationJob_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
