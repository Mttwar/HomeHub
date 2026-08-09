import { LoaderCircle } from "lucide-react";

type PendingOverlayProps = {
  description: string;
  title: string;
};

export function PendingOverlay({ description, title }: PendingOverlayProps) {
  return (
    <div className="loading-modal-backdrop fixed inset-0 z-[100] grid place-items-center bg-ink/45 p-5 backdrop-blur-md">
      <div
        className="loading-modal-surface w-full max-w-sm rounded-[28px] border border-white/80 bg-[#f8faf6] p-6 text-center shadow-[0_32px_100px_rgba(15,23,42,.28)] sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-modal-title"
        aria-describedby="loading-modal-description"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-lime shadow-[0_12px_30px_rgba(17,24,39,.16)]">
          <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        </span>
        <h2 id="loading-modal-title" className="mt-5 text-xl font-bold tracking-[-.04em] text-ink">{title}</h2>
        <p id="loading-modal-description" className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <span className="loading-modal-progress block h-full w-1/3 rounded-full bg-violet" />
        </div>
      </div>
    </div>
  );
}
