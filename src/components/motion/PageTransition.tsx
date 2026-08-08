"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="portal-page-transition">
      {children}
    </div>
  );
}

export function RouteProgress({ active }: { active: boolean }) {
  return (
    <div className={`portal-route-progress ${active ? "is-active" : ""}`} aria-hidden="true">
      {active && <span />}
    </div>
  );
}
