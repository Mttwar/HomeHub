"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, Building2, CalendarDays, FileText, Flag, House, LoaderCircle, ReceiptText, Shapes, WalletCards, Wrench, X, Zap, type LucideIcon } from "lucide-react";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { AttachmentInput } from "@/components/ui/AttachmentInput";
import { Field, Input, Textarea } from "@/components/ui/FormField";
import { SelectControl, type SelectOption } from "@/components/ui/SelectControl";
import { createPortalRecord } from "@/features/records/actions";
import { initialCreateRecordState } from "@/features/records/state";
import type { ModalKind } from "@/types";

type ModalCopy = { title: string; description: string; label: string; eyebrow: string; icon: LucideIcon };

const modalCopy: Record<Exclude<ModalKind, null>, ModalCopy> = {
  bill: { title: "Carica una bolletta", description: "Aggiungi importo e scadenza in pochi passaggi.", label: "Salva bolletta", eyebrow: "Pagamenti", icon: ReceiptText },
  expense: { title: "Registra una spesa", description: "Mantieni aggiornato il riepilogo economico.", label: "Salva spesa", eyebrow: "Contabilità", icon: WalletCards },
  rent: { title: "Imposta il canone", description: "Registra importo, decorrenza e giorno mensile di scadenza.", label: "Salva canone", eyebrow: "Affitto", icon: House },
  issue: { title: "Nuova segnalazione", description: "Descrivi il problema e assegna la priorità corretta.", label: "Invia segnalazione", eyebrow: "Manutenzione", icon: Wrench },
  event: { title: "Programma un evento", description: "Scegli giorno e orario senza uscire dal portale.", label: "Crea evento", eyebrow: "Calendario", icon: CalendarDays },
  document: { title: "Registra un documento", description: "Crea una scheda ordinata per il file condiviso.", label: "Salva documento", eyebrow: "Archivio", icon: FileText },
};

const categoryOptions: SelectOption[] = [
  { value: "Energia", label: "Energia", icon: <Zap className="size-4" /> },
  { value: "Manutenzione", label: "Manutenzione", icon: <Wrench className="size-4" /> },
  { value: "Affitto", label: "Affitto", icon: <House className="size-4" /> },
  { value: "Condominio", label: "Condominio", icon: <Building2 className="size-4" /> },
  { value: "Altro", label: "Altro", icon: <Shapes className="size-4" /> },
];

const priorityOptions: SelectOption[] = [
  { value: "LOW", label: "Bassa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente", icon: <Flag className="size-4 text-rose-500" /> },
];

const visibilityOptions: SelectOption[] = [
  { value: "SHARED", label: "Condiviso con l’inquilino" },
  { value: "OWNER_ONLY", label: "Solo proprietario" },
];

export function ActionModal({ kind, onClose, onSaved }: { kind: ModalKind; onClose: () => void; onSaved: (message: string) => void }) {
  const [state, formAction, pending] = useActionState(createPortalRecord, initialCreateRecordState);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      onSaved(state.message);
      onClose();
    }
  }, [onClose, onSaved, state]);

  useEffect(() => {
    if (!kind) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      titleInputRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [kind]);

  if (!kind) return null;
  const copy = modalCopy[kind];
  const Icon = copy.icon;
  const needsAmount = kind === "bill" || kind === "expense" || kind === "rent";
  const showsDate = kind !== "issue" && kind !== "document";
  const categorySpan = needsAmount ? "sm:col-span-2" : kind === "event" || kind === "issue" ? "sm:col-span-3" : "sm:col-span-6";
  const dateSpan = needsAmount ? "sm:col-span-2" : "sm:col-span-3";
  const titleError = state.fieldErrors?.title?.[0];
  const categoryError = state.fieldErrors?.category?.[0];
  const dateError = state.fieldErrors?.date?.[0];
  const amountError = state.fieldErrors?.amount?.[0];
  const attachmentError = state.fieldErrors?.attachment?.[0];
  const priorityError = state.fieldErrors?.priority?.[0];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-backdrop-enter absolute inset-0 bg-slate-950/45 backdrop-blur-md" onClick={onClose} aria-label="Chiudi finestra" />
      <form action={formAction} className="action-modal-form modal-surface-enter relative max-h-[calc(100dvh-2rem)] w-full max-w-[620px] overflow-y-auto rounded-[30px] border border-white/80 bg-white shadow-[0_32px_100px_rgba(15,23,42,.28)]">
        <input type="hidden" name="kind" value={kind} />
        <header className="action-modal-header flex items-start gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5 sm:p-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-violet/10 text-violet shadow-[inset_0_0_0_1px_rgba(118,87,255,.08)]"><Icon className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-violet">{copy.eyebrow}</p>
            <h2 id="modal-title" className="mt-1 text-xl font-bold tracking-[-.04em] text-ink sm:text-2xl">{copy.title}</h2>
            <p className="mt-1.5 text-sm leading-5 text-slate-500">{copy.description}</p>
          </div>
          <button type="button" onClick={onClose} className="motion-control grid size-10 shrink-0 place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-ink" aria-label="Chiudi"><X className="size-[18px]" /></button>
        </header>

        <div className="action-modal-body grid gap-5 p-5 sm:grid-cols-6 sm:p-7">
          <Field htmlFor="record-title" label="Titolo" error={titleError} className="sm:col-span-6">
            <Input ref={titleInputRef} id="record-title" name="title" required minLength={2} maxLength={120} aria-invalid={Boolean(titleError)} aria-describedby={titleError ? "record-title-error" : undefined} placeholder={kind === "issue" ? "Es. Perdita dal rubinetto" : "Dai un nome chiaro a questa voce"} />
          </Field>

          <Field htmlFor="record-category" label="Categoria" error={categoryError} className={categorySpan}>
            <SelectControl id="record-category" name="category" required options={categoryOptions} ariaInvalid={Boolean(categoryError)} placeholder="Scegli categoria" />
          </Field>

          {showsDate && (
            <Field htmlFor="record-date" label={kind === "event" ? "Data e ora" : kind === "rent" ? "Decorrenza e giorno scadenza" : kind === "bill" ? "Scadenza" : "Data"} error={dateError} optional={kind === "expense"} className={dateSpan}>
              <DateTimePicker id="record-date" name="date" required={kind === "bill" || kind === "event" || kind === "rent"} withTime={kind === "event"} ariaInvalid={Boolean(dateError)} />
            </Field>
          )}

          {needsAmount && (
            <Field htmlFor="record-amount" label="Importo" error={amountError} className="sm:col-span-2">
              <Input id="record-amount" name="amount" required type="number" min="0.01" max="1000000" step="0.01" inputMode="decimal" aria-invalid={Boolean(amountError)} aria-describedby={amountError ? "record-amount-error" : undefined} startAdornment={<span className="text-sm font-extrabold text-slate-500">€</span>} placeholder="0,00" />
            </Field>
          )}

          {kind === "bill" && (
            <Field htmlFor="record-attachment" label="Allegato bolletta" optional error={attachmentError} className="sm:col-span-6">
              <AttachmentInput id="record-attachment" name="attachment" invalid={Boolean(attachmentError)} describedBy={attachmentError ? "record-attachment-error" : undefined} />
            </Field>
          )}

          {kind === "issue" && (
            <Field htmlFor="record-priority" label="Priorità" error={priorityError} className="sm:col-span-3">
              <SelectControl id="record-priority" name="priority" defaultValue="MEDIUM" options={priorityOptions} ariaInvalid={Boolean(priorityError)} />
            </Field>
          )}

          {kind === "document" && (
            <Field htmlFor="record-visibility" label="Visibilità" className="sm:col-span-6">
              <SelectControl id="record-visibility" name="visibility" defaultValue="SHARED" options={visibilityOptions} />
            </Field>
          )}

          <Field htmlFor="record-notes" label={kind === "issue" ? "Descrizione" : "Note"} optional className="sm:col-span-6">
            <Textarea id="record-notes" name="notes" maxLength={4000} className="min-h-24 resize-none" placeholder={kind === "issue" ? "Descrivi cosa è successo e dove si trova il problema…" : "Aggiungi dettagli utili per gli altri membri della casa…"} />
          </Field>

          {state.status === "error" && <p role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold leading-5 text-rose-700 sm:col-span-6"><AlertCircle className="mt-0.5 size-4 shrink-0" />{state.message}</p>}
        </div>

        <footer className="action-modal-footer sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <button type="button" onClick={onClose} className="motion-control h-11 rounded-2xl px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-ink">Annulla</button>
          <button disabled={pending} className="motion-control inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,23,42,.2)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">{pending && <LoaderCircle className="size-4 animate-spin" />}{pending ? "Salvataggio…" : copy.label}</button>
        </footer>
      </form>
    </div>
  );
}
