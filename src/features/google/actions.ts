"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { z } from "zod";
import type { GoogleActionState } from "@/features/google/state";
import { requireMembership } from "@/server/auth/require-membership";
import { db } from "@/server/db";
import { processIntegrationJob, processPendingIntegrationJobs, enqueueCalendarBackfill } from "@/server/google/outbox";
import { safeIntegrationErrorCode } from "@/server/google/errors";
import { encryptSensitiveString, isDataEncryptionConfigured } from "@/server/security/encryption";

function profilePaths() {
  revalidatePath("/owner/profilo");
  revalidatePath("/tenant/profilo");
}

export async function disableGoogleCalendar() {
  const { session, membership } = await requireMembership();
  await db.$transaction([
    db.googleCalendarTarget.updateMany({ where: { userId: session.user.id, apartmentId: membership.apartmentId }, data: { enabled: false, lastErrorCode: null } }),
    db.googleIntegration.updateMany({ where: { userId: session.user.id }, data: { calendarEnabled: false } }),
    db.integrationJob.updateMany({ where: { userId: session.user.id, apartmentId: membership.apartmentId, type: { in: ["CALENDAR_UPSERT", "CALENDAR_DELETE"] }, status: { in: ["PENDING", "FAILED"] } }, data: { status: "COMPLETED", lastErrorCode: "DISABLED_BY_USER" } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "google.calendar.disable", entityType: "integration" } }),
  ]);
  profilePaths();
}

export async function disableGoogleGmail() {
  const { session, membership } = await requireMembership();
  await db.$transaction([
    db.googleIntegration.updateMany({ where: { userId: session.user.id }, data: { gmailEnabled: false } }),
    db.integrationJob.updateMany({ where: { userId: session.user.id, type: "GMAIL_SEND", status: { in: ["PENDING", "FAILED"] } }, data: { status: "COMPLETED", lastErrorCode: "DISABLED_BY_USER" } }),
    db.emailDelivery.updateMany({ where: { senderUserId: session.user.id, status: { in: ["PENDING", "FAILED"] } }, data: { status: "FAILED", lastErrorCode: "DISABLED_BY_USER" } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "google.gmail.disable", entityType: "integration" } }),
  ]);
  profilePaths();
}

export async function disableAllGoogleServices() {
  const { session, membership } = await requireMembership();
  await db.$transaction([
    db.googleCalendarTarget.updateMany({ where: { userId: session.user.id }, data: { enabled: false } }),
    db.googleIntegration.updateMany({ where: { userId: session.user.id }, data: { calendarEnabled: false, gmailEnabled: false } }),
    db.integrationJob.updateMany({ where: { userId: session.user.id, status: { in: ["PENDING", "FAILED"] } }, data: { status: "COMPLETED", lastErrorCode: "GOOGLE_ACCOUNT_UNLINKED" } }),
    db.emailDelivery.updateMany({ where: { senderUserId: session.user.id, status: { in: ["PENDING", "FAILED"] } }, data: { status: "FAILED", lastErrorCode: "GOOGLE_ACCOUNT_UNLINKED" } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "google.account.unlink", entityType: "integration" } }),
  ]);
  profilePaths();
}

export async function revokeGoogleAccount(_previous: GoogleActionState, _formData: FormData): Promise<GoogleActionState> {
  void _previous;
  void _formData;
  const { session, membership } = await requireMembership();
  const [googleAccount, credentialAccount] = await Promise.all([
    db.account.findFirst({ where: { userId: session.user.id, providerId: "google" }, select: { id: true, accountId: true } }),
    db.account.findFirst({ where: { userId: session.user.id, password: { not: null } }, select: { id: true } }),
  ]);
  if (!googleAccount) return { status: "success", message: "Account Google già scollegato." };
  if (!credentialAccount) return { status: "error", message: "Imposta prima una password: Google è il tuo unico metodo di accesso." };

  try {
    const token = await auth.api.getAccessToken({ body: { providerId: "google", accountId: googleAccount.accountId, userId: session.user.id } });
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ token: token.accessToken }),
      cache: "no-store",
    });
  } catch { /* La revoca locale resta obbligatoria anche se Google ha già invalidato il token. */ }

  await db.$transaction([
    db.account.delete({ where: { id: googleAccount.id } }),
    db.googleCalendarTarget.updateMany({ where: { userId: session.user.id }, data: { enabled: false } }),
    db.googleIntegration.updateMany({ where: { userId: session.user.id }, data: { calendarEnabled: false, gmailEnabled: false } }),
    db.integrationJob.updateMany({ where: { userId: session.user.id, status: { in: ["PENDING", "FAILED"] } }, data: { status: "COMPLETED", lastErrorCode: "GOOGLE_ACCOUNT_REVOKED" } }),
    db.emailDelivery.updateMany({ where: { senderUserId: session.user.id, status: { in: ["PENDING", "FAILED"] } }, data: { status: "FAILED", lastErrorCode: "GOOGLE_ACCOUNT_REVOKED" } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "google.account.revoke", entityType: "integration" } }),
  ]);
  profilePaths();
  return { status: "success", message: "Accesso Google revocato e dati di collegamento disattivati." };
}

export async function syncGoogleCalendar(_previous: GoogleActionState, _formData: FormData): Promise<GoogleActionState> {
  void _previous;
  void _formData;
  const { session, membership } = await requireMembership();
  const target = await db.googleCalendarTarget.findUnique({ where: { userId_apartmentId: { userId: session.user.id, apartmentId: membership.apartmentId } } });
  if (!target?.enabled) return { status: "error", message: "Google Calendar non è attivo per questo appartamento." };
  await enqueueCalendarBackfill(session.user.id, membership.apartmentId);
  after(() => processPendingIntegrationJobs({ userId: session.user.id, limit: 50 }));
  profilePaths();
  return { status: "success", message: "Sincronizzazione accodata in modo sicuro." };
}

const emailSchema = z.object({
  to: z.email("Inserisci un destinatario valido").max(254),
  subject: z.string().trim().min(2, "Inserisci l’oggetto").max(160),
  body: z.string().trim().min(1, "Scrivi il messaggio").max(10_000),
});

export async function sendGoogleEmail(_previous: GoogleActionState, formData: FormData): Promise<GoogleActionState> {
  const parsed = emailSchema.safeParse({ to: formData.get("to"), subject: formData.get("subject"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Email non valida" };
  const { session, membership } = await requireMembership();
  if (!isDataEncryptionConfigured()) return { status: "error", message: "Cifratura applicativa non configurata." };
  const integration = await db.googleIntegration.findUnique({ where: { userId: session.user.id } });
  if (!integration?.gmailEnabled) return { status: "error", message: "Attiva prima l’invio con Gmail." };

  const now = new Date();
  const [hourly, daily] = await Promise.all([
    db.emailDelivery.count({ where: { senderUserId: session.user.id, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } } }),
    db.emailDelivery.count({ where: { senderUserId: session.user.id, createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } }),
  ]);
  if (hourly >= 10 || daily >= 50) return { status: "error", message: "Limite di sicurezza per l’invio raggiunto. Riprova più tardi." };

  const deliveryId = crypto.randomUUID();
  const delivery = await db.$transaction(async (transaction) => {
    const created = await transaction.emailDelivery.create({
      data: {
        id: deliveryId,
        apartmentId: membership.apartmentId,
        senderUserId: session.user.id,
        toEncrypted: encryptSensitiveString(parsed.data.to, `email:${deliveryId}:to`),
        subjectEncrypted: encryptSensitiveString(parsed.data.subject, `email:${deliveryId}:subject`),
        bodyEncrypted: encryptSensitiveString(parsed.data.body, `email:${deliveryId}:body`),
      },
    });
    await transaction.integrationJob.create({ data: { userId: session.user.id, apartmentId: membership.apartmentId, type: "GMAIL_SEND", entityId: created.id, dedupeKey: `gmail:${created.id}` } });
    await transaction.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "google.gmail.queue", entityType: "email", entityId: created.id } });
    return created;
  });

  const job = await db.integrationJob.findUniqueOrThrow({ where: { dedupeKey: `gmail:${delivery.id}` }, select: { id: true } });
  await processIntegrationJob(job.id);
  const result = await db.emailDelivery.findUniqueOrThrow({ where: { id: delivery.id }, select: { status: true, lastErrorCode: true } });
  if (result.status !== "SENT") return { status: "error", message: `Invio non riuscito (${result.lastErrorCode ?? safeIntegrationErrorCode(null)}).` };
  profilePaths();
  return { status: "success", message: "Email inviata tramite il tuo account Gmail." };
}
