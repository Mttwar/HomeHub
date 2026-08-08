import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Droplets,
  FolderOpen,
  Home,
  LayoutDashboard,
  MessageCircle,
  ReceiptText,
  Settings,
  Wrench,
  Zap,
} from "lucide-react";
import type { Bill, CalendarEvent, ChatMessage, Issue, NavItem } from "../types";

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, mobile: true },
  { id: "bills", label: "Bollette", shortLabel: "Bollette", icon: ReceiptText, mobile: true },
  { id: "expenses", label: "Spese", shortLabel: "Spese", icon: CircleDollarSign },
  { id: "issues", label: "Segnalazioni", shortLabel: "Guasti", icon: Wrench, mobile: true },
  { id: "messages", label: "Messaggi", shortLabel: "Chat", icon: MessageCircle, mobile: true },
  { id: "calendar", label: "Calendario", shortLabel: "Agenda", icon: CalendarDays, mobile: true },
  { id: "documents", label: "Documenti", shortLabel: "File", icon: FolderOpen },
  { id: "settings", label: "Impostazioni", shortLabel: "Profilo", icon: Settings },
];

export const bills: Bill[] = [
  { id: 1, supplier: "Octopus Energy", category: "Energia", icon: Zap, amount: 84.2, due: "28 lug", period: "Giu 2026", status: "Da pagare" },
  { id: 2, supplier: "Acea Ato 2", category: "Acqua", icon: Droplets, amount: 42.8, due: "12 ago", period: "Mag–Giu 2026", status: "Programmato" },
  { id: 3, supplier: "Fastweb", category: "Internet", icon: Activity, amount: 29.95, due: "18 lug", period: "Lug 2026", status: "Pagata" },
  { id: 4, supplier: "Condominio", category: "Condominio", icon: Home, amount: 118, due: "05 lug", period: "Q3 2026", status: "Scaduta" },
];

export const issues: Issue[] = [
  { id: 1, title: "Perdita sotto il lavello", category: "Idraulica", status: "Presa in carico", priority: "Urgente", date: "Oggi, 09:42", comments: 4 },
  { id: 2, title: "Porta balcone da registrare", category: "Infissi", status: "Intervento fissato", priority: "Media", date: "Ieri, 18:10", comments: 2 },
  { id: 3, title: "Luce scale non funzionante", category: "Condominio", status: "Aperta", priority: "Bassa", date: "18 lug", comments: 1 },
  { id: 4, title: "Controllo caldaia annuale", category: "Manutenzione", status: "Risolta", priority: "Bassa", date: "12 lug", comments: 5 },
];

export const events: CalendarEvent[] = [
  { day: "24", month: "LUG", title: "Intervento idraulico", time: "10:30 – 11:30", color: "bg-violet-500" },
  { day: "29", month: "LUG", title: "Assemblea condominiale", time: "18:00 – 19:30", color: "bg-amber-400" },
  { day: "02", month: "AGO", title: "Controllo caldaia", time: "09:00 – 10:00", color: "bg-emerald-400" },
];

export const chatSeed: ChatMessage[] = [
  { id: 1, sender: "Giulia", text: "Ciao Matteo, ho caricato le foto della perdita sotto il lavello.", time: "09:42", mine: false },
  { id: 2, sender: "Matteo", text: "Grazie! Ho già sentito Luca, può passare giovedì alle 10:30.", time: "09:48", mine: true },
  { id: 3, sender: "Giulia", text: "Perfetto, per me va bene. Ho confermato anche dall’agenda.", time: "09:51", mine: false },
];

export const monthlyConsumption = [38, 44, 42, 53, 48, 58, 63, 59, 70, 65, 74, 69];
