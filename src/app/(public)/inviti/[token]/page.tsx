import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Home, ShieldAlert } from "lucide-react";
import { AcceptInvitationForm } from "@/components/invitations/AcceptInvitationForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getCurrentSession } from "@/server/auth/require-session";
import { db } from "@/server/db";
import { hashInvitationToken, maskEmail, normalizeEmail } from "@/features/invitations/tokens";

export const metadata: Metadata = { title: "Invito" };

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = /^[A-Za-z0-9_-]{40,60}$/.test(token)
    ? await db.invitation.findUnique({ where: { tokenHash: hashInvitationToken(token) }, include: { apartment: true, invitedBy: { select: { name: true } } } })
    : null;
  const session = await getCurrentSession();
  const available = Boolean(invitation && invitation.status === "PENDING" && invitation.expiresAt > new Date());
  const correctAccount = Boolean(session?.user && invitation && normalizeEmail(session.user.email) === normalizeEmail(invitation.email));
  const callbackURL = `/inviti/${token}`;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6fa] p-5">
      <section className="w-full max-w-lg rounded-[32px] bg-white p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,.08)] sm:p-9">
        <div className="mx-auto inline-flex rounded-2xl bg-ink p-3"><BrandLogo compact /></div>
        <span className={`mx-auto mt-8 grid size-14 place-items-center rounded-2xl ${available ? "bg-lime/30 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{available ? <Home className="size-6" /> : <ShieldAlert className="size-6" />}</span>
        <h1 className="mt-5 text-3xl font-bold tracking-[-.045em] text-ink">{available ? `Entra in ${invitation?.apartment.name}` : "Invito non disponibile"}</h1>
        {available && invitation ? <><p className="mt-3 text-sm leading-6 text-slate-500"><b>{invitation.invitedBy.name}</b> ti ha invitato come inquilino. L’invito è riservato a <b>{maskEmail(invitation.email)}</b>.</p><p className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-500"><Clock3 className="size-3.5" /> Scade il {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(invitation.expiresAt)}</p></> : <p className="mt-3 text-sm leading-6 text-slate-500">Il collegamento è scaduto, è stato revocato oppure è già stato utilizzato. Chiedi al proprietario un nuovo invito.</p>}
        {available && !session?.user && <div className="mt-7 grid gap-3"><Link href={`/registrazione?callbackURL=${encodeURIComponent(callbackURL)}`} className="flex h-12 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">Crea account</Link><Link href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`} className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-600">Ho già un account</Link></div>}
        {available && session?.user && correctAccount && <AcceptInvitationForm token={token} />}
        {available && session?.user && !correctAccount && <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-left text-xs leading-5 text-amber-800"><CheckCircle2 className="mb-2 size-4" />Hai effettuato l’accesso come <b>{session.user.email}</b>. Per continuare devi usare l’indirizzo destinatario dell’invito.<div className="mt-3 flex flex-wrap gap-x-4 gap-y-2"><SignOutButton callbackURL={callbackURL} destination="/login" label="Esci e accedi" /><SignOutButton callbackURL={callbackURL} destination="/registrazione" label="Esci e crea account" /></div></div>}
        {!available && <Link href="/" className="mt-6 inline-flex text-xs font-bold text-violet hover:underline">Torna a CasaHub</Link>}
      </section>
    </main>
  );
}
