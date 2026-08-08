import type { LucideIcon } from "lucide-react";

export type View =
  | "dashboard"
  | "bills"
  | "expenses"
  | "issues"
  | "messages"
  | "calendar"
  | "documents"
  | "search"
  | "settings";

export type Role = "owner" | "tenant";
export type ModalKind = "bill" | "expense" | "rent" | "issue" | "event" | "document" | null;

export type Session = {
  name: string;
  email: string;
  role: Role;
  initials: string;
};

export type NavItem = {
  id: View;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  badge?: number;
  mobile?: boolean;
};

export type Bill = {
  id: number;
  supplier: string;
  category: string;
  icon: LucideIcon;
  amount: number;
  due: string;
  period: string;
  status: string;
};

export type Issue = {
  id: number;
  title: string;
  category: string;
  status: string;
  priority: string;
  date: string;
  comments: number;
};

export type CalendarEvent = {
  day: string;
  month: string;
  title: string;
  time: string;
  color: string;
};

export type ChatMessage = {
  id: number;
  sender: string;
  text: string;
  time: string;
  mine: boolean;
};
