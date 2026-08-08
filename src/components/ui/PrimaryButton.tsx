import { Plus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
};

export function PrimaryButton({ children, onClick, icon: Icon = Plus }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="motion-control group inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-ink px-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(17,24,39,.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_34px_rgba(17,24,39,.22)]"
    >
      <Icon className="size-4 transition-transform duration-300 group-hover:rotate-90" />
      {children}
    </button>
  );
}
