"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ callbackURL, label = "Esci e cambia account" }: { callbackURL?: string; label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const signOut = async () => {
    setPending(true);
    await authClient.signOut();
    router.replace(`/login${callbackURL ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""}`);
    router.refresh();
  };
  return <button type="button" onClick={signOut} disabled={pending} className="mt-3 text-xs font-bold text-amber-900 underline disabled:opacity-60">{pending ? "Uscita…" : label}</button>;
}
