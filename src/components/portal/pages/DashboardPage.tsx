import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  MessageCircle,
  ReceiptText,
  TrendingDown,
  Wrench,
  Zap,
} from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageHeading } from "@/components/ui/PageHeading";
import { StatCard } from "@/components/ui/StatCard";
import { monthlyConsumption } from "@/data/mock-data";
import type { DashboardData } from "@/features/portal/types";
import type { ModalKind, Role, View } from "@/types";

function ConsumptionCard({ livePower }: { livePower: number }) {
  const points = monthlyConsumption.map((value, index) => `${index * 42},${110 - value}`).join(" ");
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_20px_60px_rgba(17,24,39,.2)] sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-violet/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-12 size-56 rounded-full bg-lime/15 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-lime" /></span>CONSUMO LIVE · DATI DEMO</div><p className="mt-3 text-4xl font-bold tabular-nums tracking-[-0.06em]">{livePower.toFixed(2)} <span className="text-base font-medium text-slate-400">kW</span></p><p className="mt-1 text-xs text-slate-500">Ultimo aggiornamento pochi secondi fa</p></div>
        <span className="grid size-11 place-items-center rounded-2xl bg-lime text-ink"><Zap className="size-5" /></span>
      </div>
      <div className="relative mt-7 h-24">
        <svg viewBox="0 0 462 120" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Grafico dimostrativo del consumo energetico">
          <defs><linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B6F36B" stopOpacity="0.4" /><stop offset="1" stopColor="#B6F36B" stopOpacity="0" /></linearGradient></defs>
          <path d={`M 0 120 L ${points.replaceAll(",", " ").replaceAll(" ", " L ")} L 462 120 Z`} fill="url(#energyFill)" opacity=".65" />
          <polyline points={points} fill="none" stroke="#B6F36B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-4 text-xs"><span className="text-slate-500">Oggi</span><span className="font-semibold text-lime">7,84 kWh · €2,14 stimati</span></div>
    </article>
  );
}

function SpendingChart({ months }: { months: DashboardData["expenseTrend"] }) {
  const chartWidth = 600;
  const chartTop = 12;
  const chartBottom = 132;
  const chartLeft = 8;
  const chartRight = 592;
  const max = Math.max(...months.map((month) => month.amount), 0);
  const total = months.reduce((sum, month) => sum + month.amount, 0);
  const hasData = max > 0;
  const coordinates = months.map((month, index) => ({
    ...month,
    x: chartLeft + (index * (chartRight - chartLeft)) / Math.max(months.length - 1, 1),
    y: hasData ? chartBottom - (month.amount / max) * (chartBottom - chartTop) : chartBottom,
  }));
  const points = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const highlightedPoint = [...coordinates].reverse().find((point) => point.amount > 0);
  const formattedTotal = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(total);
  const accessibleTrend = months.map((month) => `${month.label}: ${new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(month.amount)}`).join(", ");

  return (
    <article className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.055)] sm:p-6">
      <div className="flex items-start justify-between"><div><h2 className="font-bold tracking-[-0.025em] text-ink">Andamento spese</h2><p className="mt-1 text-xs text-slate-400">Ultimi 6 mesi · tutte le categorie</p></div><span className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">6 mesi <ChevronDown className="ml-1 inline size-3" /></span></div>
      <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1"><span className="text-3xl font-bold tracking-[-0.05em]">{formattedTotal}</span><span className="mb-1 flex items-center gap-1 text-xs font-bold text-emerald-600"><TrendingDown className="size-3.5" /> dati registrati</span></div>
      <div className="relative mt-6 h-40">
        <svg viewBox={`0 0 ${chartWidth} 140`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`Spese mensili degli ultimi sei mesi. ${accessibleTrend}`}>
          <defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7657FF" stopOpacity="0.24" /><stop offset="1" stopColor="#7657FF" stopOpacity="0" /></linearGradient></defs>
          {[chartTop, 52, 92, chartBottom].map((y) => <line key={y} x1="0" y1={y} x2={chartWidth} y2={y} stroke="#E8EAF0" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />)}
          {hasData && <>
            <path d={`M ${points} L ${chartRight} ${chartBottom} L ${chartLeft} ${chartBottom} Z`} fill="url(#spendFill)" />
            <polyline points={points} fill="none" stroke="#7657FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {highlightedPoint && <circle cx={highlightedPoint.x} cy={highlightedPoint.y} r="5" fill="#fff" stroke="#7657FF" strokeWidth="3" vectorEffect="non-scaling-stroke" />}
          </>}
        </svg>
        {!hasData && <p className="pointer-events-none absolute inset-0 grid place-items-center text-xs font-medium text-slate-400">Nessuna spesa registrata nel periodo</p>}
      </div>
      <div className="mt-2 grid grid-cols-6 text-center text-[10px] font-semibold text-slate-400">{months.map((month) => <span key={month.key}>{month.label}</span>)}</div>
    </article>
  );
}

function UrgentIssue({ issue, onOpen }: { issue: DashboardData["urgentIssue"]; onOpen: () => void }) {
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-[#ffe7e5] p-5 sm:p-6">
      <div className="absolute -right-8 -top-10 size-32 rounded-full border-[18px] border-white/30" />
      <div className="relative"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-rose-600"><AlertTriangle className="size-3" /> {issue ? "Richiede attenzione" : "Nessuna urgenza"}</span><h2 className="mt-5 text-xl font-bold tracking-[-0.04em] text-ink">{issue?.title ?? "Tutto sotto controllo"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{issue?.description ?? "Non risultano segnalazioni urgenti aperte."}</p><div className="mt-5 flex justify-end"><button onClick={onOpen} className="grid size-10 place-items-center rounded-full bg-ink text-white transition hover:translate-x-0.5" aria-label="Apri segnalazioni"><ArrowRight className="size-4" /></button></div></div>
    </article>
  );
}

function BillsPreview({ records, onNavigate }: { records: DashboardData["bills"]; onNavigate: () => void }) {
  return (
    <article className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.055)] sm:p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-bold tracking-[-0.025em]">Prossime bollette</h2><p className="mt-1 text-xs text-slate-400">{records.length} voci recenti</p></div><button onClick={onNavigate} className="text-xs font-bold text-violet hover:underline">Vedi tutte</button></div>
      <div className="mt-4 divide-y divide-slate-100">{records.slice(0, 3).map((bill) => <div key={bill.id} className="flex items-center gap-3 py-3.5"><span className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-600"><ReceiptText className="size-[18px]" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{bill.supplier}</p><p className="mt-0.5 text-[11px] text-slate-400">Scade il {bill.due}</p></div><p className="text-sm font-bold">€{bill.amount.toFixed(2).replace(".", ",")}</p></div>)}{!records.length && <p className="py-8 text-center text-xs text-slate-400">Nessuna bolletta.</p>}</div>
    </article>
  );
}

function EventsPreview({ records, onNavigate }: { records: DashboardData["events"]; onNavigate: () => void }) {
  return (
    <article className="rounded-[28px] bg-[#eef0ff] p-5 sm:p-6">
      <div className="flex items-center justify-between"><div><h2 className="font-bold tracking-[-0.025em]">In agenda</h2><p className="mt-1 text-xs text-slate-500">I prossimi appuntamenti</p></div><button onClick={onNavigate} className="grid size-9 place-items-center rounded-xl bg-white/80 text-violet" aria-label="Apri calendario"><CalendarDays className="size-4" /></button></div>
      <div className="mt-5 space-y-4">{records.slice(0, 2).map((event) => <div key={event.id} className="flex items-center gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-center shadow-sm"><span className="leading-none"><b className="block text-base">{event.day}</b><small className="text-[8px] font-bold text-slate-400">{event.month}</small></span></div><div className="min-w-0"><p className="truncate text-sm font-bold">{event.title}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="size-3" />{event.time}</p></div></div>)}{!records.length && <p className="text-xs text-slate-400">Nessun evento futuro.</p>}</div>
    </article>
  );
}

type DashboardPageProps = {
  role: Role;
  livePower: number;
  data?: DashboardData | undefined;
  onNavigate: (view: View) => void;
  onOpenModal: (kind: ModalKind) => void;
};

export function DashboardPage({ role, livePower, data, onNavigate, onOpenModal }: DashboardPageProps) {
  const recentMessages = data?.recentMessages ?? [];
  const today = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeading eyebrow={today} title={`Ciao ${data?.greetingName ?? ""}, tutto sotto controllo.`} description={data ? `Ecco gli aggiornamenti per ${data.address}.` : "Caricamento dei dati dell’appartamento."} action={<PrimaryButton onClick={() => onOpenModal(role === "owner" ? "bill" : "issue")}>{role === "owner" ? "Nuova voce" : "Nuova segnalazione"}</PrimaryButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={CreditCard} label="Da pagare" value={`€${(data?.outstandingAmount ?? 0).toFixed(2).replace(".", ",")}`} delta="bollette aperte" tone="violet" /><StatCard icon={CheckCircle2} label="Spese saldate" value={`${data?.paidExpenses ?? 0} / ${data?.totalExpenses ?? 0}`} delta="voci registrate" tone="lime" /><StatCard icon={Wrench} label="Segnalazioni aperte" value={String(data?.openIssues ?? 0)} delta={`${data?.urgentIssues ?? 0} urgenti`} tone="rose" /><StatCard icon={CalendarDays} label="Prossimo intervento" value={data?.nextEvent ? `${data.nextEvent.day} ${data.nextEvent.month}` : "—"} delta={data?.nextEvent?.title ?? "nessun evento"} tone="sky" /></div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><ConsumptionCard livePower={livePower} /><UrgentIssue issue={data?.urgentIssue ?? null} onOpen={() => onNavigate("issues")} /></div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><SpendingChart months={data?.expenseTrend ?? []} /><EventsPreview records={data?.events ?? []} onNavigate={() => onNavigate("calendar")} /></div>
      <div className={data?.hasChat === false ? "grid gap-5" : "grid gap-5 xl:grid-cols-[1.2fr_.8fr]"}><BillsPreview records={data?.bills ?? []} onNavigate={() => onNavigate("bills")} />{data?.hasChat !== false && <article className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.055)] sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Messaggi recenti</h2><p className="mt-1 text-xs text-slate-400">Conversazione interna</p></div><button onClick={() => onNavigate("messages")} className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600" aria-label="Apri messaggi"><MessageCircle className="size-4" /></button></div><div className="mt-5 space-y-4">{recentMessages.map((message) => <button key={message.id} onClick={() => onNavigate("messages")} className="flex w-full items-center gap-3 text-left"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet text-xs font-bold text-white">{message.initial}</span><span className="min-w-0 flex-1"><span className="flex justify-between"><b className="text-sm">{message.name}</b><small className="text-[10px] text-slate-400">{message.time}</small></span><span className="mt-0.5 block truncate text-xs text-slate-500">{message.text}</span></span></button>)}{!recentMessages.length && <p className="py-6 text-center text-xs text-slate-400">Nessun messaggio.</p>}</div></article>}</div>
    </div>
  );
}
