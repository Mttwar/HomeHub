import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, ShieldCheck } from "lucide-react";
import { ApartmentFlowHeader } from "@/components/onboarding/ApartmentFlowHeader";
import { ApartmentSelectButton } from "@/components/onboarding/ApartmentSelectButton";
import { selectApartment } from "@/features/onboarding/actions";
import { listActiveMemberships } from "@/server/auth/active-apartment";
import { requireSession } from "@/server/auth/require-session";

export const metadata: Metadata = { title: "Scegli appartamento" };

export default async function ApartmentsPage() {
  const session = await requireSession("/appartamenti");
  const memberships = await listActiveMemberships(session.user.id);
  const backHref = memberships.length ? "/" : "/onboarding";
  const backLabel = memberships.length ? "Torna alla dashboard" : "Torna alla configurazione";

  return (
    <main className="apartment-flow-enter min-h-screen bg-[#e9eee8] px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <ApartmentFlowHeader backHref={backHref} backLabel={backLabel} />

        <section className="apartment-flow-panel mt-6 grid overflow-hidden rounded-[32px] border border-white/80 bg-[#f8faf6] shadow-[0_24px_70px_rgba(17,24,39,.10)] lg:min-h-[570px] lg:grid-cols-[.78fr_1.22fr]">
          <aside className="flex flex-col bg-ink p-7 text-white sm:p-10 lg:p-12">
            <span className="grid size-12 place-items-center rounded-2xl bg-lime text-ink"><Building2 className="size-5" aria-hidden="true" /></span>
            <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[.18em] text-lime">I tuoi spazi</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold tracking-[-.055em] sm:text-5xl">Ogni casa, il suo spazio.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Scegli l’appartamento che vuoi gestire. Dati, persone e attività restano sempre separati e protetti.</p>

            <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 lg:mt-auto">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lime"><ShieldCheck className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-bold">Accesso verificato</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">Puoi aprire solo gli spazi associati al tuo account.</p>
              </div>
            </div>
          </aside>

          <div className="flex flex-col p-6 sm:p-9 lg:p-12">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-violet">Seleziona appartamento</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] text-ink">Quale casa vuoi aprire?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Riprenderai dalla dashboard dello spazio scelto.</p>
            </div>

            <div className="mt-7 space-y-3">
              {memberships.map((membership) => (
                <form key={membership.id} action={selectApartment}>
                  <input type="hidden" name="apartmentId" value={membership.apartmentId} />
                  <ApartmentSelectButton
                    apartmentName={membership.apartment.name}
                    address={`${membership.apartment.addressLine}, ${membership.apartment.city}`}
                    roleLabel={membership.role === "OWNER" ? "Proprietario" : "Inquilino"}
                  />
                </form>
              ))}
              {!memberships.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5">
                  <p className="text-sm font-bold text-ink">Nessun appartamento ancora</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Crea il primo spazio per iniziare a gestire casa, documenti e attività.</p>
                </div>
              )}
            </div>

            <Link href="/onboarding?nuovo=1" className="motion-control mt-5 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-violet/30 bg-violet/[.04] px-4 text-xs font-extrabold text-violet transition hover:-translate-y-0.5 hover:border-violet/50 hover:bg-violet/[.08]">
              <Plus className="size-4" aria-hidden="true" />
              Aggiungi un nuovo appartamento
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
