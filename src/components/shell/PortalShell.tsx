"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTransition, RouteProgress } from "@/components/motion/PageTransition";
import { NotificationPanel } from "@/components/overlays/NotificationPanel";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { authClient } from "@/lib/auth-client";
import type { Session, View } from "@/types";
import type { PortalShellData } from "@/features/portal/types";
import type { NotificationListItem } from "@/features/portal/types";
import { markNotificationsForViewRead } from "@/features/portal/actions";
import { notificationTypesForView, viewForNotificationType } from "@/features/portal/notifications";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const viewPaths: Record<View, string> = {
  dashboard: "dashboard",
  bills: "bollette",
  expenses: "spese",
  issues: "segnalazioni",
  messages: "messaggi",
  calendar: "calendario",
  documents: "documenti",
  settings: "profilo",
  search: "ricerca",
};

function resolveActiveView(pathname: string): View {
  const segment = pathname.split("/").filter(Boolean).at(-1);
  return (Object.entries(viewPaths).find(([, path]) => path === segment)?.[0] as View | undefined) ?? "dashboard";
}

export function PortalShell({ children, session, data }: { children: ReactNode; session: Session; data: PortalShellData }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isNavigating, startNavigation] = useTransition();
  const previousPathname = useRef(pathname);
  const updateVersion = useRef<string | null>(null);
  const activeView = resolveActiveView(pathname);
  const activeNotificationTypes = notificationTypesForView(activeView);
  const visibleNotifications = data.notifications.filter((notification) => !activeNotificationTypes.includes(notification.type));
  const visibleUnreadNotifications = Math.max(0, data.unreadNotifications - (data.notifications.length - visibleNotifications.length));
  const visibleUnreadMessages = activeView === "messages" ? 0 : data.unreadMessages;

  usePollingQuery<{ version: string }>({
    url: "/api/portal/updates",
    intervalMs: 2000,
    onData: ({ version }) => {
      if (updateVersion.current === null) {
        updateVersion.current = version;
        return;
      }
      if (version === updateVersion.current) return;
      updateVersion.current = version;
      router.refresh();
    },
    onAccessDenied: () => router.refresh(),
  });

  useEffect(() => {
    Object.values(viewPaths).forEach((path) => router.prefetch(`/${session.role}/${path}`));
  }, [router, session.role]);

  useEffect(() => {
    if (!activeNotificationTypes.length) return;

    void markNotificationsForViewRead(activeView).then(({ updated }) => {
      if (updated > 0) router.refresh();
    });
  }, [activeView, activeNotificationTypes.length, router]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setQuery(searchParams.get("q") ?? "");
    setNotificationsOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";
    if (query.trim() === currentQuery) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      const targetPath = query.trim() ? `/${session.role}/ricerca` : pathname;

      startNavigation(() => {
        router.replace(`${targetPath}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
      });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [pathname, query, router, searchParams, session.role]);

  const navigate = (view: View) => {
    const target = `/${session.role}/${viewPaths[view]}`;
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    if (target === pathname) return;

    setQuery("");
    startNavigation(() => router.push(target));
  };

  const search = (value: string) => setQuery(value);

  const openNotification = (notification: NotificationListItem) => {
    const targetView = viewForNotificationType(notification.type);
    if (targetView) navigate(targetView);
  };

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <RouteProgress active={isNavigating} />
      <div className="min-h-screen bg-[#f5f6fa] lg:flex">
        <Sidebar active={activeView} session={session} openIssues={data.openIssues} unreadMessages={visibleUnreadMessages} apartmentLabel={data.apartmentLabel} apartmentCity={data.apartmentCity} open={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} onSignOut={signOut} />
        <div className="min-w-0 flex-1">
          <TopBar query={query} apartmentLabel={data.apartmentLabel} unreadNotifications={visibleUnreadNotifications} onSearch={search} onOpenMenu={() => setMobileMenuOpen(true)} onToggleNotifications={() => setNotificationsOpen((open) => !open)} />
          <main className="mx-auto max-w-[1480px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-3">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <MobileNav active={activeView} openIssues={data.openIssues} unreadMessages={visibleUnreadMessages} onNavigate={navigate} />
      </div>
      <NotificationPanel open={notificationsOpen} notifications={visibleNotifications} unread={visibleUnreadNotifications} onClose={() => setNotificationsOpen(false)} onOpenNotification={openNotification} />
    </>
  );
}
