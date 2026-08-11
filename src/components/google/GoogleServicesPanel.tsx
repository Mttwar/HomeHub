"use client";

import { useActionState, useState } from "react";
import { CalendarDays, KeyRound, LoaderCircle, Mail, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { disableGoogleCalendar, disableGoogleGmail, revokeGoogleAccount, sendGoogleEmail, syncGoogleCalendar } from "@/features/google/actions";
import { initialGoogleActionState } from "@/features/google/state";
import type { ProfileData } from "@/features/portal/types";
import { authClient } from "@/lib/auth-client";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";

function Status({ active, label }: { active: boolean; label?: string }) {
  return <span className={`rounded-xl px-3 py-2 text-[10px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{label ?? (active ? "Attivo" : "Non attivo")}</span>;
}

function ActionMessage({ state }: { state: { status: string; message: string } }) {
  if (state.status === "idle") return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{state.message}</p>;
}

export function GoogleServicesPanel({ google, returnPath }: { google: ProfileData["google"]; returnPath: string }) {
  const [linkError, setLinkError] = useState("");
  const [linking, setLinking] = useState<"account" | "calendar" | "gmail" | null>(null);
  const [syncState, syncAction, syncPending] = useActionState(syncGoogleCalendar, initialGoogleActionState);
  const [emailState, emailAction, emailPending] = useActionState(sendGoogleEmail, initialGoogleActionState);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeGoogleAccount, initialGoogleActionState);

  const linkGoogle = async (service: "account" | "calendar" | "gmail") => {
    setLinkError("");
    if (!google.configured) {
      setLinkError("Configura prima GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET sul server.");
      return;
    }
    setLinking(service);
    const scopes = service === "calendar" ? [CALENDAR_SCOPE] : service === "gmail" ? [GMAIL_SCOPE] : undefined;
    const activation = service === "account"
      ? returnPath
      : `/api/integrations/google/activate?service=${service}&returnTo=${encodeURIComponent(returnPath)}`;
    const result = await authClient.linkSocial({ provider: "google", callbackURL: activation, errorCallbackURL: `${returnPath}?google=error`, ...(scopes ? { scopes } : {}) });
    if (result.error) {
      setLinkError(result.error.message ?? "Collegamento Google non riuscito");
      setLinking(null);
    }
  };

  return (
    <section className="portal-card rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.055)]">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-violet">Connessione cifrata</p><h2 className="mt-1 text-lg font-bold">Servizi Google</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Login, calendario e invio email hanno consensi separati. I token OAuth sono cifrati e i contenuti Gmail in coda usano AES-256-GCM.</p></div><ShieldCheck className="size-6 text-emerald-600" /></div>
      {!google.configured && <p role="alert" className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">I comandi sono visibili ma disabilitati: configura GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET sul server.</p>}
      {!google.encryptionConfigured && <p role="alert" className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">DATA_ENCRYPTION_KEY non configurata: Gmail resterà disabilitato.</p>}
      {linkError && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{linkError}</p>}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <article className="portal-subcard rounded-2xl border border-slate-100 p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-[#4285f4]"><KeyRound className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">Account Google</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">Accesso con profilo verificato, senza permessi su posta o calendario.</p></div><Status active={google.accountLinked} label={google.accountLinked ? "Collegato" : "Scollegato"} /></div>{!google.accountLinked && <button type="button" onClick={() => linkGoogle("account")} disabled={Boolean(linking) || !google.configured} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{linking === "account" && <LoaderCircle className="size-3 animate-spin" />}Collega Google</button>}</article>

        <article className="portal-subcard rounded-2xl border border-slate-100 p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-violet/10 text-violet"><CalendarDays className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">Google Calendar</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">{google.calendarName ?? "Calendario CasaHub dedicato, senza leggere gli eventi personali."}</p></div><Status active={google.calendarEnabled} /></div><div className="mt-4 flex flex-wrap gap-2">{google.calendarEnabled ? <><form action={syncAction}><button disabled={syncPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-bold text-white"><RefreshCw className={`size-3 ${syncPending ? "animate-spin" : ""}`} />Sincronizza</button></form><form action={disableGoogleCalendar}><button className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-600">Disattiva</button></form></> : <button type="button" onClick={() => linkGoogle("calendar")} disabled={Boolean(linking) || !google.configured} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{linking === "calendar" && <LoaderCircle className="size-3 animate-spin" />}Attiva Calendar</button>}</div>{google.lastSyncedAt && <p className="mt-3 text-[10px] text-slate-400">Ultima sincronizzazione: {google.lastSyncedAt}</p>}<ActionMessage state={syncState} /></article>

        <article className="portal-subcard rounded-2xl border border-slate-100 p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Mail className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">Invio con Gmail</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">Solo invio: CasaHub non può leggere la casella di posta.</p></div><Status active={google.gmailEnabled} /></div><div className="mt-4 flex gap-2">{google.gmailEnabled ? <form action={disableGoogleGmail}><button className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-600">Disattiva</button></form> : <button type="button" onClick={() => linkGoogle("gmail")} disabled={Boolean(linking) || !google.configured || !google.encryptionConfigured} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{linking === "gmail" && <LoaderCircle className="size-3 animate-spin" />}Attiva Gmail</button>}</div></article>
      </div>

      {google.gmailEnabled && <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[1fr_260px]"><form action={emailAction} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Destinatario<input name="to" type="email" required maxLength={254} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" /></label><label className="text-xs font-bold text-slate-600">Oggetto<input name="subject" required minLength={2} maxLength={160} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Messaggio<textarea name="body" required maxLength={10000} className="mt-1 min-h-28 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" /></label><div className="flex items-center gap-3 sm:col-span-2"><button disabled={emailPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-bold text-white disabled:opacity-60">{emailPending && <LoaderCircle className="size-3 animate-spin" />}Invia con Gmail</button><span className="text-[10px] text-slate-400">Massimo 10/ora e 50/giorno</span></div><div className="sm:col-span-2"><ActionMessage state={emailState} /></div></form><aside><h3 className="text-xs font-bold">Invii recenti</h3><div className="mt-2 space-y-2">{google.recentEmails.map((email) => <div key={email.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px]"><span className="text-slate-500">{email.createdAt}</span><Status active={email.status === "SENT"} label={email.status} /></div>)}{!google.recentEmails.length && <p className="text-[11px] text-slate-400">Nessun invio.</p>}</div></aside></div>}

      {google.accountLinked && <div className="mt-5 border-t border-slate-100 pt-5"><form action={revokeAction}><button disabled={revokePending || !google.credentialLinked} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-50 px-4 text-xs font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"><Unplug className="size-3" />Revoca e scollega Google</button></form>{!google.credentialLinked && <p className="mt-2 text-[10px] text-slate-400">Google è il tuo unico metodo di accesso: configura prima una password.</p>}<ActionMessage state={revokeState} /></div>}
      {google.lastErrorCode && <p className="mt-4 text-[10px] font-semibold text-rose-600">Ultimo errore sanitizzato: {google.lastErrorCode}</p>}
    </section>
  );
}
