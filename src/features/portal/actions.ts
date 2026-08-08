"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMembership } from "@/server/auth/require-membership";
import { db } from "@/server/db";
import { assertCan } from "@/server/permissions";
import type { PortalMutationState } from "@/features/portal/state";
import { notificationTypesForView } from "@/features/portal/notifications";
import type { View } from "@/types";

const idSchema = z.string().cuid();
const billStatusSchema = z.enum(["DRAFT", "DUE", "SCHEDULED", "PAID", "OVERDUE", "DISPUTED"]);
const expenseStatusSchema = z.enum(["EXPECTED", "PARTIALLY_PAID", "PAID", "OVERDUE"]);
const issueStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "SCHEDULED", "RESOLVED", "CLOSED"]);
const participationSchema = z.enum(["PENDING", "ACCEPTED", "DECLINED"]);

function areaFor(role: "OWNER" | "TENANT") {
  return role === "OWNER" ? "owner" : "tenant";
}

async function notifyApartmentMembers(params: { apartmentId: string; actorId: string; type: string; title: string; body: string }) {
  const recipients = await db.apartmentMembership.findMany({ where: { apartmentId: params.apartmentId, status: "ACTIVE", userId: { not: params.actorId } }, select: { userId: true } });
  if (!recipients.length) return;
  await db.notification.createMany({ data: recipients.map(({ userId }) => ({ apartmentId: params.apartmentId, userId, type: params.type, title: params.title, body: params.body })) });
}

export async function updateBillStatus(formData: FormData) {
  const parsed = z.object({ id: idSchema, status: billStatusSchema }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "bill:update");
  const updated = await db.bill.updateMany({ where: { id: parsed.data.id, apartmentId: membership.apartmentId }, data: { status: parsed.data.status, paidAt: parsed.data.status === "PAID" ? new Date() : null } });
  if (!updated.count) return;
  await Promise.all([
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "bill.status.update", entityType: "bill", entityId: parsed.data.id, metadata: { status: parsed.data.status } } }),
    notifyApartmentMembers({ apartmentId: membership.apartmentId, actorId: session.user.id, type: "bill", title: "Stato bolletta aggiornato", body: `Nuovo stato: ${parsed.data.status}` }),
  ]);
  revalidatePath("/owner");
  revalidatePath("/tenant");
}

export async function updateExpenseStatus(formData: FormData) {
  const parsed = z.object({ id: idSchema, status: expenseStatusSchema }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "expense:update");
  const expense = await db.expense.findFirst({ where: { id: parsed.data.id, apartmentId: membership.apartmentId }, select: { id: true, amount: true, status: true } });
  if (!expense) return;
  await db.$transaction(async (transaction) => {
    const paidAt = parsed.data.status === "PAID" ? new Date() : null;
    await transaction.expense.update({ where: { id: expense.id }, data: { status: parsed.data.status, paidAt } });
    if (parsed.data.status === "PAID" && expense.status !== "PAID" && paidAt) {
      await transaction.paymentRecord.create({ data: { expenseId: expense.id, amount: expense.amount, paidAt, note: "Pagamento registrato dal cambio di stato" } });
    }
    await transaction.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "expense.status.update", entityType: "expense", entityId: parsed.data.id, metadata: { status: parsed.data.status } } });
  });
  revalidatePath("/owner");
  revalidatePath("/tenant");
}

export async function updateIssueStatus(formData: FormData) {
  const parsed = z.object({ id: idSchema, status: issueStatusSchema }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "issue:update");
  const updated = await db.issue.updateMany({ where: { id: parsed.data.id, apartmentId: membership.apartmentId }, data: { status: parsed.data.status } });
  if (!updated.count) return;
  await Promise.all([
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "issue.status.update", entityType: "issue", entityId: parsed.data.id, metadata: { status: parsed.data.status } } }),
    notifyApartmentMembers({ apartmentId: membership.apartmentId, actorId: session.user.id, type: "issue", title: "Segnalazione aggiornata", body: `Nuovo stato: ${parsed.data.status}` }),
  ]);
  revalidatePath("/owner/segnalazioni");
  revalidatePath("/tenant/segnalazioni");
}

export async function addIssueComment(_previous: PortalMutationState, formData: FormData): Promise<PortalMutationState> {
  const parsed = z.object({ id: idSchema, body: z.string().trim().min(1, "Scrivi un commento").max(2000) }).safeParse({ id: formData.get("id"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Commento non valido" };
  const { session, membership } = await requireMembership();
  assertCan(membership.role, "issue:comment");
  const issue = await db.issue.findFirst({ where: { id: parsed.data.id, apartmentId: membership.apartmentId, ...(membership.role === "TENANT" ? { createdById: session.user.id } : {}) }, select: { id: true, title: true } });
  if (!issue) return { status: "error", message: "Segnalazione non disponibile" };
  await db.$transaction([
    db.issueComment.create({ data: { issueId: issue.id, authorId: session.user.id, body: parsed.data.body } }),
    db.issue.update({ where: { id: issue.id }, data: { updatedAt: new Date() } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "issue.comment.create", entityType: "issue", entityId: issue.id } }),
  ]);
  await notifyApartmentMembers({ apartmentId: membership.apartmentId, actorId: session.user.id, type: "issue", title: "Nuovo commento", body: issue.title });
  revalidatePath("/owner/segnalazioni");
  revalidatePath("/tenant/segnalazioni");
  return { status: "success", message: "Commento aggiunto" };
}

export async function respondToEvent(formData: FormData) {
  const parsed = z.object({ id: idSchema, status: participationSchema }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership();
  assertCan(membership.role, "event:respond");
  const event = await db.calendarEvent.findFirst({ where: { id: parsed.data.id, apartmentId: membership.apartmentId }, select: { id: true, title: true } });
  if (!event) return;
  await db.eventParticipant.upsert({ where: { eventId_userId: { eventId: event.id, userId: session.user.id } }, create: { eventId: event.id, userId: session.user.id, status: parsed.data.status }, update: { status: parsed.data.status } });
  await notifyApartmentMembers({ apartmentId: membership.apartmentId, actorId: session.user.id, type: "event", title: "Risposta a un evento", body: `${event.title}: ${parsed.data.status}` });
  revalidatePath("/owner/calendario");
  revalidatePath("/tenant/calendario");
}

export async function sendMessage(_previous: PortalMutationState, formData: FormData): Promise<PortalMutationState> {
  const parsed = z.object({ body: z.string().trim().min(1, "Scrivi un messaggio").max(4000), threadId: z.union([idSchema, z.literal("")]) }).safeParse({ body: formData.get("body"), threadId: formData.get("threadId") ?? "" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Messaggio non valido" };
  const { session, membership } = await requireMembership();
  assertCan(membership.role, "message:create");
  let thread = parsed.data.threadId ? await db.messageThread.findFirst({ where: { id: parsed.data.threadId, apartmentId: membership.apartmentId, participants: { some: { userId: session.user.id } } }, select: { id: true } }) : await db.messageThread.findFirst({ where: { apartmentId: membership.apartmentId, participants: { some: { userId: session.user.id } } }, orderBy: { updatedAt: "desc" }, select: { id: true } });
  if (parsed.data.threadId && !thread) return { status: "error", message: "Conversazione non disponibile" };
  if (!thread) {
    const members = await db.apartmentMembership.findMany({ where: { apartmentId: membership.apartmentId, status: "ACTIVE" }, select: { userId: true } });
    thread = await db.messageThread.create({ data: { apartmentId: membership.apartmentId, title: "Conversazione della casa", participants: { create: members.map(({ userId }) => ({ userId, ...(userId === session.user.id ? { readAt: new Date() } : {}) })) } }, select: { id: true } });
  }
  const message = await db.$transaction(async (transaction) => {
    const created = await transaction.message.create({ data: { threadId: thread.id, authorId: session.user.id, body: parsed.data.body } });
    await transaction.messageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });
    await transaction.threadParticipant.updateMany({ where: { threadId: thread.id, userId: session.user.id }, data: { readAt: new Date() } });
    await transaction.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "message.create", entityType: "message", entityId: created.id } });
    return created;
  });
  await notifyApartmentMembers({ apartmentId: membership.apartmentId, actorId: session.user.id, type: "message", title: `Nuovo messaggio da ${session.user.name}`, body: parsed.data.body.slice(0, 140) });
  revalidatePath("/owner/messaggi");
  revalidatePath("/tenant/messaggi");
  return { status: "success", message: `Messaggio inviato (${message.id.slice(-6)})` };
}

export async function markAllNotificationsRead() {
  const { session, membership } = await requireMembership();
  assertCan(membership.role, "notification:update");
  await db.notification.updateMany({ where: { apartmentId: membership.apartmentId, userId: session.user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath(`/${areaFor(membership.role)}`);
}

export async function markNotificationsForViewRead(view: View) {
  const parsed = z.enum(["bills", "expenses", "issues", "messages", "calendar", "documents"]).safeParse(view);
  if (!parsed.success) return { updated: 0 };

  const { session, membership } = await requireMembership();
  assertCan(membership.role, "notification:update");
  const types = notificationTypesForView(parsed.data);

  const [notifications] = await db.$transaction([
    db.notification.updateMany({
      where: { apartmentId: membership.apartmentId, userId: session.user.id, type: { in: types }, readAt: null },
      data: { readAt: new Date() },
    }),
    ...(parsed.data === "messages"
      ? [db.threadParticipant.updateMany({
          where: { userId: session.user.id, thread: { apartmentId: membership.apartmentId } },
          data: { readAt: new Date() },
        })]
      : []),
  ]);

  if (notifications.count > 0) {
    revalidatePath(`/${areaFor(membership.role)}`, "layout");
  }
  return { updated: notifications.count };
}

export async function updateApartment(formData: FormData) {
  const parsed = z.object({ name: z.string().trim().min(2).max(120), address: z.string().trim().min(3).max(180), city: z.string().trim().min(2).max(100) }).safeParse({ name: formData.get("name"), address: formData.get("address"), city: formData.get("city") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "apartment:update");
  await db.$transaction([
    db.apartment.update({ where: { id: membership.apartmentId }, data: { name: parsed.data.name, addressLine: parsed.data.address, city: parsed.data.city } }),
    db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "apartment.update", entityType: "apartment", entityId: membership.apartmentId } }),
  ]);
  revalidatePath("/owner");
}

export async function updateMembershipStatus(formData: FormData) {
  const parsed = z.object({ id: idSchema, status: z.enum(["ACTIVE", "SUSPENDED"]) }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "membership:update");
  const updated = await db.apartmentMembership.updateMany({ where: { id: parsed.data.id, apartmentId: membership.apartmentId, role: "TENANT", userId: { not: session.user.id } }, data: { status: parsed.data.status } });
  if (!updated.count) return;
  await db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "membership.status.update", entityType: "membership", entityId: parsed.data.id, metadata: { status: parsed.data.status } } });
  revalidatePath("/owner/profilo");
}
