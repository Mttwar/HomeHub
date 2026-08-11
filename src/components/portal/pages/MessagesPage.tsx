import { LoaderCircle, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/ui/PageHeading";
import { Input } from "@/components/ui/FormField";
import { sendMessage } from "@/features/portal/actions";
import { initialPortalMutationState } from "@/features/portal/state";
import type { MessagesViewData } from "@/features/portal/types";
import { cx } from "@/lib/cx";

const emptyData: MessagesViewData = { threadId: null, title: "Conversazione della casa", counterpartName: "Casa", counterpartInitial: "C", messages: [] };

export function MessagesPage({ data = emptyData, query }: { data?: MessagesViewData | undefined; query: string }) {
  const [state, formAction, pending] = useActionState(sendMessage, initialPortalMutationState);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (state.status === "success") { formRef.current?.reset(); router.refresh(); } }, [router, state]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [data.messages.length]);
  const visibleMessages = data.messages.filter((message) => `${message.sender} ${message.text}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Conversazioni" title="Messaggi" description="Conversazione interna persistente tra i membri autorizzati dell’appartamento." />
      <section className="message-panel flex min-h-[650px] flex-col overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_12px_45px_rgba(15,23,42,.065)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6"><span className="grid size-10 place-items-center rounded-full bg-violet text-xs font-bold text-white">{data.counterpartInitial}</span><div><p className="text-sm font-bold">{data.title}</p><p className="text-[10px] text-slate-400">Con {data.counterpartName}</p></div></div>
        <div aria-live="polite" className="message-stage soft-grid flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">{visibleMessages.map((message) => <div key={message.id} className={cx("flex", message.mine ? "justify-end" : "justify-start")}><div className={cx("message-bubble max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 sm:max-w-[65%]", message.mine ? "message-bubble--mine rounded-br-md bg-ink text-white" : "message-bubble--incoming rounded-bl-md bg-white text-slate-700 shadow-sm")}><p>{message.text}</p><p className="mt-1 text-[9px] text-slate-400">{message.mine ? "Tu" : message.sender} · {message.time}</p></div></div>)}{!visibleMessages.length && <div className="grid h-full min-h-96 place-items-center text-center"><div><p className="font-bold text-slate-600">{query ? "Nessun risultato" : "Nessun messaggio"}</p><p className="mt-1 text-xs text-slate-400">{query ? "Prova una ricerca diversa." : "Scrivi il primo messaggio della conversazione."}</p></div></div>}<div ref={endRef} /></div>
        <form ref={formRef} action={formAction} className="message-composer border-t border-slate-100 p-3 sm:p-4"><input type="hidden" name="threadId" value={data.threadId ?? ""} /><div className="flex items-center gap-2"><Input name="body" required maxLength={4000} disabled={pending} containerClassName="!h-11 !min-h-11 min-w-0 flex-1 border-transparent bg-slate-100/80" placeholder="Scrivi un messaggio…" aria-label="Messaggio" /><button disabled={pending} className="motion-control group grid size-11 place-items-center rounded-2xl bg-ink text-white shadow-sm disabled:opacity-50" aria-label="Invia">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}</button></div>{state.status === "error" && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{state.message}</p>}</form>
      </section>
    </div>
  );
}
