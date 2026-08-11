import { Bell, Building2, Menu, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/FormField";
import { ThemeToggle } from "./ThemeToggle";

type TopBarProps = {
  query: string;
  apartmentLabel: string;
  unreadNotifications: number;
  onSearch: (value: string) => void;
  onOpenMenu: () => void;
  onToggleNotifications: () => void;
};

export function TopBar({ query, apartmentLabel, unreadNotifications, onSearch, onOpenMenu, onToggleNotifications }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:border-none lg:bg-transparent lg:px-8 lg:py-5">
      <button className="motion-control grid size-10 place-items-center rounded-xl bg-ink text-white lg:hidden" onClick={onOpenMenu} aria-label="Apri menu"><Menu className="size-5" /></button>
      <div className="hidden max-w-md flex-1 md:block">
        <Input value={query} onChange={(event) => onSearch(event.target.value)} containerClassName="!h-11 !min-h-11 bg-white/80 shadow-sm" startAdornment={<Search className="size-4" />} placeholder="Cerca in tutto CasaHub…" aria-label="Ricerca globale" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link href="/appartamenti" className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-violet/30 sm:flex" title="Cambia appartamento"><span className="grid size-7 place-items-center rounded-xl bg-lime/50 text-ink"><Building2 className="size-3.5" /></span><span className="text-xs font-bold text-ink">{apartmentLabel}</span></Link>
        <button onClick={onToggleNotifications} className="notification-trigger motion-control group relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-ink" aria-label={unreadNotifications ? `Apri notifiche, ${unreadNotifications} non lette` : "Apri notifiche"}><Bell className="size-[19px] transition-transform duration-300 group-hover:-rotate-12" />{unreadNotifications > 0 && <span className="notification-count absolute right-1.5 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">{unreadNotifications}</span>}</button>
      </div>
    </header>
  );
}
