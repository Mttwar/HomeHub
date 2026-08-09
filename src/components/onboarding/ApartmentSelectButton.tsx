"use client";

import { useFormStatus } from "react-dom";
import { ChevronRight, Home } from "lucide-react";
import { PendingOverlay } from "@/components/overlays/PendingOverlay";

type ApartmentSelectButtonProps = {
  address: string;
  apartmentName: string;
  roleLabel: string;
};

export function ApartmentSelectButton({ address, apartmentName, roleLabel }: ApartmentSelectButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="group motion-control flex min-h-[78px] w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-[0_12px_30px_rgba(118,87,255,.09)] disabled:cursor-wait disabled:opacity-70"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eef2ec] text-slate-700 transition duration-300 group-hover:bg-violet/10 group-hover:text-violet"><Home className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <b className="truncate text-sm text-ink">{apartmentName}</b>
            <span className="rounded-full bg-lime/40 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-ink">{roleLabel}</span>
          </span>
          <span className="mt-1.5 block truncate text-xs text-slate-400">{address}</span>
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-300 transition duration-300 group-hover:bg-violet group-hover:text-white"><ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </button>

      {pending ? <PendingOverlay title={`Apro ${apartmentName}`} description="Stiamo preparando la dashboard e verificando il tuo accesso." /> : null}
    </>
  );
}
