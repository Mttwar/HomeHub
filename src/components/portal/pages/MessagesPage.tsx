import { History, LoaderCircle, Send } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { PageHeading } from "@/components/ui/PageHeading";
import { Input } from "@/components/ui/FormField";
import { sendMessage } from "@/features/portal/actions";
import { initialPortalMutationState } from "@/features/portal/state";
import type { MessagesViewData } from "@/features/portal/types";
import { usePollingQuery } from "@/hooks/usePollingQuery";
import { cx } from "@/lib/cx";

const emptyData: MessagesViewData = {
  available: false,
  version: "",
  selectedCounterpartId: null,
  threadId: null,
  title: "Messaggi",
  counterpartName: "Casa",
  counterpartInitial: "C",
  canSend: false,
  conversations: [],
  messages: [],
};

export function MessagesPage({ data = emptyData, query }: { data?: MessagesViewData | undefined; query: string }) {
  const [state, formAction, pending] = useActionState(sendMessage, initialPortalMutationState);
  const [liveData, setLiveData] = useState(data);
  const [selectedCounterpartId, setSelectedCounterpartId] = useState(data.selectedCounterpartId);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
  }, [state]);

  const pollUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCounterpartId) params.set("counterpartId", selectedCounterpartId);
    if (state.status === "success") params.set("mutation", state.message);
    return `/api/portal/messages${params.size ? `?${params.toString()}` : ""}`;
  }, [selectedCounterpartId, state]);

  usePollingQuery<MessagesViewData>({
    url: pollUrl,
    intervalMs: 1500,
    onData: (nextData) => {
      setLiveData((current) => current.version === nextData.version ? current : nextData);
      setSelectedCounterpartId(nextData.selectedCounterpartId);
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [liveData.messages.length, liveData.selectedCounterpartId]);

  const visibleMessages = liveData.messages.filter((message) => `${message.sender} ${message.text}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Conversazioni" title="Messaggi" description="Chat separate per inquilino, con storico persistente e aggiornamento automatico." />
      <section className="message-panel grid min-h-[650px] overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_12px_45px_rgba(15,23,42,.065)] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-slate-100 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <History className="size-4 text-violet" />
            <div><p className="text-sm font-bold">Storico chat</p><p className="text-[10px] text-slate-400">{liveData.conversations.length} conversazioni</p></div>
          </div>
          <div className="flex gap-2 overflow-x-auto p-3 lg:block lg:max-h-[590px] lg:space-y-1 lg:overflow-y-auto">
            {liveData.conversations.map((conversation) => {
              const selected = conversation.counterpartId === liveData.selectedCounterpartId || (liveData.selectedCounterpartId === null && conversation.counterpartId === selectedCounterpartId);
              return (
                <button
                  key={conversation.counterpartId}
                  type="button"
                  onClick={() => setSelectedCounterpartId(conversation.counterpartId)}
                  className={cx("motion-control flex min-w-64 items-center gap-3 rounded-2xl p-3 text-left transition lg:w-full lg:min-w-0", selected ? "bg-ink text-white" : "hover:bg-slate-50")}
                >
                  <span className={cx("grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold", selected ? "bg-lime text-ink" : "bg-violet text-white")}>{conversation.initial}</span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><b className="truncate text-xs">{conversation.name}</b>{conversation.lastMessageAt && <small className={cx("shrink-0 text-[9px]", selected ? "text-slate-400" : "text-slate-400")}>{conversation.lastMessageAt}</small>}</span><span className={cx("mt-1 block truncate text-[10px]", selected ? "text-slate-400" : "text-slate-500")}>{conversation.lastMessage}</span>{!conversation.canSend && <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-amber-500">Solo storico</span>}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6"><span className="grid size-10 place-items-center rounded-full bg-violet text-xs font-bold text-white">{liveData.counterpartInitial}</span><div><p className="text-sm font-bold">{liveData.title}</p><p className="text-[10px] text-slate-400">Con {liveData.counterpartName} · aggiornamento automatico</p></div></div>
          <div aria-live="polite" className="message-stage soft-grid flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">{visibleMessages.map((message) => <div key={message.id} className={cx("flex", message.mine ? "justify-end" : "justify-start")}><div className={cx("message-bubble max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 sm:max-w-[65%]", message.mine ? "message-bubble--mine rounded-br-md bg-ink text-white" : "message-bubble--incoming rounded-bl-md bg-white text-slate-700 shadow-sm")}><p>{message.text}</p><p className="mt-1 text-[9px] text-slate-400">{message.mine ? "Tu" : message.sender} · {message.time}</p></div></div>)}{!visibleMessages.length && <div className="grid h-full min-h-96 place-items-center text-center"><div><p className="font-bold text-slate-600">{query ? "Nessun risultato" : "Nessun messaggio"}</p><p className="mt-1 text-xs text-slate-400">{query ? "Prova una ricerca diversa." : "Scrivi il primo messaggio della conversazione."}</p></div></div>}<div ref={endRef} /></div>
          {liveData.canSend && liveData.selectedCounterpartId ? (
            <form ref={formRef} action={formAction} className="message-composer border-t border-slate-100 p-3 sm:p-4">
              <input type="hidden" name="threadId" value={liveData.threadId ?? ""} />
              <input type="hidden" name="counterpartId" value={liveData.selectedCounterpartId} />
              <div className="flex items-center gap-2"><Input name="body" required maxLength={4000} disabled={pending} containerClassName="!h-11 !min-h-11 min-w-0 flex-1 border-transparent bg-slate-100/80" placeholder="Scrivi un messaggio…" aria-label="Messaggio" /><button disabled={pending} className="motion-control group grid size-11 place-items-center rounded-2xl bg-ink text-white shadow-sm disabled:opacity-50" aria-label="Invia">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}</button></div>{state.status === "error" && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{state.message}</p>}
            </form>
          ) : <div className="border-t border-slate-100 bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-700">Questa conversazione è disponibile in sola lettura.</div>}
        </div>
      </section>
    </div>
  );
}
