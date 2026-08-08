import { Eye, FileText, ShieldCheck, Upload } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { DocumentListItem } from "@/features/portal/types";
import { cx } from "@/lib/cx";
import type { ModalKind, Role } from "@/types";

const tones = ["bg-violet/10 text-violet", "bg-lime/40 text-emerald-700", "bg-sky-100 text-sky-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];

export function DocumentsPage({ role, query, records = [], onOpenModal }: { role: Role; query: string; records?: DocumentListItem[] | undefined; onOpenModal: (kind: ModalKind) => void }) {
  const documents = records.filter((document) => `${document.title} ${document.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Archivio protetto" title="Documenti" description="Schede e metadati dei documenti della casa. Il caricamento dei file resta separato dallo storage esterno." action={role === "owner" ? <PrimaryButton icon={Upload} onClick={() => onOpenModal("document")}>Registra documento</PrimaryButton> : undefined} />
      <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-[24px] bg-ink p-5 text-white"><p className="text-xs font-semibold text-slate-400">Schede disponibili</p><p className="mt-2 text-3xl font-bold tracking-[-.05em]">{documents.length}</p><p className="mt-2 text-xs text-lime">Archivio persistente</p></article><article className="rounded-[24px] bg-[#effbe1] p-5"><div className="flex items-center gap-2 text-xs font-bold text-emerald-700"><ShieldCheck className="size-4" /> Accesso controllato</div><p className="mt-3 text-sm leading-6 text-slate-600">Gli inquilini vedono soltanto le schede condivise; i documenti riservati restano al proprietario.</p></article></div>
      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.055)]"><div className="border-b border-slate-100 p-5 sm:p-6"><h2 className="font-bold">Archivio casa</h2><p className="mt-1 text-xs text-slate-400">{documents.length} documenti visibili per il tuo profilo</p></div><div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">{documents.map((document, index) => <article key={document.id} className="group rounded-[22px] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-violet/20 hover:shadow-lg"><div className="flex items-start justify-between"><span className={cx("grid size-11 place-items-center rounded-2xl", tones[index % tones.length])}><FileText className="size-5" /></span><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">v{document.version}</span></div><h3 className="mt-5 text-sm font-bold leading-5">{document.title}</h3><p className="mt-1 text-xs text-slate-400">{document.category}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[10px] text-slate-400">{document.date}</span><span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><Eye className="size-3" /> {document.visibility}</span></div></article>)}{!documents.length && <p className="col-span-full p-8 text-center text-sm text-slate-400">Nessun documento disponibile.</p>}</div></section>
    </div>
  );
}
