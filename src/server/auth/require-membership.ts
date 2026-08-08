import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/enums";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db";

export async function requireMembership(expectedRole?: MembershipRole) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const membership = await db.apartmentMembership.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { apartment: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    redirect("/accesso-negato");
  }

  if (expectedRole && membership.role !== expectedRole) {
    const destination = membership.role === "OWNER" ? "owner" : "tenant";
    redirect(`/${destination}/dashboard`);
  }

  return { session, membership };
}
