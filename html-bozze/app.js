const pages = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', href: 'index.html', icon: 'layout-dashboard' },
  { id: 'bollette', label: 'Bollette', short: 'Bollette', href: 'bollette.html', icon: 'receipt-text' },
  { id: 'spese', label: 'Spese', short: 'Spese', href: 'spese.html', icon: 'circle-dollar-sign' },
  { id: 'segnalazioni', label: 'Segnalazioni', short: 'Guasti', href: 'segnalazioni.html', icon: 'wrench', badge: 3 },
  { id: 'messaggi', label: 'Messaggi', short: 'Chat', href: 'messaggi.html', icon: 'message-circle', badge: 2 },
  { id: 'calendario', label: 'Calendario', short: 'Agenda', href: 'calendario.html', icon: 'calendar-days' },
];

const currentPage = document.body.dataset.page || 'dashboard';

function icon(name, classes = 'size-5') {
  return `<i data-lucide="${name}" class="${classes}" aria-hidden="true"></i>`;
}

function renderSidebar() {
  const target = document.querySelector('#sidebar');
  if (!target) return;
  target.innerHTML = `
    <div id="menu-overlay" class="fixed inset-0 z-50 hidden bg-slate-950/45 backdrop-blur-sm lg:hidden"></div>
    <aside id="main-sidebar" class="desktop-sidebar sticky top-0 flex h-screen w-[260px] shrink-0 flex-col overflow-hidden bg-[#101828] px-5 py-6 text-white">
      <div class="flex items-center justify-between px-1">
        <a href="index.html" class="flex items-center gap-2.5" aria-label="CasaHub dashboard">
          <span class="grid size-10 place-items-center rounded-[14px] bg-[#B8F45D] text-[#101828] shadow-[0_8px_24px_rgba(184,244,93,.24)]">${icon('home','size-5')}</span>
          <span class="text-xl font-extrabold tracking-[-.04em]">CasaHub</span>
        </a>
        <button id="close-menu" class="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Chiudi menu">${icon('x','size-5')}</button>
      </div>
      <p class="mt-10 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Il tuo spazio</p>
      <nav class="mt-3 space-y-1" aria-label="Navigazione principale">
        ${pages.map(page => `
          <a href="${page.href}" class="nav-link ${page.id === currentPage ? 'active' : ''} flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold">
            ${icon(page.icon,'size-[19px]')}
            <span>${page.label}</span>
            ${page.badge ? `<span class="ml-auto grid min-w-5 place-items-center rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] ${page.id === currentPage ? '!bg-[#101828] text-white' : ''}">${page.badge}</span>` : ''}
          </a>`).join('')}
      </nav>
      <div class="mt-auto space-y-3">
        <div class="rounded-[20px] border border-white/10 bg-white/[.055] p-4">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500"><span class="size-1.5 rounded-full bg-[#B8F45D]"></span> Appartamento attivo</div>
          <p class="mt-2 text-sm font-semibold">Via Garibaldi, 24</p>
          <p class="mt-0.5 text-xs text-slate-500">Roma · Interno 7</p>
        </div>
        <a href="accesso.html" class="flex items-center gap-3 rounded-2xl p-2 hover:bg-white/[.06]">
          <span class="grid size-10 place-items-center rounded-full bg-[#7657FF] text-sm font-bold">M</span>
          <span class="min-w-0 flex-1"><b class="block truncate text-sm">Matteo Guerra</b><small id="sidebar-role" class="block text-slate-500">Proprietario</small></span>
          ${icon('more-horizontal','size-4 text-slate-500')}
        </a>
      </div>
    </aside>`;
}

function renderTopbar() {
  const target = document.querySelector('#topbar');
  if (!target) return;
  target.innerHTML = `
    <header class="flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:border-none lg:bg-transparent lg:px-8 lg:py-5">
      <button id="open-menu" class="grid size-10 place-items-center rounded-xl bg-[#101828] text-white lg:hidden" aria-label="Apri menu">${icon('menu','size-5')}</button>
      <label class="relative hidden max-w-md flex-1 md:block">
        <span class="sr-only">Cerca</span>${icon('search','pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400')}
        <input class="h-11 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-[#7657FF]/30 focus:ring-4 focus:ring-[#7657FF]/10" placeholder="Cerca bollette, messaggi, segnalazioni…">
      </label>
      <div class="ml-auto flex items-center gap-2">
        <a href="accesso.html" class="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
          <span class="grid size-8 place-items-center rounded-xl bg-[#7657FF] text-xs font-bold text-white">M</span>
          <span><b class="block text-[11px] leading-4">Matteo Guerra</b><small class="block text-[9px] text-slate-400">Proprietario</small></span>
        </a>
        <button id="notify-button" class="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm" aria-label="Notifiche">${icon('bell','size-[19px]')}<span class="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-rose-500"></span></button>
      </div>
    </header>`;
}

function renderMobileDock() {
  const target = document.querySelector('#mobile-nav');
  if (!target) return;
  const mobilePages = pages.slice(0, 5);
  target.innerHTML = `<nav class="mobile-dock fixed bottom-3 left-3 right-3 z-40 items-center justify-around rounded-[22px] border border-white/90 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,.18)] backdrop-blur-xl" aria-label="Navigazione mobile">
    ${mobilePages.map(page => `<a href="${page.href}" class="relative flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${page.id === currentPage ? 'bg-[#101828] text-white' : 'text-slate-400'}">${icon(page.icon,'size-[18px]')}<span>${page.short}</span>${page.badge ? '<span class="absolute right-1 top-1 size-2 rounded-full bg-rose-500"></span>' : ''}</a>`).join('')}
  </nav>`;
}

function bindShell() {
  const sidebar = document.querySelector('#main-sidebar');
  const overlay = document.querySelector('#menu-overlay');
  const openButton = document.querySelector('#open-menu');
  const closeButton = document.querySelector('#close-menu');
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.add('hidden'); };
  openButton?.addEventListener('click', () => { sidebar?.classList.add('open'); overlay?.classList.remove('hidden'); });
  closeButton?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  document.querySelector('#notify-button')?.addEventListener('click', () => {
    const toast = document.createElement('div');
    toast.className = 'fixed right-5 top-20 z-[80] max-w-sm rounded-2xl bg-[#101828] px-5 py-4 text-sm text-white shadow-2xl';
    toast.innerHTML = '<b>2 nuove notifiche</b><p class="mt-1 text-xs text-slate-400">Una bolletta in scadenza e un nuovo messaggio.</p>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  });
}

function bindChat() {
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  const thread = document.querySelector('#chat-thread');
  if (!form || !input || !thread) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    const bubble = document.createElement('div');
    bubble.className = 'flex justify-end';
    bubble.innerHTML = `<div class="max-w-[75%] rounded-[20px] rounded-br-md bg-[#101828] px-4 py-3 text-sm leading-6 text-white"><p>${value.replace(/[<>]/g,'')}</p><p class="mt-1 text-right text-[9px] text-slate-400">adesso</p></div>`;
    thread.appendChild(bubble);
    input.value = '';
    thread.scrollTop = thread.scrollHeight;
  });
}

renderSidebar();
renderTopbar();
renderMobileDock();
bindShell();
bindChat();
if (window.lucide) window.lucide.createIcons();
window.addEventListener('load', () => window.lucide?.createIcons());
