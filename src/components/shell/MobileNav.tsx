import { navItems } from "../../data/mock-data";
import { cx } from "../../lib/cx";
import type { View } from "../../types";

export function MobileNav({ active, openIssues, unreadMessages, onNavigate, onPrefetch }: { active: View; openIssues: number; unreadMessages: number; onNavigate: (view: View) => void; onPrefetch: (view: View) => void }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-[22px] border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_50px_rgba(15,23,42,.18)] backdrop-blur-xl lg:hidden" aria-label="Navigazione mobile">
      {navItems.filter((item) => item.mobile).map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;
        const badge = item.id === "issues" ? openIssues : item.id === "messages" ? unreadMessages : 0;
        return <button key={item.id} onClick={() => onNavigate(item.id)} onPointerEnter={() => onPrefetch(item.id)} onFocus={() => onPrefetch(item.id)} aria-current={selected ? "page" : undefined} className={cx("motion-control relative flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-bold transition-all duration-300", selected ? "bg-ink text-white shadow-lg" : "text-slate-400")}><Icon className={cx("size-[18px] transition-transform duration-300", selected && "-translate-y-0.5 scale-110")} /><span>{item.shortLabel}</span>{badge > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-500" />}</button>;
      })}
    </nav>
  );
}
