"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Field, Input } from "@/components/ui/FormField";

export function PasswordResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) return setError("Le password non coincidono.");
    setPending(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (result.error) return setError("Il collegamento non è valido o è scaduto.");
    router.replace("/login?passwordReset=1");
  };
  return <form onSubmit={submit} className="mt-7 space-y-4"><Field htmlFor="new-password" label="Nuova password" hint="Minimo 12 caratteri"><Input id="new-password" type={visible ? "text" : "password"} required minLength={12} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} startAdornment={<LockKeyhole className="size-4" />} endAdornment={<button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Nascondi password" : "Mostra password"}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} /></Field><Field htmlFor="confirm-new-password" label="Conferma password"><Input id="confirm-new-password" type={visible ? "text" : "password"} required minLength={12} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} startAdornment={<LockKeyhole className="size-4" />} /></Field>{error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}<button disabled={pending || !token} className="h-12 w-full rounded-2xl bg-ink text-sm font-bold text-white disabled:opacity-60">{pending ? "Salvataggio…" : "Salva nuova password"}</button></form>;
}
