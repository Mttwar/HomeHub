"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Mail, Send } from "lucide-react";
import { createInvitation, type InvitationState } from "@/features/invitations/actions";
import { Field, Input } from "@/components/ui/FormField";

const initialState: InvitationState = { status: "idle" };

export function InvitationManager() {
  const [state, action, pending] = useActionState(createInvitation, initialState);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!state.inviteUrl) return;
    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-5">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field htmlFor="invitation-email" label="Email dell’inquilino" className="flex-1">
          <Input id="invitation-email" name="email" type="email" required autoComplete="email" startAdornment={<Mail className="size-4" />} placeholder="inquilino@email.it" />
        </Field>
        <button disabled={pending} className="motion-control flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60"><Send className="size-4" /> {pending ? "Creazione…" : "Invita"}</button>
      </form>
      {state.message && <p role="status" className={`mt-3 rounded-xl px-4 py-3 text-xs font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p>}
      {state.inviteUrl && <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2"><input readOnly value={state.inviteUrl} aria-label="Link invito" className="min-w-0 flex-1 bg-transparent px-2 text-xs text-slate-600 outline-none" /><button type="button" onClick={copy} className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-violet shadow-sm">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copiato" : "Copia"}</button></div>}
    </div>
  );
}
