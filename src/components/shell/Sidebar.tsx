import { LogOut, Settings, X } from "lucide-react";
import { navItems } from "../../data/mock-data";
import { cx } from "../../lib/cx";
import type { Session, View } from "../../types";
import { BrandLogo } from "../ui/BrandLogo";

type SidebarProps = {
  active: View;
  session: Session;
  openIssues: number;
  unreadMessages: number;
  apartmentLabel: string;
  apartmentCity: string;
  open: boolean;
  onNavigate: (view: View) => void;
  onClose: () => void;
  onSignOut: () => void;
};

export function Sidebar({ active, session, openIssues, unreadMessages, apartmentLabel, apartmentCity, open, onNavigate, onClose, onSignOut }: SidebarProps) {
  return (
    <>
      <button
        className={cx("fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden", open ? "visible opacity-100" : "invisible opacity-0")}
        aria-label="Chiudi menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside className={cx("fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col overflow-hidden bg-ink px-5 py-6 text-white transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-1">
          <BrandLogo />
          <button className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Chiudi menu"><X className="size-5" /></button>
        </div>
        <div className="mt-10 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Il tuo spazio</div>
        <nav className="mt-3 space-y-1" aria-label="Navigazione principale">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            const badge = item.id === "issues" ? openIssues : item.id === "messages" ? unreadMessages : 0;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} aria-current={selected ? "page" : undefined} className={cx("motion-control group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300", selected ? "bg-lime text-ink shadow-[0_12px_30px_rgba(182,243,107,.13)]" : "text-slate-400 hover:bg-white/[0.07] hover:text-white")}>
                <Icon className={cx("size-[19px] transition-transform duration-300", selected ? "scale-110" : "group-hover:translate-x-0.5")} strokeWidth={selected ? 2.4 : 2} aria-hidden="true" />
                <span>{item.label}</span>
                {badge > 0 && <span className={cx("ml-auto grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px]", selected ? "bg-ink text-white" : "bg-white/10 text-slate-300")}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"><span className="size-1.5 rounded-full bg-lime" /> Appartamento attivo</div>
            <p className="mt-2 text-sm font-semibold text-white">{apartmentLabel}</p>
            <p className="mt-0.5 text-xs text-slate-500">{apartmentCity}</p>
          </div>
          <button onClick={() => onNavigate("settings")} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-white/[0.06]">
            <span className="grid size-10 place-items-center rounded-full bg-violet text-sm font-bold text-white">{session.initials}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{session.name}</span><span className="block text-xs capitalize text-slate-500">{session.role === "owner" ? "Proprietario" : "Inquilino"}</span></span>
            <Settings className="size-4 text-slate-500" />
          </button>
          <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.06] hover:text-white"><LogOut className="size-4" /> Esci dall’account</button>
        </div>
      </aside>
    </>
  );
}
