import "server-only";

import { cookies } from "next/headers";
import { db } from "@/server/db";

export const ACTIVE_APARTMENT_COOKIE = "casahub_active_apartment";

export async function listActiveMemberships(userId: string) {
  return db.apartmentMembership.findMany({
    where: { userId, status: "ACTIVE" },
    include: { apartment: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function resolveActiveMembership(userId: string) {
  const memberships = await listActiveMemberships(userId);
  const selectedApartmentId = (await cookies()).get(ACTIVE_APARTMENT_COOKIE)?.value;
  const selected = selectedApartmentId
    ? memberships.find((membership) => membership.apartmentId === selectedApartmentId)
    : undefined;

  return {
    membership: selected ?? (memberships.length === 1 ? memberships[0] : null),
    memberships,
    hasInvalidSelection: Boolean(selectedApartmentId && !selected),
  };
}

export async function setActiveApartmentCookie(apartmentId: string) {
  (await cookies()).set(ACTIVE_APARTMENT_COOKIE, apartmentId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
