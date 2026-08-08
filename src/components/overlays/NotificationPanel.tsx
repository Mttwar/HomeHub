import { AlertTriangle, CalendarDays, MessageCircle, ReceiptText, X } from "lucide-react";
import { markAllNotificationsRead } from "@/features/portal/actions";
import type { NotificationListItem } from "@/features/portal/types";
import { cx } from "@/lib/cx";

const presentation = {
  issue: { icon: AlertTriangle, tone: "bg-rose-100 text-rose-600" },
  event: { icon: CalendarDays, tone: "bg-violet/10 text-violet" },
  message: { icon: MessageCircle, tone: "bg-sky-100 text-sky-700" },
  bill: { icon: ReceiptText, tone: "bg-lime/40 text-emerald-700" },
  expense: { icon: ReceiptText, tone: "bg-lime/40 text-emerald-700" },
  document: { icon: ReceiptText, tone: "bg-slate-100 text-slate-600" },
} as const;

export function NotificationPanel({ open, notifications, unread, onClose }: { open: boolean; notifications: NotificationListItem[]; unread: number; onClose: () => void }) {
  return (
    <div className={cx("fixed inset-0 z-[70] transition-[visibility] duration-300", open ? "visible" : "invisible delay-300")} role="dialog" aria-modal="true" aria-label="Notifiche" aria-hidden={!open}>
      <button className={cx("absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} tabIndex={open ? 0 : -1} onClick={onClose} aria-label="Chiudi notifiche" />
      <aside className={cx("absolute right-3 top-3 w-[calc(100%-24px)] max-w-sm rounded-[26px] bg-white p-5 shadow-2xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(.22,1,.36,1)] sm:right-6 sm:top-20", open ? "translate-x-0 scale-100 opacity-100" : "translate-x-5 scale-[.98] opacity-0")}>
        <div className="flex items-center justify-between"><div><h2 className="font-bold">Notifiche</h2><p className="mt-1 text-xs text-slate-400">{unread ? `${unread} da leggere` : "Tutto aggiornato"}</p></div><button tabIndex={open ? 0 : -1} className="motion-control grid size-9 place-items-center rounded-xl bg-slate-100" onClick={onClose} aria-label="Chiudi"><X className="size-4" /></button></div>
        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto">
          {notifications.map((notification, index) => {
            const item = presentation[notification.type as keyof typeof presentation] ?? presentation.document;
            const Icon = item.icon;
            return <article key={notification.id} style={{ transitionDelay: open ? `${90 + index * 45}ms` : "0ms" }} className={cx("flex w-full gap-3 rounded-2xl p-3 transition-[transform,opacity,background-color] duration-300", notification.read ? "bg-white" : "bg-slate-50", open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}><span className={cx("grid size-10 shrink-0 place-items-center rounded-2xl", item.tone)}><Icon className="size-4" /></span><span className="min-w-0"><b className="block text-xs">{notification.title}</b><span className="mt-1 block text-[11px] leading-5 text-slate-500">{notification.body}</span><small className="mt-1 block text-[9px] text-slate-400">{notification.createdAt}</small></span></article>;
          })}
          {!notifications.length && <p className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-400">Nessuna notifica.</p>}
        </div>
        {unread > 0 && <form action={markAllNotificationsRead}><button tabIndex={open ? 0 : -1} className="motion-control mt-3 w-full rounded-2xl bg-ink py-3 text-xs font-bold text-white">Segna tutte come lette</button></form>}
      </aside>
    </div>
  );
}
