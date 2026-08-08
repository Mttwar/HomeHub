# CasaHub — indicazioni di prodotto e sviluppo

Versione: 1.0  
Data: 21 luglio 2026  
Destinazione: Vercel

## 1. Obiettivo

CasaHub è un portale web responsive per la gestione di un appartamento in affitto. Deve permettere a proprietario e inquilino di collaborare su bollette, affitto, spese, segnalazioni, messaggi, documenti, consumi e appuntamenti senza esporre dati personali o documenti a utenti non autorizzati.

La prima release è web. L'architettura deve poter essere riutilizzata in futuro da un'app mobile tramite le stesse regole di dominio e API.

## 2. Decisione fondamentale sui profili

Non deve esistere alcun selettore “Proprietario / Inquilino” dopo l'accesso.

Il ruolo è assegnato sul server attraverso la relazione tra utente e appartamento:

```text
User → ApartmentMembership → Apartment
                         └─ role: OWNER | TENANT
```

Flusso previsto:

1. L'utente accede da una pagina di login unica.
2. Il server valida la sessione e legge le membership dal database.
3. Se l'account ha un solo ruolo, viene aperto direttamente il portale corretto.
4. Se in futuro un account gestirà più appartamenti, potrà scegliere l'appartamento, non modificare il proprio ruolo.
5. Ogni lettura o modifica viene nuovamente autorizzata sul server. Nascondere un pulsante nell'interfaccia non è una misura di sicurezza.

### Profilo Proprietario

- Crea e configura l'appartamento.
- Invita, sospende e rimuove gli inquilini.
- Carica, modifica e archivia bollette e documenti.
- Registra affitto, spese e pagamenti.
- Visualizza consumi e configurazione delle integrazioni.
- Assegna e chiude le segnalazioni.
- Comunica con inquilino, amministratore e tecnici.
- Crea eventi e gestisce le integrazioni del calendario.
- Consulta l'audit delle attività importanti.

### Profilo Inquilino

- Visualizza soltanto l'appartamento a cui è stato invitato.
- Consulta i documenti condivisi e le scadenze pertinenti.
- Segnala guasti, aggiunge foto e commenti.
- Aggiorna la disponibilità per gli interventi.
- Usa chat e calendario condiviso.
- Visualizza i consumi che il proprietario ha deciso di condividere.
- Non può modificare proprietà, membership, coordinate di pagamento, integrazioni o documenti riservati al proprietario.

### Matrice minima dei permessi

| Funzione | Proprietario | Inquilino |
| --- | --- | --- |
| Gestione appartamento | Completa | Lettura limitata |
| Inviti e utenti | Gestione | Nessun accesso |
| Bollette | Gestione | Lettura dei documenti condivisi |
| Affitto e pagamenti | Gestione | Lettura delle proprie scadenze |
| Spese | Gestione | Lettura delle spese condivise |
| Segnalazioni | Gestione e assegnazione | Creazione e aggiornamento delle proprie |
| Messaggi | Conversazioni autorizzate | Conversazioni autorizzate |
| Calendario | Gestione | Consultazione e conferma presenza |
| Integrazioni | Gestione | Nessun accesso, salvo collegamento del proprio calendario |
| Audit e sicurezza | Lettura | Nessun accesso |

## 3. Stack consigliato

Usare soltanto versioni stabili, fissate nel lockfile e aggiornate con una procedura controllata.

- **Next.js 16.x con App Router** come framework React full-stack. Next.js 16 usa React 19.2, Turbopack stabile e `proxy.ts` come confine di rete. Riferimento: [Next.js 16](https://nextjs.org/blog/next-16).
- **React 19.2** per Actions, miglioramenti SSR e nuove primitive, senza dipendere da API Canary direttamente. Riferimento: [React 19.2](https://react.dev/blog/2025/10/01/react-19-2).
- **TypeScript** con `strict`, `noUncheckedIndexedAccess` ed `exactOptionalPropertyTypes`.
- **Tailwind CSS 4** con configurazione CSS-first e design token centralizzati. Riferimento: [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4).
- **Componenti accessibili** basati su Radix UI/shadcn, mantenuti nel repository e personalizzati con i token CasaHub.
- **Better Auth** per sessioni, email verification, recupero password, 2FA e passkey. Il ruolo CasaHub rimane comunque nel modello di dominio. Riferimento: [integrazione Next.js](https://better-auth.com/docs/integrations/next) e [passkey](https://better-auth.com/docs/plugins/passkey).
- **PostgreSQL** in regione europea.
- **Prisma ORM 7 stabile**, migrazioni versionate e accesso al database solo dal server. Prisma Postgres offre pooling per funzioni serverless e integrazione Vercel. Riferimento: [Prisma Postgres su Vercel](https://www.prisma.io/docs/guides/postgres/vercel).
- **Vercel Private Blob** per bollette, foto e allegati. I file privati richiedono autenticazione e devono essere serviti da una Route Handler che verifica membership e permessi. Riferimento: [Vercel Blob Private Storage](https://vercel.com/docs/vercel-blob/private-storage).
- **Zod** per validare ogni input al confine tra browser e server.
- **Vitest + React Testing Library** per test unitari e di componenti.
- **Playwright** per test end-to-end dei flussi critici.
- **axe-core** per controlli automatici di accessibilità.

Non introdurre Redux o TanStack Query come dipendenze predefinite. Server Components, URL state, React state locale e Server Actions coprono la maggior parte dei casi. Aggiungere una libreria di stato soltanto dopo un bisogno misurabile.

## 4. Struttura del progetto

```text
src/
  app/
    (public)/
      login/page.tsx
      privacy/page.tsx
      termini/page.tsx
    owner/
      layout.tsx
      dashboard/page.tsx
      bollette/page.tsx
      spese/page.tsx
      segnalazioni/page.tsx
      messaggi/page.tsx
      calendario/page.tsx
      impostazioni/page.tsx
    tenant/
      layout.tsx
      dashboard/page.tsx
      bollette/page.tsx
      segnalazioni/page.tsx
      messaggi/page.tsx
      calendario/page.tsx
      profilo/page.tsx
    api/
      auth/[...all]/route.ts
      attachments/route.ts
      integrations/octopus/route.ts
      integrations/google-calendar/route.ts
      webhooks/route.ts
    layout.tsx
    globals.css
  components/
    ui/
    shell/
  features/
    apartments/
    bills/
    expenses/
    issues/
    messaging/
    calendar/
    energy/
  server/
    auth/
    dal/
    permissions/
    repositories/
    services/
    audit/
  lib/
    env.ts
    validation.ts
    errors.ts
  styles/
prisma/
  schema.prisma
  migrations/
tests/
  e2e/
```

Regole:

- Server Components come impostazione predefinita.
- `'use client'` soltanto per interazioni reali: modali, chat composer, grafici, menu mobile.
- Le pagine non interrogano Prisma direttamente: usano il Data Access Layer.
- La logica di dominio non vive nei componenti React.
- Ogni feature espone API pubbliche limitate, schemi Zod e test.
- Nessun barrel file globale che nasconda dipendenze circolari.
- Nomi descrittivi, funzioni brevi e commenti solo per spiegare il “perché”.

## 5. Modello dati iniziale

Entità principali:

- `User`
- `Apartment`
- `ApartmentMembership`
- `Invitation`
- `Bill`
- `Expense`
- `RentSchedule`
- `Issue`
- `IssueComment`
- `MessageThread`
- `ThreadParticipant`
- `Message`
- `CalendarEvent`
- `Attachment`
- `UtilityConnection`
- `ConsumptionReading`
- `Notification`
- `AuditEvent`

Ogni record appartenente a un appartamento deve contenere `apartmentId`. Tutte le query devono partire da una membership verificata e includere il filtro dell'appartamento. Non accettare mai `apartmentId`, `userId` o `role` dal client senza riconvalidarli.

Esempio concettuale:

```ts
export async function getAuthorizedBill(params: {
  userId: string;
  billId: string;
}) {
  return db.bill.findFirst({
    where: {
      id: params.billId,
      apartment: {
        memberships: { some: { userId: params.userId, status: "ACTIVE" } },
      },
    },
  });
}
```

Una ricerca per solo `billId` è insufficiente perché crea il rischio IDOR, cioè l'accesso a un documento di un altro appartamento.

## 6. Autenticazione e autorizzazione

La documentazione Next.js distingue autenticazione, sessione e autorizzazione e raccomanda una libreria, un Data Access Layer e DTO minimali. Riferimento: [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication).

Requisiti:

- Session cookie `HttpOnly`, `Secure`, `SameSite=Lax` o più restrittivo quando possibile.
- Scadenza breve con rotazione della sessione e revoca server-side.
- Email verificata prima di accedere a dati reali.
- Passkey consigliata; 2FA obbligatoria per il proprietario quando sono presenti documenti o dati finanziari reali.
- Rate limit su login, reset password, inviti, chat e upload.
- `proxy.ts` può fare soltanto il reindirizzamento rapido. Ogni pagina, Server Action, Route Handler e download deve ripetere il controllo sicuro della sessione e della membership.
- Nessun ruolo accettato da form, query string, local storage o JWT non verificato.
- Cambio di ruolo o membership consentito soltanto da una funzione server autorizzata e registrato nell'audit log.
- Risposte DTO: inviare al client soltanto i campi necessari.

## 7. Privacy by design

L'obiettivo non può essere promettere “zero violazioni”: nessun sistema serio può garantirlo. Il requisito corretto è ridurre il rischio, limitare l'impatto e rendere rilevabili e gestibili gli incidenti.

Applicare i principi GDPR di liceità e trasparenza, limitazione della finalità, minimizzazione e limitazione della conservazione. Riferimento: [principi GDPR della Commissione europea](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).

### Dati da minimizzare

- Non memorizzare documenti di identità se non strettamente necessari.
- Non salvare numeri completi di carte o credenziali bancarie: usare un provider di pagamento certificato quando sarà introdotto il pagamento.
- Nei log non registrare contenuto dei messaggi, file, token, cookie, email complete o indirizzi completi.
- I dati Octopus devono essere limitati alle letture necessarie alla funzione scelta dall'utente.
- Non usare messaggi, documenti o consumi per addestrare modelli o finalità secondarie senza una base giuridica e informativa specifica.

### Conservazione

Definire una tabella di retention prima del go-live con consulenza legale/fiscale:

- sessioni e token;
- inviti scaduti;
- messaggi;
- allegati e fotografie;
- dati di consumo ad alta frequenza;
- log applicativi e audit;
- bollette e ricevute soggette a obblighi di conservazione.

Prevedere cancellazione automatica, esportazione dei dati, chiusura account e gestione delle richieste dell'interessato. La durata non va improvvisata nel codice.

### Residenza e fornitori

- Collocare funzioni, database e Blob nella stessa area europea quando supportato; Vercel permette di configurare la regione delle Functions. Riferimento: [regioni delle Vercel Functions](https://vercel.com/docs/functions/configuring-functions/region).
- Verificare DPA, sub-responsabili, trasferimenti internazionali e regione effettiva di ogni integrazione.
- Effettuare una DPIA prima del go-live se il monitoraggio dei consumi diventa dettagliato o sistematico.
- Pubblicare privacy policy chiara, registro dei trattamenti e canale per esercitare i diritti.

## 8. Sicurezza degli allegati

Bollette e fotografie non devono essere pubbliche. Vercel Private Blob è indicato per documenti sensibili e richiede autenticazione per lettura e scrittura.

Pipeline obbligatoria:

1. Verifica sessione e permesso di upload.
2. Limite dimensione e quota per utente/appartamento.
3. Allowlist iniziale: PDF, JPG, PNG e WebP.
4. Controllo della firma reale del file; non fidarsi di estensione o `Content-Type`.
5. Nome storage generato dal server, mai il nome originale come identificatore.
6. Scansione antimalware; quarantena fino all'esito.
7. Metadati nel database, contenuto nel Blob privato.
8. Download solo tramite Route Handler con nuova verifica della membership.
9. Header `Content-Type` controllato, `X-Content-Type-Options: nosniff` e `Cache-Control: private, no-store` per documenti sensibili.
10. Cancellazione del Blob e del record coordinata e registrata.

La checklist segue le raccomandazioni [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## 9. Sicurezza applicativa

- CSP con nonce e policy restrittiva; evitare `unsafe-inline` e script di terze parti non indispensabili. Riferimento: [CSP in Next.js](https://nextjs.org/docs/app/guides/content-security-policy).
- Header: HSTS, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Protezione CSRF per tutte le mutazioni basate su cookie.
- Query parametrizzate attraverso Prisma; nessuna concatenazione SQL.
- Escape dell'output e sanitizzazione dell'eventuale rich text.
- Webhook firmati, timestamp verificato e protezione replay.
- Cifratura TLS in transito e storage cifrato a riposo.
- Segreti solo nelle environment variables Vercel, separati per Development, Preview e Production. Le variabili sono cifrate a riposo ma visibili agli utenti del progetto: limitare l'accesso del team e usare variabili “sensitive”. Riferimento: [Vercel Environment Variables](https://vercel.com/docs/environment-variables).
- Rotazione periodica e immediata in caso di sospetto incidente.
- Vercel Firewall/WAF e rate limiting sugli endpoint ad alto rischio. Riferimento: [Vercel Firewall](https://vercel.com/docs/vercel-firewall).
- Dipendenze bloccate dal lockfile, aggiornamenti automatici controllati e scansione delle vulnerabilità in CI.
- Audit log append-only per login, logout, inviti, cambi membership, upload, download sensibili, modifiche a spese e integrazioni.
- Errori client generici; dettagli tecnici soltanto nei log protetti e redatti.

## 10. Integrazioni

### Octopus Energy

- Collegamento OAuth se disponibile; non chiedere password del fornitore.
- Token cifrati e accessibili soltanto dal server.
- Scope minimo, revoca dall'interfaccia e rotazione.
- Sincronizzazione asincrona idempotente.
- Chiarire nel prodotto quando i dati sono live, stimati o non aggiornati.

### Google Calendar

- OAuth con scope minimo e consenso esplicito.
- Collegamento individuale: un inquilino non concede automaticamente accesso al calendario del proprietario.
- Salvare ID e metadati necessari, non copie integrali non necessarie.
- Gestire revoca token e cancellazione dell'integrazione.

### WhatsApp ed email

- Rimandare a una fase successiva.
- Prima definire base giuridica, consenso, retention, provider, costi e comportamento dei messaggi duplicati.
- Non usare automazioni che inviano messaggi a terzi senza conferma e audit.

## 11. UI, accessibilità e prestazioni

- Conservare il linguaggio visivo delle bozze: sidebar notte, lime per le azioni, viola come accento e card ampie.
- Design token in `globals.css`; evitare colori e spaziature duplicati nei componenti.
- Componenti responsive e accessibili da tastiera.
- Focus visibile, contrasto WCAG 2.2 AA, target tattili minimi di circa 44×44 px.
- Rispetto di `prefers-reduced-motion`.
- Skeleton soltanto per latenze reali; preferire streaming e Suspense.
- Grafici con testo alternativo e tabella dati accessibile.
- Server Components per ridurre JavaScript nel browser.
- Budget iniziale: nessun bundle client di pagina oltre 170 kB gzip senza revisione.
- Core Web Vitals verificati su dispositivi reali e Preview Vercel.

## 12. Test obbligatori

### Unitari

- Matrice permessi.
- Validazione Zod.
- Calcoli economici.
- Stati delle segnalazioni.
- Normalizzazione degli eventi esterni.

### Integrazione

- Query sempre filtrate per membership.
- Upload, quarantena, autorizzazione e download.
- Sessione revocata.
- Webhook firmati e idempotenti.
- Eliminazione account e retention.

### End-to-end

- Login proprietario → `/owner/dashboard`.
- Login inquilino → `/tenant/dashboard`.
- Tentativo dell'inquilino di aprire una route proprietario → 403 o redirect.
- Tentativo IDOR usando ID di bolletta appartenente a un altro appartamento → 404/403 senza rivelare l'esistenza del record.
- Upload di tipo non ammesso o troppo grande → rifiutato.
- Download senza membership → rifiutato.
- Creazione segnalazione, messaggio e evento.
- Accessibilità dei flussi principali.

## 13. Deploy su Vercel

- Repository Git collegato a Vercel.
- Preview deployment per ogni pull request.
- Production deploy soltanto da branch protetto.
- Database di Preview separato o branch isolato; mai usare automaticamente dati di produzione.
- Migrazioni verificate prima della promozione.
- Environment variables distinte e nessun segreto nel repository.
- Regione Functions vicina al database europeo.
- Vercel Firewall configurato prima del traffico reale.
- Accesso ai Preview deployment limitato quando contengono funzioni o dati sensibili.
- Backup e procedura di ripristino testati.
- Alert su error rate, autenticazioni anomale, rate limit, fallimenti webhook e download insoliti.
- Rollback documentato e provato.

Vercel fornisce firewall di piattaforma con mitigazione DDoS e WAF configurabile, ma queste protezioni non sostituiscono l'autorizzazione applicativa. La checklist di produzione Next.js raccomanda inoltre build locale, CSP, type safety e verifica delle prestazioni: [Next.js Production Checklist](https://nextjs.org/docs/app/guides/production-checklist).

## 14. Piano di realizzazione

### Fase 1 — Fondazioni

- Nuovo progetto Next.js.
- Token UI e componenti base.
- PostgreSQL, Prisma e migrazioni.
- Autenticazione, sessione, membership e due route group.
- Test della matrice permessi.

### Fase 2 — MVP operativo

- Dashboard differenziate.
- Bollette e Blob privato.
- Affitto e spese.
- Segnalazioni con allegati.
- Messaggi interni.
- Calendario interno.
- Notifiche in-app.

### Fase 3 — Hardening

- 2FA/passkey.
- Scansione upload.
- Audit log.
- Rate limiting e WAF.
- CSP e header.
- Test IDOR e security review.
- Privacy policy, retention e procedure incident response.

### Fase 4 — Integrazioni

- Google Calendar.
- Octopus Energy.
- Email.
- Valutazione separata WhatsApp.

### Fase 5 — Go-live

- Test di carico e accessibilità.
- Verifica backup/ripristino.
- DPIA e controlli privacy necessari.
- Checklist di produzione.
- Deploy graduale e monitoraggio.

## 15. Criteri di accettazione della prima release

- Nessun selettore di ruolo visibile o chiamabile dal client.
- Proprietario e inquilino atterrano su route e navigazioni distinte.
- Ogni accesso ai dati è filtrato tramite membership server-side.
- Tutti gli allegati reali sono privati e autorizzati per singola richiesta.
- Nessun segreto o PII sensibile è presente nei log o nel bundle client.
- I flussi critici hanno test unitari, integrazione ed E2E.
- Accessibilità WCAG 2.2 AA verificata sulle pagine principali.
- Build Vercel riproducibile con environment separati.
- Procedure documentate per cancellazione dati, incidente, rotazione segreti, backup e rollback.

