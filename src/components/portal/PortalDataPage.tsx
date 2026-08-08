import type { MembershipRole } from "@/generated/prisma/enums";
import { PortalPageClient } from "@/components/portal/PortalPageClient";
import { getDashboard, getMessages, globalSearch, listBills, listDocuments, listEvents, listExpenses, listIssues } from "@/server/dal/portal";
import type { Role, View } from "@/types";

export async function PortalDataPage({ view, role, expectedRole, query = "" }: { view: View; role: Role; expectedRole: MembershipRole; query?: string | undefined }) {
  const bills = view === "bills" ? await listBills(expectedRole) : undefined;
  const expenses = view === "expenses" ? await listExpenses(expectedRole) : undefined;
  const issues = view === "issues" ? await listIssues(expectedRole) : undefined;
  const events = view === "calendar" ? await listEvents(expectedRole) : undefined;
  const documents = view === "documents" ? await listDocuments(expectedRole) : undefined;
  const messages = view === "messages" ? await getMessages(expectedRole) : undefined;
  const dashboard = view === "dashboard" ? await getDashboard(expectedRole) : undefined;
  const searchResults = view === "search" ? await globalSearch(expectedRole, query) : undefined;
  return <PortalPageClient view={view} role={role} bills={bills} expenses={expenses} issues={issues} events={events} documents={documents} messages={messages} dashboard={dashboard} searchResults={searchResults} searchQuery={query} />;
}
