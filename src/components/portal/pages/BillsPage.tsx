import { Download, ReceiptText, Upload } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { cx } from "@/lib/cx";
import type { ModalKind, Role } from "@/types";
import type { BillListItem } from "@/features/portal/types";
import { updateBillStatus } from "@/features/portal/actions";

export function BillsPage({ query, role, records, onOpenModal }: { query: string; role: Role; records?: BillListItem[] | undefined; onOpenModal: (kind: ModalKind) => void }) {
  const source = records ?? [];
  const filtered = source.filter((bill) => `${bill.supplier} ${bill.category} ${bill.status}`.toLowerCase().includes(query.toLowerCase()));
  const realRecords = records ?? [];
  const dueTotal = realRecords.filter((bill) => !["PAID", "DRAFT"].includes(bill.statusCode)).reduce((sum, bill) => sum + bill.amount, 0);
  const paidCount = realRecords.filter((bill) => bill.statusCode === "PAID").length;
  const average = realRecords.length ? realRecords.reduce((sum, bill) => sum + bill.amount, 0) / realRecords.length : 0;
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Documenti e scadenze" title="Bollette" description="Tutte le utenze in un solo posto, con allegati, scadenze e stato del pagamento." action={role === "owner" ? <PrimaryButton icon={Upload} onClick={() => onOpenModal("bill")}>Carica bolletta</PrimaryButton> : undefined} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Da pagare", `€${dueTotal.toFixed(2).replace(".", ",")}`, `${realRecords.filter((bill) => !["PAID", "DRAFT"].includes(bill.statusCode)).length} scadenze`], ["Pagate", String(paidCount), "documenti saldati"], ["Importo medio", `€${average.toFixed(2).replace(".", ",")}`, "sulle bollette registrate"]].map(([label, value, note], index) => <article key={label} className={cx("rounded-[24px] p-5", index === 0 ? "bg-ink text-white" : "border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.05)]")}><p className={cx("text-xs font-semibold", index === 0 ? "text-slate-400" : "text-slate-500")}>{label}</p><p className="mt-2 text-2xl font-bold tracking-[-.04em]">{value}</p><p className={cx("mt-2 text-xs", index === 0 ? "text-lime" : "text-slate-400")}>{note}</p></article>)}
      </div>
      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_12px_40px_rgba(15,23,42,.055)]">
        <div className="border-b border-slate-100 p-5 sm:p-6"><h2 className="font-bold">Tutti i documenti</h2><p className="mt-1 text-xs text-slate-400">{filtered.length} risultati · usa la ricerca in alto per filtrare</p></div>
        <div className="divide-y divide-slate-100">
          {filtered.map((bill) => {
            const Icon = ReceiptText;
            const attachment = "attachment" in bill ? bill.attachment : null;
            const statusClass = bill.status === "Pagata" ? "bg-emerald-50 text-emerald-700" : bill.status === "Scaduta" ? "bg-rose-50 text-rose-700" : bill.status === "Programmato" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700";
            return <div key={bill.id} className="grid items-center gap-4 p-5 transition hover:bg-slate-50/80 sm:grid-cols-[1.4fr_.7fr_.7fr_.8fr_auto] sm:px-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-slate-100"><Icon className="size-5 text-slate-600" /></span><div><p className="text-sm font-bold">{bill.supplier}</p><p className="mt-0.5 text-xs text-slate-400">{bill.category} · {bill.period}</p>{attachment && <p className="mt-1 max-w-52 truncate text-[10px] font-semibold text-violet">{attachment.originalName}</p>}</div></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">Importo</p><p className="text-sm font-bold">€{bill.amount.toFixed(2).replace(".", ",")}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">Scadenza</p><p className="text-sm text-slate-600">{bill.due}</p></div>{role === "owner" && "statusCode" in bill ? <form action={updateBillStatus} className="flex items-center gap-1"><input type="hidden" name="id" value={String(bill.id)} /><select name="status" defaultValue={bill.statusCode} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold"><option value="DRAFT">Bozza</option><option value="DUE">Da pagare</option><option value="SCHEDULED">Programmato</option><option value="PAID">Pagata</option><option value="OVERDUE">Scaduta</option><option value="DISPUTED">Contestata</option></select><button className="rounded-xl bg-ink px-2 py-2 text-[10px] font-bold text-white">Salva</button></form> : <span className={cx("w-fit rounded-full px-2.5 py-1 text-[10px] font-bold", statusClass)}>{bill.status}</span>}{attachment ? <a href={`/api/attachments/${attachment.id}`} className="motion-control grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet/30 hover:bg-violet/5 hover:text-violet" aria-label={`Scarica ${attachment.originalName}`} title={attachment.originalName}><Download className="size-4" /></a> : <button disabled className="grid size-9 place-items-center rounded-xl border border-slate-100 text-slate-300" aria-label={`Nessun allegato per ${bill.supplier}`} title="Nessun allegato"><Download className="size-4" /></button>}</div>;
          })}
        </div>
      </section>
    </div>
  );
}
