import "server-only";

import type { IntegrationJobType } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { deleteGoogleCalendarEvent, upsertGoogleCalendarEvent } from "@/server/google/calendar";
import { GoogleIntegrationError, safeIntegrationErrorCode } from "@/server/google/errors";
import { sendGmailMessage } from "@/server/google/gmail";
import { decryptSensitiveString } from "@/server/security/encryption";

const MAX_ATTEMPTS = 5;
const retryDelays = [60, 5 * 60, 30 * 60, 2 * 60 * 60, 12 * 60 * 60];

export async function enqueueCalendarEventJobs(params: { apartmentId: string; eventId: string; type: "CALENDAR_UPSERT" | "CALENDAR_DELETE" }) {
  const participants = await db.eventParticipant.findMany({ where: { eventId: params.eventId }, select: { userId: true } });
  if (!participants.length) return 0;
  const targets = await db.googleCalendarTarget.findMany({
    where: { apartmentId: params.apartmentId, enabled: true, userId: { in: participants.map(({ userId }) => userId) } },
    select: { id: true, userId: true },
  });
  if (!targets.length) return 0;

  await db.$transaction(targets.map((target) => db.integrationJob.upsert({
    where: { dedupeKey: `calendar:${target.id}:${params.eventId}` },
    create: { userId: target.userId, apartmentId: params.apartmentId, type: params.type, entityId: params.eventId, dedupeKey: `calendar:${target.id}:${params.eventId}` },
    update: { type: params.type, status: "PENDING", attempts: 0, availableAt: new Date(), lockedAt: null, lastErrorCode: null },
  })));
  return targets.length;
}

export async function enqueueCalendarBackfill(userId: string, apartmentId: string) {
  const events = await db.calendarEvent.findMany({
    where: { apartmentId, status: "ACTIVE", participants: { some: { userId } } },
    select: { id: true },
    take: 500,
  });
  let queued = 0;
  for (const event of events) queued += await enqueueCalendarEventJobs({ apartmentId, eventId: event.id, type: "CALENDAR_UPSERT" });
  return queued;
}

async function processCalendarJob(job: { userId: string; apartmentId: string | null; entityId: string; type: IntegrationJobType }) {
  if (!job.apartmentId) throw new GoogleIntegrationError("JOB_APARTMENT_MISSING");
  const params = { userId: job.userId, apartmentId: job.apartmentId, eventId: job.entityId };
  if (job.type === "CALENDAR_DELETE") await deleteGoogleCalendarEvent(params);
  else await upsertGoogleCalendarEvent(params);
}

async function processGmailJob(job: { userId: string; entityId: string }) {
  const [delivery, integration] = await Promise.all([
    db.emailDelivery.findUnique({ where: { id: job.entityId }, include: { sender: { select: { email: true } } } }),
    db.googleIntegration.findUnique({ where: { userId: job.userId }, select: { gmailEnabled: true } }),
  ]);
  if (!delivery || delivery.senderUserId !== job.userId) throw new GoogleIntegrationError("EMAIL_DELIVERY_NOT_FOUND");
  if (delivery.status === "SENT") return;
  if (!integration?.gmailEnabled) throw new GoogleIntegrationError("GOOGLE_GMAIL_DISABLED");

  await db.emailDelivery.update({ where: { id: delivery.id }, data: { status: "SENDING", attempts: { increment: 1 }, lastErrorCode: null } });
  const result = await sendGmailMessage({
    deliveryId: delivery.id,
    userId: delivery.senderUserId,
    from: delivery.sender.email,
    to: decryptSensitiveString(delivery.toEncrypted, `email:${delivery.id}:to`),
    subject: decryptSensitiveString(delivery.subjectEncrypted, `email:${delivery.id}:subject`),
    body: decryptSensitiveString(delivery.bodyEncrypted, `email:${delivery.id}:body`),
  });
  await db.emailDelivery.update({ where: { id: delivery.id }, data: { status: "SENT", providerMessageId: result.id, sentAt: new Date(), lastErrorCode: null } });
}

export async function processIntegrationJob(jobId: string) {
  const claimed = await db.integrationJob.updateMany({
    where: { id: jobId, status: { in: ["PENDING", "FAILED"] }, availableAt: { lte: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
    data: { status: "PROCESSING", lockedAt: new Date(), attempts: { increment: 1 }, lastErrorCode: null },
  });
  if (!claimed.count) return false;
  const job = await db.integrationJob.findUniqueOrThrow({ where: { id: jobId } });

  try {
    if (job.type === "GMAIL_SEND") await processGmailJob(job);
    else await processCalendarJob(job);
    await db.integrationJob.update({ where: { id: job.id }, data: { status: "COMPLETED", lockedAt: null, lastErrorCode: null } });
    return true;
  } catch (error) {
    const code = safeIntegrationErrorCode(error);
    const retryable = error instanceof GoogleIntegrationError && error.retryable;
    const canRetry = retryable && job.attempts < MAX_ATTEMPTS;
    const delaySeconds = retryDelays[Math.min(job.attempts - 1, retryDelays.length - 1)]!;
    await db.$transaction([
      db.integrationJob.update({ where: { id: job.id }, data: { status: "FAILED", lockedAt: null, lastErrorCode: code, availableAt: canRetry ? new Date(Date.now() + delaySeconds * 1000) : new Date("9999-12-31T00:00:00.000Z") } }),
      ...(job.type === "GMAIL_SEND" ? [db.emailDelivery.updateMany({ where: { id: job.entityId, status: { not: "SENT" } }, data: { status: "FAILED", lastErrorCode: code } })] : []),
      ...(job.type !== "GMAIL_SEND" && job.apartmentId ? [db.googleCalendarTarget.updateMany({ where: { userId: job.userId, apartmentId: job.apartmentId }, data: { lastErrorCode: code } })] : []),
      db.googleIntegration.updateMany({ where: { userId: job.userId }, data: { lastErrorCode: code } }),
    ]);
    return false;
  }
}

export async function processPendingIntegrationJobs(params: { limit?: number; userId?: string } = {}) {
  const staleBefore = new Date(Date.now() - 15 * 60 * 1000);
  await db.integrationJob.updateMany({ where: { status: "PROCESSING", lockedAt: { lt: staleBefore } }, data: { status: "FAILED", lockedAt: null, availableAt: new Date(), lastErrorCode: "STALE_JOB_RECOVERED" } });
  const jobs = await db.integrationJob.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, availableAt: { lte: new Date() }, attempts: { lt: MAX_ATTEMPTS }, ...(params.userId ? { userId: params.userId } : {}) },
    orderBy: { availableAt: "asc" },
    take: Math.min(Math.max(params.limit ?? 20, 1), 100),
    select: { id: true },
  });
  let completed = 0;
  for (const job of jobs) if (await processIntegrationJob(job.id)) completed += 1;
  return { processed: jobs.length, completed };
}
