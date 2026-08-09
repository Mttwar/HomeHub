import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { ApartmentFlowHeader } from "@/components/onboarding/ApartmentFlowHeader";
import { CreateApartmentForm } from "@/components/onboarding/CreateApartmentForm";
import { listActiveMemberships } from "@/server/auth/active-apartment";
import { requireSession } from "@/server/auth/require-session";

export const metadata: Metadata = { title: "Configura CasaHub" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ nuovo?: string }> }) {
  const session = await requireSession("/onboarding");
  const { nuovo } = await searchParams;
  const memberships = await listActiveMemberships(session.user.id);
  if (memberships.length && nuovo !== "1") redirect("/");

  return (
    <main className="apartment-flow-enter min-h-screen bg-[#e9eee8] px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <ApartmentFlowHeader backHref="/appartamenti" backLabel="Torna agli appartamenti" />

        <div className="apartment-flow-panel mt-6 grid overflow-hidden rounded-[32px] border border-white/80 bg-[#f8faf6] shadow-[0_24px_70px_rgba(17,24,39,.10)] lg:grid-cols-[.82fr_1.18fr]">
          <aside className="flex flex-col bg-ink p-7 text-white sm:p-10 lg:p-12">
            <span className="grid size-12 place-items-center rounded-2xl bg-lime text-ink"><Building2 className="size-5" aria-hidden="true" /></span>
            <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[.18em] text-lime">Nuovo spazio</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold tracking-[-.055em] sm:text-5xl">Una casa ordinata, fin dal primo giorno.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Inserisci i dati essenziali. Potrai completare la configurazione e invitare gli inquilini subito dopo.</p>

            <div className="mt-8 space-y-3">
              {[
                "Uno spazio separato e protetto",
                "Tu sarai il proprietario verificato",
                "Gli inquilini entrano solo su invito",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="size-4 shrink-0 text-lime" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[.06] p-4 lg:mt-auto">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lime"><Link2 className="size-5" aria-hidden="true" /></span>
                <div>
                  <h2 className="text-sm font-bold">Sei stato invitato?</h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-400">Torna indietro e usa il link personale ricevuto dal proprietario.</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="p-6 sm:p-9 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-violet"><ShieldCheck className="size-4" aria-hidden="true" /> Account pronto</span>
            <h2 className="mt-5 text-3xl font-bold tracking-[-.05em] text-ink sm:text-4xl">{memberships.length ? "Aggiungi un appartamento" : "Crea il tuo primo appartamento"}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Bastano poche informazioni per riconoscere lo spazio. Potrai modificarle in seguito dalle impostazioni.</p>
            <CreateApartmentForm requestId={randomUUID()} />
          </section>
        </div>
      </div>
    </main>
  );
}
