# CasaHub — mockup e sistema UI Tailwind

Questa tavola descrive la direzione visiva usata nel prototipo web. Il prodotto deve sembrare un servizio domestico contemporaneo: chiaro, affidabile e semplice da consultare, senza l'aspetto di un gestionale amministrativo tradizionale.

## Direzione visiva

- **Base:** superfici avorio/grigio chiarissimo e card bianche.
- **Navigazione:** sidebar blu-notte con stato attivo lime.
- **Azioni primarie:** lime brillante con testo scuro.
- **Accenti:** viola per consumi e messaggi, rosa per urgenze, azzurro per informazioni.
- **Forma:** raggi ampi (`rounded-2xl` / `rounded-[28px]`), bordi sottili e ombre morbide.
- **Tipografia:** Inter, gerarchia netta e numeri molto leggibili.

## Token principali

| Uso | Valore | Classe Tailwind |
| --- | --- | --- |
| Testo / sidebar | `#101828` | `bg-[#101828]`, `text-[#101828]` |
| Sfondo pagina | `#F5F6FA` | `bg-[#F5F6FA]` |
| Azione primaria | `#B8F45D` | `bg-[#B8F45D]` |
| Accento viola | `#7657FF` | `bg-[#7657FF]`, `text-[#7657FF]` |
| Urgenza | `#FF5F8F` | `bg-[#FF5F8F]` |
| Testo secondario | `#667085` | `text-[#667085]` |

## Componenti

### Shell desktop

```html
<div class="min-h-screen bg-[#F5F6FA] text-[#101828] lg:grid lg:grid-cols-[260px_1fr]">
  <aside class="hidden min-h-screen bg-[#101828] p-5 text-white lg:flex lg:flex-col">...</aside>
  <main class="min-w-0 p-5 sm:p-7 lg:p-9">...</main>
</div>
```

### Voce di navigazione attiva

```html
<button class="flex w-full items-center gap-3 rounded-2xl bg-[#B8F45D] px-4 py-3 font-semibold text-[#101828] shadow-sm">
  Dashboard
</button>
```

### Card standard

```html
<section class="rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(16,24,40,0.06)] sm:p-6">
  ...
</section>
```

### Card metrica

```html
<article class="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.05)]">
  <div class="mb-7 flex items-start justify-between">...</div>
  <p class="text-3xl font-bold tracking-[-0.04em]">£ 1.240</p>
  <p class="mt-1 text-sm text-[#667085]">Affitto di luglio</p>
</article>
```

### Widget energia

```html
<section class="overflow-hidden rounded-[28px] bg-[#101828] p-6 text-white shadow-[0_18px_45px_rgba(16,24,40,0.18)]">
  <span class="rounded-full bg-[#B8F45D] px-3 py-1 text-xs font-bold text-[#101828]">LIVE</span>
  ...
</section>
```

### Pulsante primario

```html
<button class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B8F45D] px-4 py-3 font-semibold text-[#101828] transition hover:-translate-y-0.5 hover:shadow-lg">
  Nuova segnalazione
</button>
```

### Layout responsive della dashboard

```html
<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">...</div>
<div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">...</div>
```

Su mobile la sidebar diventa una barra inferiore fissa, le card passano a una colonna e le azioni principali restano raggiungibili con il pollice.

## Implementazione

- Coordinamento dell’applicazione: `src/App.tsx`
- Pagine dedicate: `src/pages/`
- Navigazione e shell responsive: `src/components/shell/`
- Componenti UI condivisi: `src/components/ui/`
- Modali e notifiche: `src/components/overlays/`
- Tipi e dati dimostrativi: `src/types.ts` e `src/data/mock-data.ts`
- Token, font e stili condivisi: `src/index.css`
- Mockup esportati: `mockups/casahub-dashboard-desktop.png` e `mockups/casahub-dashboard-mobile.png`
