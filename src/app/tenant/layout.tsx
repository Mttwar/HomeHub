import type { ReactNode } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";

export default function TenantLayout({ children }: { children: ReactNode }) {
  return <PortalLayout expectedRole="TENANT">{children}</PortalLayout>;
}
