"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function VerificationEmailForm({ email, callbackURL }: { email: string; callbackURL: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const resend = async () => {
    setPending(true);
    const result = await authClient.sendVerificationEmail({ email, callbackURL });
    setMessage(result.error ? "Invio non riuscito. Riprova tra qualche minuto." : "Nuova email inviata.");
    setPending(false);
  };
  return <div className="mt-6"><button type="button" disabled={pending} onClick={resend} className="h-11 w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-60">{pending ? "Invio…" : "Invia di nuovo"}</button>{message && <p role="status" className="mt-3 text-xs font-semibold text-slate-500">{message}</p>}</div>;
}
