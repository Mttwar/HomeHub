"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authFlowUrl } from "@/lib/auth-flow-url";

export function SignOutButton({ callbackURL, destination = "/login", label = "Esci e cambia account" }: { callbackURL?: string; destination?: "/login" | "/registrazione"; label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const signOut = async () => {
    setPending(true);
    setError("");
    const result = await authClient.signOut();
    if (result.error) {
      setError("Non è stato possibile uscire. Riprova.");
      setPending(false);
      return;
    }

    // A full navigation makes sure Safari sends the newly updated session
    // cookie and does not reuse a prefetched server component.
    window.location.assign(authFlowUrl(destination, callbackURL));
  };
  return <div><button type="button" onClick={signOut} disabled={pending} className="text-xs font-bold text-amber-900 underline disabled:opacity-60">{pending ? "Uscita…" : label}</button>{error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}</div>;
}
