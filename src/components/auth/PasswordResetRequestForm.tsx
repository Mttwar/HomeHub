"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Field, Input } from "@/components/ui/FormField";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reimposta-password" });
    setPending(false);
    setSent(true);
  };
  if (sent) return <p role="status" className="mt-7 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">Se esiste un account associato a questa email, riceverai a breve le istruzioni.</p>;
  return <form onSubmit={submit} className="mt-7 space-y-4"><Field htmlFor="reset-email" label="Email"><Input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} startAdornment={<Mail className="size-4" />} placeholder="nome@email.it" /></Field><button disabled={pending} className="h-12 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60">{pending ? "Invio…" : "Invia istruzioni"}</button></form>;
}
