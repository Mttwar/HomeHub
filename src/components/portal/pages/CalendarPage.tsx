import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeading } from "@/components/ui/PageHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { respondToEvent } from "@/features/portal/actions";
import type { EventListItem } from "@/features/portal/types";
import { cx } from "@/lib/cx";
import type { ModalKind, Role } from "@/types";

export function CalendarPage({ role, query, records = [], onOpenModal }: { role: Role; query: string; records?: EventListItem[] | undefined; onOpenModal: (kind: ModalKind) => void }) {
  const visibleRecords = records.filter((event) => `${event.title} ${event.description ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const initialMonth = visibleRecords[0] ? new Date(visibleRecords[0].startsAt) : new Date();
  const [month, setMonth] = useState(initialMonth);
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month]);
  const monthEvents = visibleRecords.filter((event) => isSameMonth(new Date(event.startsAt), month));
  const upcomingEvents = visibleRecords.filter((event) => new Date(event.endsAt) >= new Date()).slice(0, 10);
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Appuntamenti" title="Calendario" description="Programma interventi e incontri nel calendario interno dell’appartamento." action={role === "owner" ? <PrimaryButton onClick={() => onOpenModal("event")}>Nuovo evento</PrimaryButton> : undefined} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,.055)] sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold capitalize">{format(month, "MMMM yyyy", { locale: it })}</h2><p className="mt-1 text-xs text-slate-400">{monthEvents.length} eventi programmati</p></div><div className="flex gap-1"><button onClick={() => setMonth((value) => subMonths(value, 1))} className="grid size-9 place-items-center rounded-xl border border-slate-200" aria-label="Mese precedente"><ChevronLeft className="size-4" /></button><button onClick={() => setMonth((value) => addMonths(value, 1))} className="grid size-9 place-items-center rounded-xl border border-slate-200" aria-label="Mese successivo"><ChevronRight className="size-4" /></button></div></div><div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{days.map((day) => { const dayEvents = monthEvents.filter((event) => isSameDay(new Date(event.startsAt), day)); const inMonth = isSameMonth(day, month); return <div key={day.toISOString()} aria-label={format(day, "d MMMM yyyy", { locale: it })} className={cx("relative aspect-square rounded-2xl p-1 text-center text-sm font-semibold", !inMonth ? "text-slate-300" : "hover:bg-slate-100", isSameDay(day, new Date()) && "bg-ink text-white hover:bg-ink")}><span>{format(day, "d")}</span>{dayEvents.length > 0 && <span className="absolute bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-violet" />}</div>; })}</div></section>
        <aside className="space-y-4"><div className="rounded-[26px] bg-[#effbe1] p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-lime"><CalendarDays className="size-5" /></span><div><p className="text-xs text-slate-500">Oggi</p><p className="font-bold capitalize">{format(new Date(), "EEEE d MMMM", { locale: it })}</p></div></div></div><article className="rounded-[26px] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]"><h2 className="font-bold">Prossimi eventi</h2><div className="mt-4 space-y-4">{upcomingEvents.map((event) => <div key={event.id} className="flex gap-3"><span className={cx("mt-1 h-10 w-1 shrink-0 rounded-full", event.color)} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{event.title}</p><p className="mt-1 text-[11px] text-slate-400">{event.day} {event.month.toLowerCase()} · {event.time}</p>{event.description && <p className="mt-1 text-[10px] text-slate-500">{event.description}</p>}{role === "tenant" && <form action={respondToEvent} className="mt-2 flex gap-1"><input type="hidden" name="id" value={event.id} /><button name="status" value="ACCEPTED" className={cx("rounded-lg px-2 py-1 text-[9px] font-bold", event.participation === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>Partecipo</button><button name="status" value="DECLINED" className={cx("rounded-lg px-2 py-1 text-[9px] font-bold", event.participation === "DECLINED" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600")}>Non posso</button></form>}</div></div>)}{!upcomingEvents.length && <p className="text-xs text-slate-400">Nessun evento futuro.</p>}</div></article></aside>
      </div>
    </div>
  );
}
