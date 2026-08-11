import { Home } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-lime text-ink shadow-[0_8px_24px_rgba(63,99,85,.24)]">
        <Home className="size-5" strokeWidth={2.4} aria-hidden="true" />
      </div>
      {!compact && <span className="text-xl font-bold tracking-[-0.04em] text-white">CasaHub</span>}
    </div>
  );
}
