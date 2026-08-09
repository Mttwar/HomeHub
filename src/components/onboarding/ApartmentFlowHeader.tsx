import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

type ApartmentFlowHeaderProps = {
  backHref: string;
  backLabel: string;
};

export function ApartmentFlowHeader({ backHref, backLabel }: ApartmentFlowHeaderProps) {
  return (
    <header className="apartment-flow-header flex items-center justify-between gap-4">
      <Link href="/" className="rounded-2xl bg-ink px-3 py-2.5 shadow-[0_12px_30px_rgba(17,24,39,.14)]" aria-label="Vai alla home di CasaHub">
        <BrandLogo />
      </Link>
      <Link
        href={backHref}
        className="motion-control inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink/10 bg-[#f8faf6] px-4 text-xs font-extrabold text-ink shadow-[0_8px_24px_rgba(17,24,39,.06)] transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>
    </header>
  );
}
