export type BillListItem = {
  id: string;
  supplier: string;
  category: string;
  amount: number;
  due: string;
  period: string;
  status: string;
  statusCode: "DRAFT" | "DUE" | "SCHEDULED" | "PAID" | "OVERDUE" | "DISPUTED";
  attachment: { id: string; originalName: string } | null;
};
export type ExpenseListItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  due: string | null;
  status: string;
  statusCode: "EXPECTED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
};
export type ExpenseSummary = {
  total: number;
  paid: number;
  outstanding: number;
  categories: Array<{ label: string; amount: number; percent: number }>;
};
export type RentScheduleListItem = { id: string; label: string; amount: number; dueDay: number; startsAt: string; endsAt: string | null };
export type IssueListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  statusCode: "OPEN" | "IN_PROGRESS" | "SCHEDULED" | "RESOLVED" | "CLOSED";
  priority: string;
  date: string;
  comments: number;
  canComment: boolean;
  recentComments: Array<{ id: string; author: string; body: string; date: string }>;
};
export type EventListItem = {
  id: string;
  day: string;
  month: string;
  title: string;
  description: string | null;
  time: string;
  startsAt: string;
  endsAt: string;
  color: string;
  participation: "PENDING" | "ACCEPTED" | "DECLINED" | null;
};
export type DocumentListItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  version: number;
  visibility: "Condiviso" | "Solo proprietario";
};
export type MessageListItem = {
  id: string;
  sender: string;
  text: string;
  time: string;
  mine: boolean;
};
export type MessagesViewData = {
  threadId: string | null;
  title: string;
  counterpartName: string;
  counterpartInitial: string;
  messages: MessageListItem[];
};
export type NotificationListItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};
export type DashboardData = {
  greetingName: string;
  apartmentName: string;
  address: string;
  outstandingAmount: number;
  paidExpenses: number;
  totalExpenses: number;
  openIssues: number;
  urgentIssues: number;
  annualExpenses: number;
  monthlyExpenses: number[];
  nextEvent: EventListItem | null;
  urgentIssue: IssueListItem | null;
  bills: BillListItem[];
  events: EventListItem[];
  recentMessages: Array<{ id: string; name: string; initial: string; text: string; time: string }>;
};
export type ProfileData = {
  apartment: { name: string; address: string; city: string };
  members: Array<{ id: string; name: string; role: "Proprietario" | "Inquilino"; status: string; initial: string }>;
  invitations: Array<{ id: string; email: string; expiresAt: string }>;
  auditEvents: Array<{ id: string; action: string; entityType: string; actor: string; date: string }>;
};
export type PortalShellData = {
  notifications: NotificationListItem[];
  unreadNotifications: number;
  openIssues: number;
  unreadMessages: number;
  apartmentLabel: string;
  apartmentCity: string;
};
export type GlobalSearchResult = {
  id: string;
  kind: "Bolletta" | "Spesa" | "Segnalazione" | "Messaggio" | "Evento" | "Documento";
  title: string;
  description: string;
  href: string;
  date: string | null;
};
