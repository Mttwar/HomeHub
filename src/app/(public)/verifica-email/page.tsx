import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { VerificationEmailForm } from "@/components/auth/VerificationEmailForm";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Verifica email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; callbackURL?: string }> }) {
  const { email = "", callbackURL } = await searchParams;
  const destination = safeRedirectPath(callbackURL, "/onboarding");
  return <main className="grid min-h-screen place-items-center bg-[#f5f6fa] p-5"><section className="w-full max-w-md rounded-[32px] bg-white p-7 text-center shadow-[0_18px_60px_rgba(15,23,42,.08)] sm:p-9"><div className="mx-auto inline-flex rounded-2xl bg-ink p-3"><BrandLogo compact /></div><span className="mx-auto mt-8 grid size-14 place-items-center rounded-2xl bg-lime/30 text-emerald-700"><MailCheck className="size-6" /></span><h1 className="mt-5 text-3xl font-bold tracking-[-.045em] text-ink">Controlla la tua email.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Abbiamo inviato un collegamento di verifica a <b>{email || "il tuo indirizzo"}</b>. Dopo la conferma potrai completare l’accesso.</p>{email && <VerificationEmailForm email={email} callbackURL={destination} />}<Link href="/login" className="mt-6 inline-flex text-xs font-bold text-violet hover:underline">Torna al login</Link></section></main>;
}
