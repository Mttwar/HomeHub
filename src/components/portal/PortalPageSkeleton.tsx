export function PortalPageSkeleton() {
  return (
    <section className="animate-pulse" role="status" aria-label="Caricamento pagina">
      <div className="h-3 w-28 rounded-full bg-violet/20" />
      <div className="mt-4 h-9 w-64 max-w-[70vw] rounded-xl bg-ink/10" />
      <div className="mt-3 h-4 w-96 max-w-[85vw] rounded-full bg-ink/10" />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="h-40 rounded-[28px] border border-line bg-card shadow-card lg:col-span-2" />
        <div className="h-40 rounded-[28px] border border-line bg-card shadow-card" />
      </div>

      <div className="mt-5 h-[min(45vh,420px)] rounded-[30px] border border-line bg-card shadow-card" />
      <span className="sr-only">Caricamento in corso…</span>
    </section>
  );
}
