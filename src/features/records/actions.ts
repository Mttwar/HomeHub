"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createRecordSchema } from "@/features/records/schema";
import type { CreateRecordState } from "@/features/records/state";
import { requireMembership } from "@/server/auth/require-membership";
import { db } from "@/server/db";
import { assertCan, type PortalAction } from "@/server/permissions";
import { AttachmentUploadError, removePrivateAttachment, storePrivateBillAttachment, type StoredAttachment } from "@/server/storage/private-attachments";
import { enqueueCalendarEventJobs, processPendingIntegrationJobs } from "@/server/google/outbox";

const actions: Record<string, PortalAction> = {
  bill: "bill:create",
  expense: "expense:create",
  rent: "rent:create",
  issue: "issue:create",
  event: "event:create",
  document: "document:create",
};

export async function createPortalRecord(_previous: CreateRecordState, formData: FormData): Promise<CreateRecordState> {
  const rawAttachment = formData.get("attachment");
  const attachment = rawAttachment instanceof File && rawAttachment.size > 0 ? rawAttachment : null;
  const parsed = createRecordSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title"),
    category: formData.get("category"),
    date: formData.get("date") ?? "",
    endDate: formData.get("endDate") ?? "",
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
    amount: formData.get("amount") ?? "0",
    priority: formData.get("priority") ?? "MEDIUM",
    visibility: formData.get("visibility") ?? "SHARED",
  });

  if (!parsed.success) {
    return { status: "error", message: "Controlla i campi evidenziati", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { session, membership } = await requireMembership();
  const action = actions[parsed.data.kind];
  if (!action) return { status: "error", message: "Operazione non riconosciuta" };
  let uploadedAttachment: StoredAttachment | null = null;

  try {
    assertCan(membership.role, action);
    const { kind, title, category, date, endDate, location, notes, amount, priority, visibility } = parsed.data;
    const actorId = session.user.id;
    const apartmentId = membership.apartmentId;
    if (kind === "bill" && attachment) {
      uploadedAttachment = await storePrivateBillAttachment(attachment, apartmentId);
    }

    const created = await db.$transaction(async (transaction) => {
      let entity: { id: string };
      if (kind === "bill") {
        entity = await transaction.bill.create({ data: { apartmentId, supplier: title, category, amount, dueAt: new Date(date), status: "DUE" } });
      } else if (kind === "expense") {
        entity = await transaction.expense.create({ data: { apartmentId, title, category, amount, dueAt: date ? new Date(date) : null, status: "EXPECTED" } });
      } else if (kind === "rent") {
        const startsAt = new Date(date);
        entity = await transaction.rentSchedule.create({ data: { apartmentId, label: title, amount, dueDay: startsAt.getDate(), startsAt } });
      } else if (kind === "issue") {
        entity = await transaction.issue.create({ data: { apartmentId, title, category, description: notes || title, priority, createdById: actorId } });
      } else if (kind === "event") {
        const startsAt = new Date(date);
        const members = await transaction.apartmentMembership.findMany({ where: { apartmentId, status: "ACTIVE" }, select: { userId: true } });
        entity = await transaction.calendarEvent.create({ data: { apartmentId, title, description: notes || null, location: location || null, startsAt, endsAt: new Date(endDate), createdById: actorId, participants: { create: members.map(({ userId }) => ({ userId, status: userId === actorId ? "ACCEPTED" : "PENDING" })) } } });
      } else {
        entity = await transaction.document.create({ data: { apartmentId, title, category, visibility } });
      }

      if (kind === "bill" && uploadedAttachment) {
        await transaction.attachment.create({
          data: {
            apartmentId,
            uploadedById: actorId,
            storageKey: uploadedAttachment.pathname,
            originalName: uploadedAttachment.originalName,
            mimeType: uploadedAttachment.mimeType,
            sizeBytes: uploadedAttachment.sizeBytes,
            sha256: uploadedAttachment.sha256,
            status: "CLEAN",
            visibility: "SHARED",
            billId: entity.id,
          },
        });
      }

      await transaction.auditEvent.create({
        data: { apartmentId, actorId, action: `${kind}.create`, entityType: kind, entityId: entity.id },
      });
      const recipients = await transaction.apartmentMembership.findMany({ where: { apartmentId, status: "ACTIVE", userId: { not: actorId } }, select: { userId: true } });
      if (recipients.length) {
        await transaction.notification.createMany({ data: recipients.map(({ userId }) => ({ apartmentId, userId, type: kind, title: `Nuovo elemento: ${title}`, body: notes || category })) });
      }
      return entity;
    });

    const area = membership.role === "OWNER" ? "owner" : "tenant";
    if (parsed.data.kind === "event") {
      await enqueueCalendarEventJobs({ apartmentId: membership.apartmentId, eventId: created.id, type: "CALENDAR_UPSERT" });
      after(() => processPendingIntegrationJobs({ limit: 20 }));
    }
    revalidatePath(`/${area}`);
    return { status: "success", message: uploadedAttachment ? `Bolletta e allegato salvati (${created.id.slice(-6)})` : `Elemento salvato (${created.id.slice(-6)})` };
  } catch (error) {
    if (uploadedAttachment) {
      try { await removePrivateAttachment(uploadedAttachment.url); } catch { /* Il record non viene creato; lo storage sarà riconciliato dal job di manutenzione. */ }
    }
    if (error instanceof AttachmentUploadError) {
      return { status: "error", message: "Controlla l’allegato", fieldErrors: { attachment: [error.message] } };
    }
    const message = error instanceof Error && error.message === "Operazione non autorizzata" ? error.message : "Salvataggio non riuscito";
    return { status: "error", message };
  }
}
