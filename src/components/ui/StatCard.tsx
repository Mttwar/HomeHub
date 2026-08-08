import { TrendingDown, type LucideIcon } from "lucide-react";
import { cx } from "../../lib/cx";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  tone: "violet" | "lime" | "sky" | "rose";
};

const tones = {
  violet: "bg-violet-100 text-violet",
  lime: "bg-lime/40 text-emerald-700",
  sky: "bg-sky-100 text-sky-600",
  rose: "bg-rose-100 text-rose-600",
};

export function StatCard({ icon: Icon, label, value, delta, tone }: StatCardProps) {
  return (
    <article className="ui-card rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.055)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,.085)]">
      <div className="flex items-start justify-between">
        <span className={cx("grid size-10 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="size-[18px]" />
        </span>
        <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
          <TrendingDown className="size-3" /> {delta}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink">{value}</p>
    </article>
  );
}
