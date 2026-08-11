import "server-only";

import { createHash } from "node:crypto";
import { db } from "@/server/db";
import { googleApiFetch } from "@/server/google/api";
import { GOOGLE_CALENDAR_SCOPE } from "@/server/google/constants";
import { GoogleIntegrationError } from "@/server/google/errors";
import { getGoogleAccessToken } from "@/server/google/tokens";

type GoogleCalendar = { id: string; summary: string };
type GoogleEvent = { id: string; etag?: string };

function encoded(value: string) {
  return encodeURIComponent(value);
}

function deterministicEventId(targetId: string, eventId: string) {
  return createHash("sha256").update(`${targetId}:${eventId}`).digest("hex");
}

export async function createCasaHubCalendar(params: { userId: string; apartmentId: string; apartmentName: string; timezone: string }) {
  const existing = await db.googleCalendarTarget.findUnique({ where: { userId_apartmentId: { userId: params.userId, apartmentId: params.apartmentId } } });
  if (existing) return db.googleCalendarTarget.update({ where: { id: existing.id }, data: { enabled: true, lastErrorCode: null } });

  const accessToken = await getGoogleAccessToken(params.userId, GOOGLE_CALENDAR_SCOPE);
  const name = `CasaHub – ${params.apartmentName}`;
  const calendar = await googleApiFetch<GoogleCalendar>(accessToken, "https://www.googleapis.com/calendar/v3/calendars", {
    method: "POST",
    body: JSON.stringify({ summary: name, description: "Eventi condivisi dell’appartamento gestiti da CasaHub", timeZone: params.timezone }),
  });

  return db.googleCalendarTarget.create({
    data: { userId: params.userId, apartmentId: params.apartmentId, calendarId: calendar.id, calendarName: calendar.summary || name },
  });
}

export async function upsertGoogleCalendarEvent(params: { userId: string; apartmentId: string; eventId: string }) {
  const [target, event] = await Promise.all([
    db.googleCalendarTarget.findUnique({ where: { userId_apartmentId: { userId: params.userId, apartmentId: params.apartmentId } } }),
    db.calendarEvent.findFirst({ where: { id: params.eventId, apartmentId: params.apartmentId }, include: { apartment: { select: { timezone: true } } } }),
  ]);
  if (!target?.enabled) throw new GoogleIntegrationError("GOOGLE_CALENDAR_DISABLED");
  if (!event || event.status === "CANCELLED") return deleteGoogleCalendarEvent(params);

  const accessToken = await getGoogleAccessToken(params.userId, GOOGLE_CALENDAR_SCOPE);
  const link = await db.googleEventLink.findUnique({ where: { targetId_eventId: { targetId: target.id, eventId: event.id } } });
  const googleEventId = link?.googleEventId ?? deterministicEventId(target.id, event.id);
  const resource = {
    id: googleEventId,
    summary: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    start: { dateTime: event.startsAt.toISOString(), timeZone: event.apartment.timezone },
    end: { dateTime: event.endsAt.toISOString(), timeZone: event.apartment.timezone },
    extendedProperties: { private: { casahubEventId: event.id, casahubApartmentId: event.apartmentId } },
  };
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encoded(target.calendarId)}/events`;

  let saved: GoogleEvent;
  try {
    saved = link
      ? await googleApiFetch<GoogleEvent>(accessToken, `${base}/${encoded(googleEventId)}`, { method: "PATCH", body: JSON.stringify(resource) })
      : await googleApiFetch<GoogleEvent>(accessToken, base, { method: "POST", body: JSON.stringify(resource) });
  } catch (error) {
    if (!link && error instanceof GoogleIntegrationError && error.code.startsWith("GOOGLE_409")) {
      saved = await googleApiFetch<GoogleEvent>(accessToken, `${base}/${encoded(googleEventId)}`);
    } else {
      throw error;
    }
  }

  const now = new Date();
  await db.$transaction([
    db.googleEventLink.upsert({
      where: { targetId_eventId: { targetId: target.id, eventId: event.id } },
      create: { targetId: target.id, eventId: event.id, googleEventId: saved.id, etag: saved.etag ?? null, lastSyncedAt: now },
      update: { googleEventId: saved.id, etag: saved.etag ?? null, lastSyncedAt: now },
    }),
    db.googleCalendarTarget.update({ where: { id: target.id }, data: { lastSyncedAt: now, lastErrorCode: null } }),
  ]);
}

export async function deleteGoogleCalendarEvent(params: { userId: string; apartmentId: string; eventId: string }) {
  const target = await db.googleCalendarTarget.findUnique({ where: { userId_apartmentId: { userId: params.userId, apartmentId: params.apartmentId } } });
  if (!target) return;
  const link = await db.googleEventLink.findUnique({ where: { targetId_eventId: { targetId: target.id, eventId: params.eventId } } });
  if (!link) return;

  const accessToken = await getGoogleAccessToken(params.userId, GOOGLE_CALENDAR_SCOPE);
  try {
    await googleApiFetch<void>(accessToken, `https://www.googleapis.com/calendar/v3/calendars/${encoded(target.calendarId)}/events/${encoded(link.googleEventId)}`, { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof GoogleIntegrationError) || (!error.code.startsWith("GOOGLE_404") && !error.code.startsWith("GOOGLE_410"))) throw error;
  }
  await db.googleEventLink.delete({ where: { id: link.id } });
}
