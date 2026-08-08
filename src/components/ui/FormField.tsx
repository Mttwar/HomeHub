import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type FieldProps = {
  children: ReactNode;
  className?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  htmlFor: string;
  label: string;
  optional?: boolean | undefined;
};

export function Field({ children, className, error, hint, htmlFor, label, optional }: FieldProps) {
  return (
    <div className={cx("space-y-2", className)} data-invalid={error ? "true" : undefined}>
      <div className="flex min-h-5 items-center justify-between gap-3 px-0.5">
        <label htmlFor={htmlFor} className="text-xs font-extrabold tracking-[-.01em] text-ink">
          {label}
        </label>
        {(optional || hint) && <span className="text-[10px] font-semibold text-slate-400">{optional ? "Opzionale" : hint}</span>}
      </div>
      {children}
      {error && <p id={`${htmlFor}-error`} className="px-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  containerClassName?: string;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, endAdornment, startAdornment, ...props },
  ref,
) {
  return (
    <div className={cx("form-control", containerClassName)} data-invalid={props["aria-invalid"] ? "true" : undefined}>
      {startAdornment && <span className="form-control-adornment">{startAdornment}</span>}
      <input ref={ref} className={cx("min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400", className)} {...props} />
      {endAdornment && <span className="form-control-adornment">{endAdornment}</span>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cx("form-textarea", className)} {...props} />;
});
