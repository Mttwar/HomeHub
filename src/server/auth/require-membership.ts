import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { MembershipRole } from "@/generated/prisma/enums";
import { resolveActiveMembership } from "@/server/auth/active-apartment";
import { requireSession } from "@/server/auth/require-session";

const getMembershipContext = cache(async () => {
  const session = await requireSession();
  const { membership, memberships } = await resolveActiveMembership(session.user.id);

  return { session, membership, memberships };
});

export async function requireMembership(expectedRole?: MembershipRole) {
  const { session, membership, memberships } = await getMembershipContext();

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
