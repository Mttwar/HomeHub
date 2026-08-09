import "server-only";

import { redirect } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/enums";
import { resolveActiveMembership } from "@/server/auth/active-apartment";
import { requireSession } from "@/server/auth/require-session";

export async function requireMembership(expectedRole?: MembershipRole) {
  const session = await requireSession();
  const { membership, memberships } = await resolveActiveMembership(session.user.id);

  if (!memberships.length) {
    redirect("/onboarding");
  }

  if (!membership) {
    redirect("/appartamenti");
  }

  if (expectedRole && membership.role !== expectedRole) {
    const destination = membership.role === "OWNER" ? "owner" : "tenant";
    redirect(`/${destination}/dashboard`);
  }

  return { session, membership };
}
