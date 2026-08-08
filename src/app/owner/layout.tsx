import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <PortalLayout expectedRole="OWNER">{children}</PortalLayout>;
}
