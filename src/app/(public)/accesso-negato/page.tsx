import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f6fa] p-6"><section className="max-w-lg rounded-[30px] bg-white p-8 text-center shadow-xl"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><ShieldAlert /></span><h1 className="mt-5 text-3xl font-bold tracking-tight">Accesso non ancora attivo</h1><p className="mt-3 text-sm leading-6 text-slate-500">Il tuo account è valido, ma non risulta associato a un appartamento attivo. Chiedi al proprietario un invito.</p><Link href="/login" className="mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white">Torna all’accesso</Link></section></main>;
}
