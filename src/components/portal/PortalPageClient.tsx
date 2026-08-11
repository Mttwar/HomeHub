"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import type { ModalKind, Role, View } from "@/types";
import type { BillListItem, DashboardData, DocumentListItem, EventListItem, ExpenseListItem, ExpenseSummary, GlobalSearchResult, IssueListItem, MessagesViewData, RentScheduleListItem } from "@/features/portal/types";

const loadBillsPage = () => import("@/components/portal/pages/BillsPage").then((module) => module.BillsPage);
const loadCalendarPage = () => import("@/components/portal/pages/CalendarPage").then((module) => module.CalendarPage);
const loadDashboardPage = () => import("@/components/portal/pages/DashboardPage").then((module) => module.DashboardPage);
const loadDocumentsPage = () => import("@/components/portal/pages/DocumentsPage").then((module) => module.DocumentsPage);
const loadExpensesPage = () => import("@/components/portal/pages/ExpensesPage").then((module) => module.ExpensesPage);
const loadIssuesPage = () => import("@/components/portal/pages/IssuesPage").then((module) => module.IssuesPage);
const loadMessagesPage = () => import("@/components/portal/pages/MessagesPage").then((module) => module.MessagesPage);
const loadSearchResultsPage = () => import("@/components/portal/pages/SearchResultsPage").then((module) => module.SearchResultsPage);

const BillsPage = dynamic(loadBillsPage);
const CalendarPage = dynamic(loadCalendarPage);
const DashboardPage = dynamic(loadDashboardPage);
const DocumentsPage = dynamic(loadDocumentsPage);
const ExpensesPage = dynamic(loadExpensesPage);
const IssuesPage = dynamic(loadIssuesPage);
const MessagesPage = dynamic(loadMessagesPage);
const SearchResultsPage = dynamic(loadSearchResultsPage);
const ActionModal = dynamic(
  () => import("@/components/overlays/ActionModal").then((module) => module.ActionModal),
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

type PortalPageClientProps = {
  view: View;
  role: Role;
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

export function PortalPageClient({ view, role, bills, expenses, issues, events, documents, messages, dashboard, searchResults, searchQuery = "" }: PortalPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState("");
  const [livePower, setLivePower] = useState(1.34);
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const preloadPages = () => {
      void Promise.all([
        loadBillsPage(),
        loadCalendarPage(),
        loadDashboardPage(),
        loadDocumentsPage(),
        loadExpensesPage(),
        loadIssuesPage(),
        loadMessagesPage(),
        loadSearchResultsPage(),
      ]);
    };

    const timer = window.setTimeout(preloadPages, 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (view !== "dashboard") return;
    const timer = window.setInterval(() => setLivePower((value) => Math.max(0.78, Math.min(2.12, value + (Math.random() - 0.5) * 0.16))), 3200);
    return () => window.clearInterval(timer);
  }, [view]);

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
    case "settings": page = null; break;
    case "search": page = <SearchResultsPage query={searchQuery} results={searchResults ?? []} />; break;
    default: page = <DashboardPage role={role} livePower={livePower} data={dashboard} onNavigate={navigate} onOpenModal={setModal} />;
  }

  return (
    <>
      {page}
      {modal ? <ActionModal key={modal} kind={modal} onClose={() => setModal(null)} onSaved={setToast} /> : null}
      {toast && <div className="portal-toast fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-2xl lg:bottom-6"><span className="portal-toast-icon grid size-5 place-items-center rounded-full bg-lime text-ink"><Check className="size-3" /></span>{toast}</div>}
    </>
  );
}
