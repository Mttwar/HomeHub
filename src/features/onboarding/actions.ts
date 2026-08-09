"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { setActiveApartmentCookie } from "@/server/auth/active-apartment";
import { requireSession } from "@/server/auth/require-session";
import { emailVerificationRequired } from "@/server/auth/policy";
import { db } from "@/server/db";

export type OnboardingState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const apartmentSchema = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(2, "Inserisci un nome").max(120),
  address: z.string().trim().min(3, "Inserisci l’indirizzo").max(180),
  city: z.string().trim().min(2, "Inserisci la città").max(100),
  postalCode: z.string().trim().max(20).optional(),
});

export async function createApartment(_previous: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const parsed = apartmentSchema.safeParse({
    requestId: formData.get("requestId"),
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Controlla i dati dell’appartamento", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const session = await requireSession("/onboarding");
  if (emailVerificationRequired && !session.user.emailVerified) {
    return { status: "error", message: "Verifica l’indirizzo email prima di creare un appartamento." };
  }

  let apartmentId: string;
  try {
    apartmentId = await db.$transaction(async (transaction) => {
      const replay = await transaction.apartment.findUnique({ where: { creationKey: parsed.data.requestId } });
      if (replay) {
        const membership = await transaction.apartmentMembership.findUnique({
          where: { apartmentId_userId: { apartmentId: replay.id, userId: session.user.id } },
        });
        if (!membership) throw new Error("Chiave di creazione già utilizzata");
        return replay.id;
      }

      const apartment = await transaction.apartment.create({
        data: {
          creationKey: parsed.data.requestId,
          name: parsed.data.name,
          addressLine: parsed.data.address,
          city: parsed.data.city,
          postalCode: parsed.data.postalCode || null,
        },
      });
      await transaction.apartmentMembership.create({
        data: { apartmentId: apartment.id, userId: session.user.id, role: "OWNER", status: "ACTIVE" },
      });
      await transaction.auditEvent.create({
        data: { apartmentId: apartment.id, actorId: session.user.id, action: "apartment.create", entityType: "apartment", entityId: apartment.id },
      });
      return apartment.id;
    });
  } catch {
    return { status: "error", message: "Creazione non riuscita. Riprova tra poco." };
  }

  await setActiveApartmentCookie(apartmentId);
  redirect("/owner/dashboard");
}

export async function selectApartment(formData: FormData) {
  const apartmentId = z.string().cuid().safeParse(formData.get("apartmentId"));
  if (!apartmentId.success) return;
  const session = await requireSession("/appartamenti");
  const membership = await db.apartmentMembership.findUnique({
    where: { apartmentId_userId: { apartmentId: apartmentId.data, userId: session.user.id } },
    select: { role: true, status: true },
  });
  if (!membership || membership.status !== "ACTIVE") return;
  await setActiveApartmentCookie(apartmentId.data);
  redirect(membership.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard");
}
