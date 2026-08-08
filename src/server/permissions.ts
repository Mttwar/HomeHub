import type { MembershipRole } from "@/generated/prisma/enums";

export type PortalAction =
  | "apartment:update"
  | "membership:update"
  | "bill:create"
  | "bill:update"
  | "expense:create"
  | "expense:update"
  | "rent:create"
  | "issue:create"
  | "issue:update"
  | "issue:comment"
  | "event:create"
  | "event:respond"
  | "document:create"
  | "message:create"
  | "notification:update";

const grants: Record<MembershipRole, ReadonlySet<PortalAction>> = {
  OWNER: new Set([
    "apartment:update",
    "membership:update",
    "bill:create",
    "bill:update",
    "expense:create",
    "expense:update",
    "rent:create",
    "issue:create",
    "issue:update",
    "issue:comment",
    "event:create",
    "event:respond",
    "document:create",
    "message:create",
    "notification:update",
  ]),
  TENANT: new Set(["issue:create", "issue:comment", "event:respond", "message:create", "notification:update"]),
};

export function can(role: MembershipRole, action: PortalAction) {
  return grants[role].has(action);
}

export function assertCan(role: MembershipRole, action: PortalAction) {
  if (!can(role, action)) {
    throw new Error("Operazione non autorizzata");
  }
}
