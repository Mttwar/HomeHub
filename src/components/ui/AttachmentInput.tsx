"use client";

import { FileCheck2, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { cx } from "@/lib/cx";

export function AttachmentInput({ describedBy, id, invalid, name }: { describedBy?: string | undefined; id: string; invalid?: boolean | undefined; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
  };

  return (
    <div className={cx("relative rounded-[18px] border border-dashed bg-slate-50/70 transition hover:border-violet/40 hover:bg-violet/[.025]", invalid ? "border-rose-300" : "border-slate-300")}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <label htmlFor={id} className="flex min-h-20 cursor-pointer items-center gap-3 px-4 py-3 pr-12">
        <span className={cx("grid size-10 shrink-0 place-items-center rounded-2xl", file ? "bg-lime/50 text-emerald-700" : "bg-white text-violet shadow-sm")}>
          {file ? <FileCheck2 className="size-[18px]" /> : <Paperclip className="size-[18px]" />}
        </span>
        <span className="min-w-0">
          <b className="block truncate text-sm text-ink">{file ? file.name : "Scegli una bolletta"}</b>
          <span className="mt-1 block text-[11px] text-slate-400">{file ? `${(file.size / 1024).toFixed(0)} KB · pronto per il caricamento` : "PDF, JPG, PNG o WebP · massimo 3 MB"}</span>
        </span>
      </label>
      {file && <button type="button" onClick={clear} className="motion-control absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-xl bg-white text-slate-400 shadow-sm hover:text-rose-600" aria-label="Rimuovi allegato"><X className="size-4" /></button>}
    </div>
  );
}
