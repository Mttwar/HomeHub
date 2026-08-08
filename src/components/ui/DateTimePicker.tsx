"use client";

import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import { CalendarDays, Check, ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { it as dayPickerLocale } from "react-day-picker/locale";
import { cx } from "@/lib/cx";
import { SelectControl, type SelectOption } from "./SelectControl";

const hours: SelectOption[] = Array.from({ length: 24 }, (_, hour) => ({
  label: hour.toString().padStart(2, "0"),
  value: hour.toString().padStart(2, "0"),
}));

const minutes: SelectOption[] = ["00", "15", "30", "45"].map((minute) => ({ label: minute, value: minute }));

type DateTimePickerProps = {
  ariaInvalid?: boolean;
  id: string;
  name: string;
  required?: boolean;
  withTime?: boolean;
};

export function DateTimePicker({ ariaInvalid, id, name, required, withTime }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date>();
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");

  const value = selected ? `${format(selected, "yyyy-MM-dd")}${withTime ? `T${hour}:${minute}` : ""}` : "";
  const displayValue = selected
    ? `${format(selected, "d MMM yyyy", { locale: dateLocale })}${withTime ? ` · ${hour}:${minute}` : ""}`
    : withTime ? "Scegli data e ora" : "Scegli una data";

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button id={id} type="button" data-invalid={ariaInvalid ? "true" : undefined} data-required={required ? "true" : undefined} className={cx("form-control w-full justify-start text-left font-semibold", !selected && "text-slate-400")}>
            <CalendarDays className={cx("size-[18px] shrink-0", selected ? "text-violet" : "text-slate-400")} />
            <span className={cx("min-w-0 flex-1 truncate text-sm", selected && "text-ink")}>{displayValue}</span>
            <ChevronDown className={cx("size-4 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align={withTime ? "end" : "start"} side={withTime ? "top" : "bottom"} sideOffset={10} collisionPadding={16} className={cx("date-picker-popover z-[110] max-h-[calc(100dvh-24px)] overflow-x-hidden overflow-y-auto rounded-[24px] border border-slate-200/80 bg-white p-2.5 shadow-[0_24px_70px_rgba(15,23,42,.2)]", withTime ? "w-[min(500px,calc(100vw-24px))]" : "w-[min(340px,calc(100vw-24px))]")} onOpenAutoFocus={(event) => event.preventDefault()}>
            <div className={cx(withTime && "sm:grid sm:grid-cols-[minmax(0,1fr)_158px]")}>
              <DayPicker
                animate
                locale={dayPickerLocale}
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  setSelected(date);
                  if (date && !withTime) setOpen(false);
                }}
                showOutsideDays
                className="casahub-calendar"
              />
              {withTime && (
                <aside className="mt-2 flex flex-col border-t border-slate-100 px-2 pt-3 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-3 sm:pr-1 sm:pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">
                    <Clock3 className="size-3.5" /> Orario
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
                    <SelectControl ariaInvalid={ariaInvalid} value={hour} onValueChange={setHour} options={hours} className="!h-10 !min-h-10 rounded-xl px-2" />
                    <span className="font-bold text-slate-300">:</span>
                    <SelectControl ariaInvalid={ariaInvalid} value={minute} onValueChange={setMinute} options={minutes} className="!h-10 !min-h-10 rounded-xl px-2" />
                  </div>
                  <div className="mt-4 space-y-2 sm:mt-auto">
                    <button type="button" onClick={() => setSelected(new Date())} className="motion-control w-full rounded-xl px-3 py-2 text-xs font-bold text-violet transition hover:bg-violet/10">Vai a oggi</button>
                    <button type="button" disabled={!selected} onClick={() => setOpen(false)} className="motion-control inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink px-3.5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check className="size-3.5" /> Conferma</button>
                  </div>
                </aside>
              )}
            </div>
            {!withTime && (
              <div className="mt-2 flex justify-end border-t border-slate-100 px-2 pt-3">
                <button type="button" onClick={() => setSelected(new Date())} className="motion-control rounded-xl px-3 py-2 text-xs font-bold text-violet hover:bg-violet/10">Oggi</button>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
