import { CalendarDays, FileText, MessageCircle, ReceiptText, Search, WalletCards, Wrench } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import type { GlobalSearchResult } from "@/features/portal/types";
import { cx } from "@/lib/cx";

const presentation = {
  Bolletta: { icon: ReceiptText, tone: "bg-lime/40 text-emerald-700" },
  Spesa: { icon: WalletCards, tone: "bg-violet/10 text-violet" },
  Segnalazione: { icon: Wrench, tone: "bg-rose-100 text-rose-700" },
  Messaggio: { icon: MessageCircle, tone: "bg-sky-100 text-sky-700" },
  Evento: { icon: CalendarDays, tone: "bg-amber-100 text-amber-700" },
  Documento: { icon: FileText, tone: "bg-slate-100 text-slate-700" },
} as const;

export function SearchResultsPage({ query, results }: { query: string; results: GlobalSearchResult[] }) {
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Ricerca globale" title={query ? `Risultati per “${query}”` : "Cerca in CasaHub"} description="Cerca contemporaneamente tra bollette, spese, segnalazioni, messaggi, eventi e documenti accessibili al tuo ruolo." />
      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.055)]">
        <div className="border-b border-slate-100 p-5 sm:p-6"><p className="text-sm font-bold">{query.length < 2 ? "Inserisci almeno due caratteri" : `${results.length} risultati trovati`}</p></div>
        <div className="divide-y divide-slate-100">{results.map((result) => { const item = presentation[result.kind]; const Icon = item.icon; return <Link key={`${result.kind}-${result.id}`} href={result.href} className="motion-control flex items-center gap-4 p-5 transition hover:bg-slate-50 sm:px-6"><span className={cx("grid size-11 shrink-0 place-items-center rounded-2xl", item.tone)}><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{result.kind}</span><b className="mt-1 block truncate text-sm text-ink">{result.title}</b><span className="mt-1 block truncate text-xs text-slate-500">{result.description}</span></span>{result.date && <time className="hidden text-xs text-slate-400 sm:block">{result.date}</time>}</Link>; })}{query.length >= 2 && !results.length && <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search className="size-5" /></span><p className="mt-4 font-bold">Nessun risultato</p><p className="mt-1 text-xs text-slate-400">Prova con un fornitore, una categoria, un titolo o una parola contenuta nei messaggi.</p></div></div>}</div>
      </section>
    </div>
  );
}
