"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionModal } from "@/components/overlays/ActionModal";
import { BillsPage } from "@/components/portal/pages/BillsPage";
import { CalendarPage } from "@/components/portal/pages/CalendarPage";
import { DashboardPage } from "@/components/portal/pages/DashboardPage";
import { DocumentsPage } from "@/components/portal/pages/DocumentsPage";
import { ExpensesPage } from "@/components/portal/pages/ExpensesPage";
import { IssuesPage } from "@/components/portal/pages/IssuesPage";
import { MessagesPage } from "@/components/portal/pages/MessagesPage";
import { SettingsPage } from "@/components/portal/pages/SettingsPage";
import { SearchResultsPage } from "@/components/portal/pages/SearchResultsPage";
import type { ModalKind, Role, Session, View } from "@/types";
import type { BillListItem, DashboardData, DocumentListItem, EventListItem, ExpenseListItem, ExpenseSummary, GlobalSearchResult, IssueListItem, MessagesViewData, RentScheduleListItem } from "@/features/portal/types";

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

type PortalPageClientProps = {
  view: View;
  role: Role;
  session?: Session | undefined;
  bills?: BillListItem[] | undefined;
  expenses?: { records: ExpenseListItem[]; summary: ExpenseSummary; rentSchedules: RentScheduleListItem[] } | undefined;
  issues?: IssueListItem[] | undefined;
  events?: EventListItem[] | undefined;
  documents?: DocumentListItem[] | undefined;
  messages?: MessagesViewData | undefined;
  dashboard?: DashboardData | undefined;
  searchResults?: GlobalSearchResult[] | undefined;
  searchQuery?: string | undefined;
};

export function PortalPageClient({ view, role, session, bills, expenses, issues, events, documents, messages, dashboard, searchResults, searchQuery = "" }: PortalPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState("");
  const [livePower, setLivePower] = useState(1.34);
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const timer = window.setInterval(() => setLivePower((value) => Math.max(0.78, Math.min(2.12, value + (Math.random() - 0.5) * 0.16))), 3200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (nextView: View) => router.push(`/${role}/${viewPaths[nextView]}`);
  let page;

  switch (view) {
    case "bills": page = <BillsPage query={query} role={role} records={bills} onOpenModal={setModal} />; break;
    case "expenses": page = <ExpensesPage role={role} query={query} records={expenses?.records} summary={expenses?.summary} rentSchedules={expenses?.rentSchedules} onOpenModal={setModal} />; break;
    case "issues": page = <IssuesPage query={query} role={role} records={issues} onOpenModal={setModal} />; break;
    case "messages": page = <MessagesPage data={messages} query={query} />; break;
    case "calendar": page = <CalendarPage role={role} query={query} records={events} onOpenModal={setModal} />; break;
    case "documents": page = <DocumentsPage role={role} query={query} records={documents} onOpenModal={setModal} />; break;
    case "settings": page = session ? <SettingsPage session={session} /> : null; break;
    case "search": page = <SearchResultsPage query={searchQuery} results={searchResults ?? []} />; break;
    default: page = <DashboardPage role={role} livePower={livePower} data={dashboard} onNavigate={navigate} onOpenModal={setModal} />;
  }

  return (
    <>
      {page}
      <ActionModal key={modal ?? "closed"} kind={modal} onClose={() => setModal(null)} onSaved={setToast} />
      {toast && <div className="portal-toast fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-2xl lg:bottom-6"><span className="portal-toast-icon grid size-5 place-items-center rounded-full bg-lime text-ink"><Check className="size-3" /></span>{toast}</div>}
    </>
  );
}
