"use client";

import { useActionState } from "react";
import { Building2, LoaderCircle, MapPin, Navigation, Tag } from "lucide-react";
import { createApartment, type OnboardingState } from "@/features/onboarding/actions";
import { Field, Input } from "@/components/ui/FormField";
import { PendingOverlay } from "@/components/overlays/PendingOverlay";

const initialState: OnboardingState = { status: "idle" };

export function CreateApartmentForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(createApartment, initialState);

  return (
    <form action={action} className="mt-7 space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <Field htmlFor="apartment-name" label="Nome dello spazio" error={state.fieldErrors?.name?.[0]}>
        <Input id="apartment-name" name="name" required minLength={2} maxLength={120} startAdornment={<Tag className="size-[18px]" />} placeholder="Casa Garibaldi" />
      </Field>
      <Field htmlFor="apartment-address" label="Indirizzo" error={state.fieldErrors?.address?.[0]}>
        <Input id="apartment-address" name="address" required minLength={3} maxLength={180} autoComplete="street-address" startAdornment={<MapPin className="size-[18px]" />} placeholder="Via Garibaldi, 24" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field htmlFor="apartment-city" label="Città" error={state.fieldErrors?.city?.[0]}>
          <Input id="apartment-city" name="city" required minLength={2} maxLength={100} autoComplete="address-level2" startAdornment={<Navigation className="size-[18px]" />} placeholder="Roma" />
        </Field>
        <Field htmlFor="apartment-postal-code" label="CAP" optional error={state.fieldErrors?.postalCode?.[0]}>
          <Input id="apartment-postal-code" name="postalCode" maxLength={20} autoComplete="postal-code" placeholder="00100" />
        </Field>
      </div>
      {state.message && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{state.message}</p>}
      <button disabled={pending} className="motion-control flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-bold text-white shadow-[0_12px_32px_rgba(17,24,39,.18)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">{pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Building2 className="size-4" aria-hidden="true" />} {pending ? "Registrazione in corso…" : "Registra appartamento"}</button>
      <p className="text-center text-[11px] leading-5 text-slate-400">Creando lo spazio ne diventerai il proprietario verificato.</p>
      {pending ? <PendingOverlay title="Sto creando il tuo spazio" description="Registriamo l’appartamento e prepariamo la dashboard del proprietario." /> : null}
    </form>
  );
}
