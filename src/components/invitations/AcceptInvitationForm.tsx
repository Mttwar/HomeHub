"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { acceptInvitation, type InvitationState } from "@/features/invitations/actions";

const initialState: InvitationState = { status: "idle" };

export function AcceptInvitationForm({ token }: { token: string }) {
  const actionWithToken = acceptInvitation.bind(null, token);
  const [state, action, pending] = useActionState(actionWithToken, initialState);
  return <form action={action} className="mt-6">{state.message && <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{state.message}</p>}<button disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Attivazione…" : "Accetta e apri CasaHub"}<ArrowRight className="size-4" /></button></form>;
}
