import { LoaderCircle, MessageCircle } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/ui/PageHeading";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { addIssueComment, updateIssueStatus } from "@/features/portal/actions";
import { initialPortalMutationState } from "@/features/portal/state";
import type { IssueListItem } from "@/features/portal/types";
import { cx } from "@/lib/cx";
import type { ModalKind, Role } from "@/types";

const columns = ["Aperta", "Presa in carico", "Intervento fissato", "Risolta"];
const columnTones = ["bg-slate-400", "bg-amber-400", "bg-violet", "bg-emerald-400"];

function CommentForm({ issueId }: { issueId: string }) {
  const [state, action, pending] = useActionState(addIssueComment, initialPortalMutationState);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.status === "success") { formRef.current?.reset(); router.refresh(); } }, [router, state]);
  return <form ref={formRef} action={action} className="mt-3"><input type="hidden" name="id" value={issueId} /><div className="flex gap-2"><input name="body" required maxLength={2000} placeholder="Aggiungi un commento" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet" /><button disabled={pending} className="rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{pending ? <LoaderCircle className="size-3 animate-spin" /> : "Invia"}</button></div>{state.status === "error" && <p className="mt-1 text-[10px] text-rose-600">{state.message}</p>}</form>;
}

export function IssuesPage({ query, role, records = [], onOpenModal }: { query: string; role: Role; records?: IssueListItem[] | undefined; onOpenModal: (kind: ModalKind) => void }) {
  const filtered = records.filter((issue) => `${issue.title} ${issue.category} ${issue.status}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Manutenzione" title="Segnalazioni" description="Segui ogni problema dalla prima segnalazione fino alla risoluzione." action={<PrimaryButton onClick={() => onOpenModal("issue")}>Nuova segnalazione</PrimaryButton>} />
      <div className="grid gap-4 xl:grid-cols-4">{columns.map((column, index) => { const cards = filtered.filter((issue) => issue.status === column); return <section key={column} className="rounded-[24px] bg-slate-100/80 p-3"><div className="flex items-center justify-between px-2 py-2"><div className="flex items-center gap-2"><span className={cx("size-2 rounded-full", columnTones[index])} /><h2 className="text-xs font-extrabold uppercase tracking-[.11em] text-slate-600">{column}</h2></div><span className="text-xs font-bold text-slate-400">{cards.length}</span></div><div className="mt-2 space-y-3">{cards.map((issue) => <article key={issue.id} className="rounded-[20px] border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]"><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{issue.category}</span><h3 className="mt-4 text-sm font-bold leading-5">{issue.title}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{issue.description}</p><div className="mt-4 flex items-center justify-between text-[10px] text-slate-400"><span>{issue.date}</span><span className="flex items-center gap-1"><MessageCircle className="size-3" />{issue.comments}</span></div>{issue.priority === "Urgente" && <div className="mt-3 rounded-xl bg-rose-50 px-2.5 py-2 text-[10px] font-bold text-rose-600">Intervento urgente</div>}
          <details className="mt-3 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-[10px] font-bold text-violet">Dettagli e commenti</summary><div className="mt-3 space-y-2">{issue.recentComments.map((comment) => <div key={comment.id} className="rounded-xl bg-slate-50 p-2 text-[10px] leading-4"><b>{comment.author}</b><p className="text-slate-600">{comment.body}</p><small className="text-slate-400">{comment.date}</small></div>)}{!issue.recentComments.length && <p className="text-[10px] text-slate-400">Nessun commento.</p>}</div>{issue.canComment && <CommentForm issueId={issue.id} />}</details>
          {role === "owner" && <form action={updateIssueStatus} className="mt-3 flex gap-2"><input type="hidden" name="id" value={issue.id} /><select name="status" defaultValue={issue.statusCode} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold"><option value="OPEN">Aperta</option><option value="IN_PROGRESS">Presa in carico</option><option value="SCHEDULED">Intervento fissato</option><option value="RESOLVED">Risolta</option><option value="CLOSED">Chiusa</option></select><button className="rounded-xl bg-ink px-2.5 py-2 text-[10px] font-bold text-white">Aggiorna</button></form>}
        </article>)}{cards.length === 0 && <div className="rounded-[20px] border border-dashed border-slate-200 bg-white/50 p-6 text-center text-xs text-slate-400">Nessuna segnalazione</div>}</div></section>; })}</div>
    </div>
  );
}
