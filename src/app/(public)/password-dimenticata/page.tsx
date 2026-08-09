import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PasswordResetRequestForm } from "@/components/auth/PasswordResetRequestForm";

export const metadata: Metadata = { title: "Recupera password" };

export default function PasswordForgottenPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f6fa] p-5"><section className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,.08)] sm:p-9"><div className="inline-flex rounded-2xl bg-ink p-3"><BrandLogo compact /></div><span className="mt-8 grid size-12 place-items-center rounded-2xl bg-violet/10 text-violet"><KeyRound className="size-5" /></span><h1 className="mt-5 text-3xl font-bold tracking-[-.045em] text-ink">Recupera l’accesso.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Inserisci la tua email. La risposta rimane sempre generica per proteggere l’esistenza degli account.</p><PasswordResetRequestForm /><Link href="/login" className="mt-6 inline-flex text-xs font-bold text-violet hover:underline">Torna al login</Link></section></main>;
}
