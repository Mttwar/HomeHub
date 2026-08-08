import type { ReactNode } from "react";
import type { MembershipRole } from "@/generated/prisma/enums";
import { requireMembership } from "@/server/auth/require-membership";
import { getPortalShellData } from "@/server/dal/portal";
import { PortalShell } from "@/components/shell/PortalShell";
import type { Session } from "@/types";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export async function PortalLayout({ children, expectedRole }: { children: ReactNode; expectedRole: MembershipRole }) {
  const { session, membership } = await requireMembership(expectedRole);
  const shellData = await getPortalShellData({ session, membership });
  const portalSession: Session = {
    name: session.user.name,
    email: session.user.email,
    initials: initials(session.user.name),
    role: membership.role === "OWNER" ? "owner" : "tenant",
  };

  return <PortalShell session={portalSession} data={shellData}>{children}</PortalShell>;
}
