"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, ReceiptText, ShieldCheck, UserRound, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Field, Input } from "@/components/ui/FormField";

const features: Array<{ icon: LucideIcon; label: string }> = [
  { icon: ReceiptText, label: "Scadenze" },
  { icon: Wrench, label: "Interventi" },
  { icon: MessageCircle, label: "Messaggi" },
];

export function RegisterPage({ onRegister }: { onRegister: (name: string, email: string, password: string) => Promise<string | void> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Le password non coincidono.");
      return;
    }

    setPending(true);
    const message = await onRegister(name.trim(), email.trim(), password);
    if (message) setError(message);
    setPending(false);
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f5f6fa] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-28 top-1/3 size-80 rounded-full bg-violet/25 blur-3xl" />
        <div className="absolute -right-16 bottom-8 size-72 rounded-full bg-lime/15 blur-3xl" />
        <BrandLogo />
        <div className="relative my-auto max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-bold text-lime"><ShieldCheck className="size-4" /> Il tuo spazio CasaHub</span>
          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-[-.065em]">Crea il tuo account.<br />La casa resta condivisa.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Registrati con la stessa email usata nell’invito. L’accesso ai dati della casa si attiva solo dopo l’associazione a un appartamento.</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, label }) => <div key={label} className="rounded-[20px] border border-white/10 bg-white/[.055] p-4"><Icon className="size-5 text-lime" /><p className="mt-3 text-xs font-bold">{label}</p></div>)}
          </div>
        </div>
        <p className="relative text-xs text-slate-600">CasaHub · Portale gestione appartamento</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 lg:hidden"><div className="inline-flex rounded-2xl bg-ink p-3"><BrandLogo compact /></div></div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-violet">Nuovo account</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-.055em] text-ink">Entra in CasaHub.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Inserisci i tuoi dati. Per vedere un appartamento dovrai essere associato dal proprietario.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field htmlFor="register-name" label="Nome e cognome">
              <Input id="register-name" required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} startAdornment={<UserRound className="size-[18px]" />} placeholder="Mario Rossi" />
            </Field>
            <Field htmlFor="register-email" label="Email">
              <Input id="register-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} startAdornment={<Mail className="size-[18px]" />} placeholder="nome@email.it" />
            </Field>
            <Field htmlFor="register-password" label="Password" hint="Minimo 12 caratteri">
              <Input id="register-password" type={passwordVisible ? "text" : "password"} required minLength={12} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} startAdornment={<LockKeyhole className="size-[18px]" />} placeholder="Scegli una password sicura" endAdornment={<button type="button" onClick={() => setPasswordVisible((visible) => !visible)} className="motion-control grid size-8 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label={passwordVisible ? "Nascondi password" : "Mostra password"}>{passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} />
            </Field>
            <Field htmlFor="register-password-confirmation" label="Conferma password">
              <Input id="register-password-confirmation" type={passwordVisible ? "text" : "password"} required minLength={12} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} startAdornment={<LockKeyhole className="size-[18px]" />} placeholder="Ripeti la password" />
            </Field>
            {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}
            <button disabled={pending} className="motion-control group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-bold text-white shadow-[0_12px_32px_rgba(17,24,39,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(17,24,39,.24)] disabled:cursor-wait disabled:opacity-60">{pending ? "Creazione account…" : "Crea account"} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" /></button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">Hai già un account? <Link href="/login" className="font-bold text-violet hover:underline">Accedi</Link></p>
        </div>
      </section>
    </main>
  );
}
