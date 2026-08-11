"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, ReceiptText, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Field, Input } from "@/components/ui/FormField";

const features: Array<{ icon: LucideIcon; label: string }> = [
  { icon: ReceiptText, label: "Scadenze" },
  { icon: Wrench, label: "Interventi" },
  { icon: MessageCircle, label: "Messaggi" },
];

export function LoginPage({ googleConfigured = false, onLogin, onGoogleLogin }: { googleConfigured?: boolean; onLogin: (email: string, password: string) => Promise<string | void>; onGoogleLogin?: (() => Promise<string | void>) | undefined }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    const message = await onLogin(email, password);
    if (message) setError(message);
    setPending(false);
  };

  const googleLogin = async () => {
    if (!onGoogleLogin) return;
    setError("");
    setGooglePending(true);
    const message = await onGoogleLogin();
    if (message) {
      setError(message);
      setGooglePending(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f5f6fa] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-28 top-1/3 size-80 rounded-full bg-violet/25 blur-3xl" />
        <div className="absolute -right-16 bottom-8 size-72 rounded-full bg-lime/15 blur-3xl" />
        <BrandLogo />
        <div className="relative my-auto max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-bold text-lime"><ShieldCheck className="size-4" /> La casa, in un unico posto</span>
          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-[-.065em]">Meno messaggi sparsi.<br />Più casa sotto controllo.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Bollette, spese, documenti, segnalazioni e appuntamenti condivisi tra proprietario e inquilino.</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, label }) => <div key={label} className="rounded-[20px] border border-white/10 bg-white/[.055] p-4"><Icon className="size-5 text-lime" /><p className="mt-3 text-xs font-bold">{label}</p></div>)}
          </div>
        </div>
        <p className="relative text-xs text-slate-600">CasaHub · Portale gestione appartamento</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><div className="inline-flex rounded-2xl bg-ink p-3"><BrandLogo compact /></div></div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-violet">Accesso sicuro</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-.055em] text-ink">Bentornato in CasaHub.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Accedi con il tuo account. Profilo e permessi vengono verificati dal server.</p>
          <button type="button" onClick={googleLogin} disabled={!googleConfigured || googlePending || pending} aria-describedby={!googleConfigured ? "google-login-configuration" : undefined} className="motion-control mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-ink shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-white text-base font-black text-[#4285f4] shadow-sm">G</span>{googlePending ? "Collegamento a Google…" : "Continua con Google"}</button>
          {!googleConfigured && <p id="google-login-configuration" className="mt-2 text-center text-[10px] font-semibold text-amber-700">Google OAuth non è ancora configurato sul server.</p>}
          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />oppure<span className="h-px flex-1 bg-slate-200" /></div>
          <form onSubmit={submit} className="space-y-4">
            <Field htmlFor="login-email" label="Email">
              <Input id="login-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} startAdornment={<Mail className="size-[18px]" />} placeholder="nome@email.it" />
            </Field>
            <Field htmlFor="login-password" label="Password" hint="Minimo 12 caratteri">
              <Input id="login-password" type={passwordVisible ? "text" : "password"} required minLength={12} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} startAdornment={<LockKeyhole className="size-[18px]" />} placeholder="La tua password" endAdornment={<button type="button" onClick={() => setPasswordVisible((visible) => !visible)} className="motion-control grid size-8 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label={passwordVisible ? "Nascondi password" : "Mostra password"}>{passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} />
            </Field>
            <div className="text-right"><Link href="/password-dimenticata" className="text-[11px] font-bold text-violet hover:underline">Password dimenticata?</Link></div>
            {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}
            <button disabled={pending} className="motion-control group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-bold text-white shadow-[0_12px_32px_rgba(17,24,39,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(17,24,39,.24)] disabled:cursor-wait disabled:opacity-60">{pending ? "Accesso in corso…" : "Accedi al portale"} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" /></button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">Non hai ancora un account? <Link href="/registrazione" className="font-bold text-violet hover:underline">Registrati</Link></p>
        </div>
      </section>
    </main>
  );
}
