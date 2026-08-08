"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type SelectOption = {
  label: string;
  value: string;
  icon?: ReactNode;
};

type SelectControlProps = {
  ariaInvalid?: boolean | undefined;
  className?: string | undefined;
  defaultValue?: string | undefined;
  id?: string | undefined;
  name?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  options: SelectOption[];
  placeholder?: string | undefined;
  required?: boolean | undefined;
  value?: string | undefined;
};

export function SelectControl({ ariaInvalid, className, defaultValue, id, name, onValueChange, options, placeholder = "Seleziona", required, value }: SelectControlProps) {
  return (
    <SelectPrimitive.Root
      {...(name !== undefined ? { name } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(value !== undefined ? { value } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
    >
      <SelectPrimitive.Trigger id={id} aria-invalid={ariaInvalid || undefined} className={cx("form-control group justify-between text-left data-[placeholder]:text-slate-400", className)}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={8} collisionPadding={16} className="select-content z-[110] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-1.5 shadow-[0_22px_60px_rgba(15,23,42,.18)]">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="select-item relative flex h-10 cursor-default select-none items-center gap-2.5 rounded-xl px-3 pr-9 text-sm font-semibold text-slate-600 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-100 data-[highlighted]:text-ink data-[state=checked]:bg-violet/10 data-[state=checked]:text-violet">
                {option.icon && <span className="grid size-6 place-items-center text-slate-400">{option.icon}</span>}
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 grid size-5 place-items-center rounded-full bg-violet text-white">
                  <Check className="size-3" strokeWidth={3} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
