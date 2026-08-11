import "server-only";

import { db } from "@/server/db";
import { createCasaHubCalendar } from "@/server/google/calendar";
import { GOOGLE_CALENDAR_SCOPE, GOOGLE_GMAIL_SEND_SCOPE } from "@/server/google/constants";
import { getGoogleAccessToken } from "@/server/google/tokens";
import { enqueueCalendarBackfill } from "@/server/google/outbox";
import { isDataEncryptionConfigured } from "@/server/security/encryption";

export async function activateGoogleCalendar(params: { userId: string; apartmentId: string; actorId: string }) {
  const apartment = await db.apartment.findUniqueOrThrow({ where: { id: params.apartmentId }, select: { name: true, timezone: true } });
  const target = await createCasaHubCalendar({ userId: params.userId, apartmentId: params.apartmentId, apartmentName: apartment.name, timezone: apartment.timezone });
  await db.$transaction([
    db.googleIntegration.upsert({ where: { userId: params.userId }, create: { userId: params.userId, calendarEnabled: true, calendarEnabledAt: new Date() }, update: { calendarEnabled: true, calendarEnabledAt: new Date(), lastErrorCode: null } }),
    db.auditEvent.create({ data: { apartmentId: params.apartmentId, actorId: params.actorId, action: "google.calendar.enable", entityType: "integration", entityId: target.id } }),
  ]);
  await enqueueCalendarBackfill(params.userId, params.apartmentId);
  return target;
}

export async function activateGoogleGmail(params: { userId: string; apartmentId: string; actorId: string }) {
  if (!isDataEncryptionConfigured()) throw new Error("DATA_ENCRYPTION_KEY non configurata");
  await getGoogleAccessToken(params.userId, GOOGLE_GMAIL_SEND_SCOPE);
  await db.$transaction([
    db.googleIntegration.upsert({ where: { userId: params.userId }, create: { userId: params.userId, gmailEnabled: true, gmailEnabledAt: new Date() }, update: { gmailEnabled: true, gmailEnabledAt: new Date(), lastErrorCode: null } }),
    db.auditEvent.create({ data: { apartmentId: params.apartmentId, actorId: params.actorId, action: "google.gmail.enable", entityType: "integration" } }),
  ]);
}

export async function verifyGoogleCalendarGrant(userId: string) {
  await getGoogleAccessToken(userId, GOOGLE_CALENDAR_SCOPE);
}
