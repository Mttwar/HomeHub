import "server-only";

import type { MembershipRole } from "@/generated/prisma/enums";
import type {
  BillListItem,
  DashboardData,
  DocumentListItem,
  EventListItem,
  ExpenseListItem,
  ExpenseSummary,
  GlobalSearchResult,
  IssueListItem,
  MessagesViewData,
  PortalShellData,
  ProfileData,
  RentScheduleListItem,
} from "@/features/portal/types";
import { directCounterpartId } from "@/features/portal/messages";
import { requireMembership } from "@/server/auth/require-membership";
import { db } from "@/server/db";
import { GOOGLE_CALENDAR_SCOPE, GOOGLE_GMAIL_SEND_SCOPE, isGoogleOAuthConfigured, parseGoogleScopes } from "@/server/google/constants";
import { isDataEncryptionConfigured } from "@/server/security/encryption";

const dateFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Rome" });
const dayFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", timeZone: "Europe/Rome" });
const monthFormatter = new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" });
const timeFormatter = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const messageTimeFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const expenseMonthFormatter = new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" });
const yearMonthFormatter = new Intl.DateTimeFormat("en", { year: "numeric", month: "2-digit", timeZone: "Europe/Rome" });

const billStatus = { DRAFT: "Bozza", DUE: "Da pagare", SCHEDULED: "Programmato", PAID: "Pagata", OVERDUE: "Scaduta", DISPUTED: "Contestata" } as const;
const expenseStatus = { EXPECTED: "Prevista", PARTIALLY_PAID: "Parzialmente pagata", PAID: "Pagata", OVERDUE: "Scaduta" } as const;
const issueStatus = { OPEN: "Aperta", IN_PROGRESS: "Presa in carico", SCHEDULED: "Intervento fissato", RESOLVED: "Risolta", CLOSED: "Risolta" } as const;
const priority = { LOW: "Bassa", MEDIUM: "Media", HIGH: "Alta", URGENT: "Urgente" } as const;

type Context = Awaited<ReturnType<typeof requireMembership>>;

function yearMonthKey(date: Date) {
  const parts = yearMonthFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function recentExpenseMonths(referenceDate: Date) {
  const [year, month] = yearMonthKey(referenceDate).split("-").map(Number);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year!, month! - 6 + index, 15, 12));
    return {
      key: yearMonthKey(date),
      label: expenseMonthFormatter.format(date).replace(".", "").toUpperCase(),
      amount: 0,
      year: date.getUTCFullYear(),
      monthIndex: date.getUTCMonth(),
    };
  });
}

function mapBill(bill: {
  id: string; supplier: string; category: string; amount: { toNumber(): number }; dueAt: Date; issuedAt: Date | null;
  status: keyof typeof billStatus; attachments: Array<{ id: string; originalName: string }>;
}): BillListItem {
  return {
    id: bill.id,
    supplier: bill.supplier,
    category: bill.category,
    amount: bill.amount.toNumber(),
    due: dateFormatter.format(bill.dueAt),
    period: bill.issuedAt ? dateFormatter.format(bill.issuedAt) : "Periodo non indicato",
    status: billStatus[bill.status],
    statusCode: bill.status,
    attachment: bill.attachments[0] ?? null,
  };
}

function mapEvent(event: {
  id: string; title: string; description: string | null; location: string | null; startsAt: Date; endsAt: Date;
  participants?: Array<{ status: "PENDING" | "ACCEPTED" | "DECLINED" }>;
}, index: number): EventListItem {
  return {
    id: event.id,
    day: dayFormatter.format(event.startsAt),
    month: monthFormatter.format(event.startsAt),
    title: event.title,
    description: event.description,
    location: event.location,
    time: `${timeFormatter.format(event.startsAt)} – ${timeFormatter.format(event.endsAt)}`,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    color: index % 2 ? "bg-violet" : "bg-lime",
    participation: event.participants?.[0]?.status ?? null,
  };
}

function mapIssue(issue: {
  id: string; title: string; description: string; category: string; status: keyof typeof issueStatus;
  priority: keyof typeof priority; createdAt: Date; createdById: string; _count: { comments: number };
  comments: Array<{ id: string; body: string; createdAt: Date; author: { name: string } }>;
}, context: Context): IssueListItem {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    status: issueStatus[issue.status],
    statusCode: issue.status,
    priority: priority[issue.priority],
    date: dateFormatter.format(issue.createdAt),
    comments: issue._count.comments,
    canComment: context.membership.role === "OWNER" || issue.createdById === context.session.user.id,
    recentComments: issue.comments.map((comment) => ({ id: comment.id, author: comment.author.name, body: comment.body, date: messageTimeFormatter.format(comment.createdAt) })),
  };
}

async function billsFor(context: Context, take = 100) {
  return db.bill.findMany({
    where: { apartmentId: context.membership.apartmentId, ...(context.membership.role === "TENANT" ? { shared: true } : {}) },
    include: { attachments: { where: { status: "CLEAN", ...(context.membership.role === "TENANT" ? { visibility: "SHARED" as const } : {}) }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true, originalName: true } } },
    orderBy: { dueAt: "desc" },
    take,
  });
}

async function issuesFor(context: Context, take = 100) {
  return db.issue.findMany({
    where: { apartmentId: context.membership.apartmentId },
    include: {
      _count: { select: { comments: true } },
      comments: { orderBy: { createdAt: "desc" }, take: 3, include: { author: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" }, take,
  });
}

async function eventsFor(context: Context, take = 100) {
  return db.calendarEvent.findMany({
    where: { apartmentId: context.membership.apartmentId, status: "ACTIVE" },
    include: { participants: { where: { userId: context.session.user.id }, select: { status: true } } },
    orderBy: { startsAt: "asc" }, take,
  });
}

export async function listBills(expectedRole: MembershipRole): Promise<BillListItem[]> {
  const context = await requireMembership(expectedRole);
  return (await billsFor(context)).map(mapBill);
}

export async function listExpenses(expectedRole: MembershipRole): Promise<{ records: ExpenseListItem[]; summary: ExpenseSummary; rentSchedules: RentScheduleListItem[] }> {
  const context = await requireMembership(expectedRole);
  const [rows, rents] = await Promise.all([
    db.expense.findMany({ where: { apartmentId: context.membership.apartmentId, ...(context.membership.role === "TENANT" ? { shared: true } : {}) }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.rentSchedule.findMany({ where: { apartmentId: context.membership.apartmentId }, orderBy: { startsAt: "desc" }, take: 20 }),
  ]);
  const records = rows.map((expense) => ({ id: expense.id, title: expense.title, category: expense.category, amount: expense.amount.toNumber(), due: expense.dueAt ? dateFormatter.format(expense.dueAt) : null, status: expenseStatus[expense.status], statusCode: expense.status }));
  const total = records.reduce((sum, expense) => sum + expense.amount, 0);
  const paid = records.filter((expense) => expense.statusCode === "PAID").reduce((sum, expense) => sum + expense.amount, 0);
  const grouped = new Map<string, number>();
  records.forEach((expense) => grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + expense.amount));
  const categories = [...grouped].sort((a, b) => b[1] - a[1]).map(([label, amount]) => ({ label, amount, percent: total ? Math.round((amount / total) * 100) : 0 }));
  return { records, summary: { total, paid, outstanding: total - paid, categories }, rentSchedules: rents.map((rent) => ({ id: rent.id, label: rent.label, amount: rent.amount.toNumber(), dueDay: rent.dueDay, startsAt: dateFormatter.format(rent.startsAt), endsAt: rent.endsAt ? dateFormatter.format(rent.endsAt) : null })) };
}

export async function listIssues(expectedRole: MembershipRole): Promise<IssueListItem[]> {
  const context = await requireMembership(expectedRole);
  return (await issuesFor(context)).map((issue) => mapIssue(issue, context));
}

export async function listEvents(expectedRole: MembershipRole): Promise<EventListItem[]> {
  const context = await requireMembership(expectedRole);
  return (await eventsFor(context)).map(mapEvent);
}

export async function listDocuments(expectedRole: MembershipRole): Promise<DocumentListItem[]> {
  const context = await requireMembership(expectedRole);
  const rows = await db.document.findMany({ where: { apartmentId: context.membership.apartmentId, ...(context.membership.role === "TENANT" ? { visibility: "SHARED" as const } : {}) }, orderBy: { updatedAt: "desc" }, take: 200 });
  return rows.map((document) => ({ id: document.id, title: document.title, category: document.category, date: dateFormatter.format(document.updatedAt), version: document.version, visibility: document.visibility === "SHARED" ? "Condiviso" : "Solo proprietario" }));
}

type MessageMemberContext = { userId: string; apartmentId: string; role: MembershipRole };

async function hasChatCounterpart(context: MessageMemberContext) {
  const counterparts = await db.apartmentMembership.findMany({
    where: {
      apartmentId: context.apartmentId,
      role: context.role === "OWNER" ? "TENANT" : "OWNER",
      status: { in: ["ACTIVE", "SUSPENDED", "REMOVED"] },
    },
    select: { userId: true, status: true },
  });
  if (counterparts.some((counterpart) => counterpart.status === "ACTIVE")) return true;
  if (!counterparts.length) return false;

  const allowedCounterpartIds = new Set(counterparts.map((counterpart) => counterpart.userId));
  const historicalThreads = await db.messageThread.findMany({
    where: { apartmentId: context.apartmentId, participants: { some: { userId: context.userId } } },
    select: { participants: { select: { userId: true } } },
  });
  return historicalThreads.some((thread) => Boolean(directCounterpartId(context.userId, thread.participants.map((participant) => participant.userId), allowedCounterpartIds)));
}

export async function getMessagesForMember(context: MessageMemberContext, requestedCounterpartId?: string | null): Promise<MessagesViewData> {
  const counterpartRole = context.role === "OWNER" ? "TENANT" : "OWNER";
  const [memberships, threads] = await Promise.all([
    db.apartmentMembership.findMany({
      where: { apartmentId: context.apartmentId, role: counterpartRole, status: { in: ["ACTIVE", "SUSPENDED", "REMOVED"] } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.messageThread.findMany({
      where: { apartmentId: context.apartmentId, participants: { some: { userId: context.userId } } },
      include: {
        participants: { select: { userId: true } },
        messages: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const membershipByUserId = new Map(memberships.map((membership) => [membership.userId, membership]));
  const allowedCounterpartIds = new Set(membershipByUserId.keys());
  const threadByCounterpartId = new Map<string, (typeof threads)[number]>();
  for (const thread of threads) {
    const counterpartId = directCounterpartId(context.userId, thread.participants.map((participant) => participant.userId), allowedCounterpartIds);
    if (!counterpartId || threadByCounterpartId.has(counterpartId)) continue;
    threadByCounterpartId.set(counterpartId, thread);
  }

  const visibleMemberships = memberships.filter((membership) => membership.status === "ACTIVE" || threadByCounterpartId.has(membership.userId));
  const conversations = visibleMemberships.map((membership) => {
    const thread = threadByCounterpartId.get(membership.userId);
    const latestMessage = thread?.messages[0];
    return {
      counterpartId: membership.userId,
      threadId: thread?.id ?? null,
      name: membership.user.name,
      initial: membership.user.name.slice(0, 1).toUpperCase(),
      lastMessage: latestMessage?.body ?? "Nessun messaggio",
      lastMessageAt: latestMessage ? messageTimeFormatter.format(latestMessage.createdAt) : null,
      canSend: membership.status === "ACTIVE",
    };
  }).sort((left, right) => {
    const leftUpdatedAt = threadByCounterpartId.get(left.counterpartId)?.updatedAt.getTime() ?? 0;
    const rightUpdatedAt = threadByCounterpartId.get(right.counterpartId)?.updatedAt.getTime() ?? 0;
    return rightUpdatedAt - leftUpdatedAt;
  });

  const selectedCounterpartId = conversations.some((conversation) => conversation.counterpartId === requestedCounterpartId)
    ? requestedCounterpartId!
    : conversations[0]?.counterpartId ?? null;
  const selectedMembership = selectedCounterpartId ? membershipByUserId.get(selectedCounterpartId) : undefined;
  const selectedThread = selectedCounterpartId ? threadByCounterpartId.get(selectedCounterpartId) : undefined;
  const messages = selectedThread
    ? (await db.message.findMany({
        where: { threadId: selectedThread.id },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 500,
      })).reverse()
    : [];
  const counterpartName = selectedMembership?.user.name ?? "Casa";
  const version = [
    selectedCounterpartId ?? "",
    selectedThread?.updatedAt.toISOString() ?? "",
    messages.at(-1)?.id ?? "",
    ...conversations.map((conversation) => `${conversation.counterpartId}:${threadByCounterpartId.get(conversation.counterpartId)?.updatedAt.toISOString() ?? ""}`),
  ].join(":");

  return {
    available: conversations.length > 0,
    version,
    selectedCounterpartId,
    threadId: selectedThread?.id ?? null,
    title: selectedMembership ? `Chat con ${counterpartName}` : "Messaggi",
    counterpartName,
    counterpartInitial: counterpartName.slice(0, 1).toUpperCase(),
    canSend: selectedMembership?.status === "ACTIVE",
    conversations,
    messages: messages.map((message) => ({ id: message.id, sender: message.author.name, text: message.body, time: messageTimeFormatter.format(message.createdAt), mine: message.authorId === context.userId })),
  };
}

export async function getMessages(expectedRole: MembershipRole, requestedCounterpartId?: string | null): Promise<MessagesViewData> {
  const context = await requireMembership(expectedRole);
  return getMessagesForMember({ userId: context.session.user.id, apartmentId: context.membership.apartmentId, role: context.membership.role }, requestedCounterpartId);
}

export async function getDashboard(expectedRole: MembershipRole): Promise<DashboardData> {
  const context = await requireMembership(expectedRole);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const expenseTrend = recentExpenseMonths(now);
  const firstTrendMonth = expenseTrend[0]!;
  const startOfTrend = new Date(Date.UTC(firstTrendMonth.year, firstTrendMonth.monthIndex, 1));
  const expenseQueryStart = startOfTrend < startOfYear ? startOfTrend : startOfYear;
  const [bills, issues, events, expenses, messages, hasChat] = await Promise.all([
    billsFor(context, 6),
    issuesFor(context, 20),
    eventsFor(context, 30),
    db.expense.findMany({ where: { apartmentId: context.membership.apartmentId, createdAt: { gte: expenseQueryStart }, ...(context.membership.role === "TENANT" ? { shared: true } : {}) }, orderBy: { createdAt: "asc" } }),
    db.message.findMany({ where: { thread: { apartmentId: context.membership.apartmentId, participants: { some: { userId: context.session.user.id } } } }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 4 }),
    hasChatCounterpart({ userId: context.session.user.id, apartmentId: context.membership.apartmentId, role: context.membership.role }),
  ]);
  const mappedBills = bills.map(mapBill);
  const mappedIssues = issues.map((issue) => mapIssue(issue, context));
  const mappedEvents = events.map(mapEvent);
  const futureEvents = mappedEvents.filter((event) => new Date(event.endsAt) >= now);
  const yearExpenses = expenses.filter((expense) => expense.createdAt >= startOfYear);
  const expenseTrendByKey = new Map(expenseTrend.map((month) => [month.key, month]));
  expenses.forEach((expense) => {
    const month = expenseTrendByKey.get(yearMonthKey(expense.createdAt));
    if (month) month.amount += expense.amount.toNumber();
  });
  const openStatuses = new Set(["OPEN", "IN_PROGRESS", "SCHEDULED"]);
  return {
    greetingName: context.session.user.name.split(/\s+/)[0] ?? context.session.user.name,
    apartmentName: context.membership.apartment.name,
    address: `${context.membership.apartment.addressLine}, ${context.membership.apartment.city}`,
    outstandingAmount: mappedBills.filter((bill) => !["PAID", "DRAFT"].includes(bill.statusCode)).reduce((sum, bill) => sum + bill.amount, 0),
    paidExpenses: yearExpenses.filter((expense) => expense.status === "PAID").length,
    totalExpenses: yearExpenses.length,
    openIssues: issues.filter((issue) => openStatuses.has(issue.status)).length,
    urgentIssues: issues.filter((issue) => openStatuses.has(issue.status) && issue.priority === "URGENT").length,
    expenseTrend: expenseTrend.map(({ key, label, amount }) => ({ key, label, amount })),
    nextEvent: futureEvents[0] ?? null,
    urgentIssue: mappedIssues.find((issue) => issue.priority === "Urgente" && issue.statusCode !== "CLOSED" && issue.statusCode !== "RESOLVED") ?? mappedIssues.find((issue) => issue.statusCode === "OPEN") ?? null,
    bills: mappedBills,
    events: futureEvents.slice(0, 3),
    hasChat,
    recentMessages: messages.map((message) => ({ id: message.id, name: message.author.name, initial: message.author.name.slice(0, 1).toUpperCase(), text: message.body, time: messageTimeFormatter.format(message.createdAt) })),
  };
}

export async function getProfile(expectedRole: MembershipRole): Promise<{ session: Context["session"]; role: MembershipRole; data: ProfileData }> {
  const context = await requireMembership(expectedRole);
  const [members, invitations, auditEvents, accounts, googleIntegration, googleCalendar, recentEmails] = await Promise.all([
    db.apartmentMembership.findMany({ where: { apartmentId: context.membership.apartmentId, status: { in: ["ACTIVE", "SUSPENDED"] } }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } }),
    context.membership.role === "OWNER" ? db.invitation.findMany({ where: { apartmentId: context.membership.apartmentId, status: "PENDING", expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" }, take: 20 }) : Promise.resolve([]),
    context.membership.role === "OWNER" ? db.auditEvent.findMany({ where: { apartmentId: context.membership.apartmentId }, include: { actor: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 30 }) : Promise.resolve([]),
    db.account.findMany({ where: { userId: context.session.user.id }, select: { providerId: true, password: true, scope: true } }),
    db.googleIntegration.findUnique({ where: { userId: context.session.user.id } }),
    db.googleCalendarTarget.findUnique({ where: { userId_apartmentId: { userId: context.session.user.id, apartmentId: context.membership.apartmentId } } }),
    db.emailDelivery.findMany({ where: { senderUserId: context.session.user.id, apartmentId: context.membership.apartmentId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, createdAt: true } }),
  ]);
  const googleAccount = accounts.find((account) => account.providerId === "google");
  const googleScopes = parseGoogleScopes(googleAccount?.scope);
  return {
    session: context.session,
    role: context.membership.role,
    data: {
      apartment: { name: context.membership.apartment.name, address: context.membership.apartment.addressLine, city: context.membership.apartment.city },
      members: members.map((member) => ({ id: member.id, name: member.user.name, role: member.role === "OWNER" ? "Proprietario" : "Inquilino", status: member.status, initial: member.user.name.slice(0, 1).toUpperCase() })),
      invitations: invitations.map((invitation) => ({ id: invitation.id, email: invitation.email, expiresAt: dateFormatter.format(invitation.expiresAt) })),
      auditEvents: auditEvents.map((event) => ({ id: event.id, action: event.action, entityType: event.entityType, actor: event.actor.name, date: messageTimeFormatter.format(event.createdAt) })),
      google: {
        configured: isGoogleOAuthConfigured(),
        encryptionConfigured: isDataEncryptionConfigured(),
        accountLinked: Boolean(googleAccount),
        credentialLinked: accounts.some((account) => Boolean(account.password)),
        calendarGranted: googleScopes.has(GOOGLE_CALENDAR_SCOPE),
        gmailGranted: googleScopes.has(GOOGLE_GMAIL_SEND_SCOPE),
        calendarEnabled: Boolean(googleIntegration?.calendarEnabled && googleCalendar?.enabled),
        gmailEnabled: Boolean(googleIntegration?.gmailEnabled),
        calendarName: googleCalendar?.calendarName ?? null,
        lastSyncedAt: googleCalendar?.lastSyncedAt ? messageTimeFormatter.format(googleCalendar.lastSyncedAt) : null,
        lastErrorCode: googleCalendar?.lastErrorCode ?? googleIntegration?.lastErrorCode ?? null,
        recentEmails: recentEmails.map((email) => ({ id: email.id, status: email.status, createdAt: messageTimeFormatter.format(email.createdAt) })),
      },
    },
  };
}

export async function getPortalShellData(context: Context): Promise<PortalShellData> {
  const [notifications, unreadByType, openIssues, hasChat] = await Promise.all([
    db.notification.findMany({ where: { apartmentId: context.membership.apartmentId, userId: context.session.user.id, readAt: null }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.notification.groupBy({ by: ["type"], where: { apartmentId: context.membership.apartmentId, userId: context.session.user.id, readAt: null }, _count: { _all: true } }),
    db.issue.count({ where: { apartmentId: context.membership.apartmentId, status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] } } }),
    hasChatCounterpart({ userId: context.session.user.id, apartmentId: context.membership.apartmentId, role: context.membership.role }),
  ]);
  const unreadNotifications = unreadByType.reduce((total, row) => total + row._count._all, 0);
  const unreadMessages = unreadByType.find((row) => row.type === "message")?._count._all ?? 0;
  return {
    notifications: notifications.map((notification) => ({ id: notification.id, type: notification.type, title: notification.title, body: notification.body, createdAt: messageTimeFormatter.format(notification.createdAt), read: Boolean(notification.readAt) })),
    unreadNotifications,
    openIssues,
    unreadMessages,
    hasChat,
    apartmentLabel: context.membership.apartment.addressLine,
    apartmentCity: context.membership.apartment.city,
  };
}

export async function globalSearch(expectedRole: MembershipRole, rawQuery: string): Promise<GlobalSearchResult[]> {
  const context = await requireMembership(expectedRole);
  const query = rawQuery.trim().slice(0, 120);
  if (query.length < 2) return [];
  const apartmentId = context.membership.apartmentId;
  const area = context.membership.role === "OWNER" ? "owner" : "tenant";
  const textFilter = { contains: query, mode: "insensitive" as const };
  const [bills, expenses, issues, messages, events, documents] = await Promise.all([
    db.bill.findMany({ where: { apartmentId, ...(context.membership.role === "TENANT" ? { shared: true } : {}), OR: [{ supplier: textFilter }, { category: textFilter }] }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.expense.findMany({ where: { apartmentId, ...(context.membership.role === "TENANT" ? { shared: true } : {}), OR: [{ title: textFilter }, { category: textFilter }] }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.issue.findMany({ where: { apartmentId, OR: [{ title: textFilter }, { description: textFilter }, { category: textFilter }] }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.message.findMany({ where: { body: textFilter, thread: { apartmentId, participants: { some: { userId: context.session.user.id } } } }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.calendarEvent.findMany({ where: { apartmentId, OR: [{ title: textFilter }, { description: textFilter }, { location: textFilter }] }, orderBy: { startsAt: "desc" }, take: 10 }),
    db.document.findMany({ where: { apartmentId, ...(context.membership.role === "TENANT" ? { visibility: "SHARED" as const } : {}), OR: [{ title: textFilter }, { category: textFilter }] }, orderBy: { updatedAt: "desc" }, take: 10 }),
  ]);
  const results: GlobalSearchResult[] = [
    ...bills.map((bill) => ({ id: bill.id, kind: "Bolletta" as const, title: bill.supplier, description: `${bill.category} · ${billStatus[bill.status]} · ${new Intl.NumberFormat("it-IT", { style: "currency", currency: bill.currency }).format(bill.amount.toNumber())}`, href: `/${area}/bollette?q=${encodeURIComponent(query)}`, date: dateFormatter.format(bill.dueAt) })),
    ...expenses.map((expense) => ({ id: expense.id, kind: "Spesa" as const, title: expense.title, description: `${expense.category} · ${expenseStatus[expense.status]} · ${new Intl.NumberFormat("it-IT", { style: "currency", currency: expense.currency }).format(expense.amount.toNumber())}`, href: `/${area}/spese?q=${encodeURIComponent(query)}`, date: expense.dueAt ? dateFormatter.format(expense.dueAt) : null })),
    ...issues.map((issue) => ({ id: issue.id, kind: "Segnalazione" as const, title: issue.title, description: `${issue.category} · ${issueStatus[issue.status]} · priorità ${priority[issue.priority].toLowerCase()}`, href: `/${area}/segnalazioni?q=${encodeURIComponent(query)}`, date: dateFormatter.format(issue.updatedAt) })),
    ...messages.map((message) => ({ id: message.id, kind: "Messaggio" as const, title: message.author.name, description: message.body, href: `/${area}/messaggi?q=${encodeURIComponent(query)}`, date: messageTimeFormatter.format(message.createdAt) })),
    ...events.map((event) => ({ id: event.id, kind: "Evento" as const, title: event.title, description: [event.description, event.location].filter(Boolean).join(" · ") || "Evento del calendario", href: `/${area}/calendario?q=${encodeURIComponent(query)}`, date: dateFormatter.format(event.startsAt) })),
    ...documents.map((document) => ({ id: document.id, kind: "Documento" as const, title: document.title, description: `${document.category} · versione ${document.version}`, href: `/${area}/documenti?q=${encodeURIComponent(query)}`, date: dateFormatter.format(document.updatedAt) })),
  ];
  return results.sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""));
}
