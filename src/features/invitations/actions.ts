"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppUrl } from "@/server/app-url";
import { setActiveApartmentCookie } from "@/server/auth/active-apartment";
import { requireMembership } from "@/server/auth/require-membership";
import { requireSession } from "@/server/auth/require-session";
import { db } from "@/server/db";
import { sendTransactionalEmail } from "@/server/email/resend";
import { invitationEmail } from "@/server/email/templates";
import { createInvitationToken, hashInvitationToken, maskEmail, normalizeEmail } from "@/features/invitations/tokens";
import { assertCan } from "@/server/permissions";

export type InvitationState = {
  status: "idle" | "success" | "error";
  message?: string;
  inviteUrl?: string;
};

const initialState: InvitationState = { status: "idle" };

export async function createInvitation(_previous: InvitationState = initialState, formData: FormData): Promise<InvitationState> {
  void _previous;
  const parsed = z.object({ email: z.email("Inserisci un’email valida").transform(normalizeEmail) }).safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Email non valida" };

  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "membership:update");
  if (normalizeEmail(session.user.email) === parsed.data.email) return { status: "error", message: "Sei già proprietario di questo appartamento." };

  const existingMember = await db.apartmentMembership.findFirst({
    where: { apartmentId: membership.apartmentId, user: { email: parsed.data.email }, status: { in: ["ACTIVE", "SUSPENDED"] } },
    select: { id: true },
  });
  if (existingMember) return { status: "error", message: "Questa persona è già associata all’appartamento." };

  const { token, tokenHash } = createInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invitation = await db.$transaction(async (transaction) => {
    await transaction.invitation.updateMany({
      where: { apartmentId: membership.apartmentId, email: parsed.data.email, status: "PENDING" },
      data: { status: "REVOKED" },
    });
    const created = await transaction.invitation.create({
      data: { apartmentId: membership.apartmentId, email: parsed.data.email, role: "TENANT", tokenHash, expiresAt, invitedById: session.user.id },
    });
    await transaction.auditEvent.create({
      data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "invitation.create", entityType: "invitation", entityId: created.id },
    });
    return created;
  });

  const inviteUrl = `${getAppUrl()}/inviti/${token}`;
  let emailSent = false;
  try {
    const template = invitationEmail({ inviterName: session.user.name, apartmentName: membership.apartment.name, url: inviteUrl });
    emailSent = (await sendTransactionalEmail({ to: parsed.data.email, subject: `${session.user.name} ti invita su CasaHub`, ...template, idempotencyKey: `invitation-${invitation.id}` })).sent;
  } catch {
    emailSent = false;
  }

  revalidatePath("/owner/profilo");
  return { status: "success", message: emailSent ? "Invito inviato. Il link scade tra 7 giorni." : "Invito creato. Copia il link e condividilo in modo sicuro.", inviteUrl };
}

export async function revokeInvitation(formData: FormData) {
  const id = z.string().cuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const { session, membership } = await requireMembership("OWNER");
  assertCan(membership.role, "membership:update");
  const revoked = await db.invitation.updateMany({ where: { id: id.data, apartmentId: membership.apartmentId, status: "PENDING" }, data: { status: "REVOKED" } });
  if (revoked.count) {
    await db.auditEvent.create({ data: { apartmentId: membership.apartmentId, actorId: session.user.id, action: "invitation.revoke", entityType: "invitation", entityId: id.data } });
    revalidatePath("/owner/profilo");
  }
}

export async function acceptInvitation(token: string, _previous: InvitationState, _formData: FormData): Promise<InvitationState> {
  void _previous;
  void _formData;
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return { status: "error", message: "Invito non valido." };
  const session = await requireSession(`/inviti/${token}`);
  const tokenHash = hashInvitationToken(token);
  const invitation = await db.invitation.findUnique({ where: { tokenHash }, include: { apartment: true } });
  if (!invitation || invitation.status !== "PENDING") return { status: "error", message: "Questo invito non è più disponibile." };
  if (invitation.expiresAt <= new Date()) {
    await db.invitation.updateMany({ where: { id: invitation.id, status: "PENDING" }, data: { status: "EXPIRED" } });
    return { status: "error", message: "Questo invito è scaduto. Chiedine uno nuovo al proprietario." };
  }
  if (normalizeEmail(session.user.email) !== normalizeEmail(invitation.email)) {
    return { status: "error", message: `Accedi con l’indirizzo invitato (${maskEmail(invitation.email)}).` };
  }
  try {
    await db.$transaction(async (transaction) => {
      const claimed = await transaction.invitation.updateMany({
        where: { id: invitation.id, status: "PENDING", expiresAt: { gt: new Date() } },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });
      if (!claimed.count) throw new Error("Invito già utilizzato");
      const membership = await transaction.apartmentMembership.upsert({
        where: { apartmentId_userId: { apartmentId: invitation.apartmentId, userId: session.user.id } },
        update: { role: invitation.role, status: "ACTIVE" },
        create: { apartmentId: invitation.apartmentId, userId: session.user.id, role: invitation.role, status: "ACTIVE" },
      });
      await transaction.auditEvent.create({
        data: { apartmentId: invitation.apartmentId, actorId: session.user.id, action: "invitation.accept", entityType: "membership", entityId: membership.id },
      });
    });
  } catch {
    return { status: "error", message: "Non è stato possibile accettare l’invito. Potrebbe essere già stato utilizzato." };
  }

  await setActiveApartmentCookie(invitation.apartmentId);
  redirect(invitation.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard");
}
