"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTransition, RouteProgress } from "@/components/motion/PageTransition";
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

const NotificationPanel = dynamic(
  () => import("@/components/overlays/NotificationPanel").then((module) => module.NotificationPanel),
  { ssr: false },
);

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
  const [notificationsMounted, setNotificationsMounted] = useState(false);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPathname = useRef(pathname);
  const updateVersion = useRef<string | null>(null);
  const activeView = resolveActiveView(pathname);
  const displayedActiveView = pendingView ?? activeView;
  const activeNotificationTypes = notificationTypesForView(activeView);
  const visibleNotifications = data.notifications.filter((notification) => !activeNotificationTypes.includes(notification.type));
  const visibleUnreadNotifications = Math.max(0, data.unreadNotifications - (data.notifications.length - visibleNotifications.length));
  const visibleUnreadMessages = activeView === "messages" ? 0 : data.unreadMessages;

  usePollingQuery<{ version: string }>({
    url: "/api/portal/updates",
    intervalMs: 15000,
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
    if (!activeNotificationTypes.length) return;
    void markNotificationsForViewRead(activeView);
  }, [activeView, activeNotificationTypes.length, router]);

  useEffect(() => {
    const paths = Object.entries(viewPaths)
      .filter(([view]) => view !== "messages" || data.hasChat)
      .map(([, path]) => `/${session.role}/${path}`);
    let index = 0;
    let timer: number | undefined;
    let cancelled = false;

    const warmNextRoute = () => {
      if (cancelled || index >= paths.length) return;
      const nextPath = paths[index];
      if (!nextPath) return;
      router.prefetch(nextPath);
      index += 1;
      timer = window.setTimeout(warmNextRoute, 300);
    };

    timer = window.setTimeout(warmNextRoute, 450);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [data.hasChat, router, session.role]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setPendingView(null);
    setIsNavigating(false);
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

      router.replace(`${targetPath}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [pathname, query, router, searchParams, session.role]);

  const navigate = (view: View) => {
    const target = `/${session.role}/${viewPaths[view]}`;
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    if (target === pathname) return;

    setPendingView(view);
    setIsNavigating(true);
    setQuery("");
    router.push(target);
  };

  const prefetch = (view: View) => {
    router.prefetch(`/${session.role}/${viewPaths[view]}`);
  };

  const toggleNotifications = () => {
    setNotificationsMounted(true);
    setNotificationsOpen((open) => !open);
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
      <div className="app-shell min-h-screen lg:flex">
        <Sidebar active={displayedActiveView} session={session} openIssues={data.openIssues} unreadMessages={visibleUnreadMessages} hasChat={data.hasChat} apartmentLabel={data.apartmentLabel} apartmentCity={data.apartmentCity} open={mobileMenuOpen} onNavigate={navigate} onPrefetch={prefetch} onClose={() => setMobileMenuOpen(false)} onSignOut={signOut} />
        <div className="min-w-0 flex-1">
          <TopBar query={query} apartmentLabel={data.apartmentLabel} unreadNotifications={visibleUnreadNotifications} onSearch={search} onOpenMenu={() => setMobileMenuOpen(true)} onToggleNotifications={toggleNotifications} />
          <main className="mx-auto max-w-[1480px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-3">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <MobileNav active={displayedActiveView} openIssues={data.openIssues} unreadMessages={visibleUnreadMessages} hasChat={data.hasChat} onNavigate={navigate} onPrefetch={prefetch} />
      </div>
      {notificationsMounted ? <NotificationPanel open={notificationsOpen} notifications={visibleNotifications} unread={visibleUnreadNotifications} onClose={() => setNotificationsOpen(false)} onOpenNotification={openNotification} /> : null}
    </>
  );
}
