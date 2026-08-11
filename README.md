# CasaHub

Portale Next.js per la gestione condivisa di un appartamento tra proprietario e inquilino. L'implementazione segue `ANALISI.md`, `INDICAZIONI_SVILUPPO.md`, `MOCKUP_TAILWIND.md` e `CHECKLIST_SICUREZZA.md`.

## Stack

- Next.js 16 con App Router, React 19 e TypeScript strict;
- Tailwind CSS 4;
- PostgreSQL con Prisma 7 e migrazioni versionate;
- Better Auth con sessioni server-side;
- Zod per la validazione delle operazioni;
- Vitest ed ESLint per i controlli automatici.

## Avvio locale

1. Installa le dipendenze e avvia Docker Desktop.
2. Prepara PostgreSQL, migrazioni e account locali con un solo comando:

```bash
npm install
npm run dev:setup
```

Il repository contiene un `.env` esclusivamente locale e ignorato da Git. Per altri ambienti parti da `.env.example` e sostituisci ogni segreto.

3. In alternativa, i passaggi possono essere eseguiti separatamente:

```bash
npm run db:up
npm run db:deploy
npm run db:seed
```

Gli account seed sono `matteo@casahub.local` e `giulia@casahub.local`. Le password non sono salvate nel repository.

4. Avvia il portale:

```bash
npm run dev
```

## Struttura

- `src/app/owner/` e `src/app/tenant/`: pagine distinte per ruolo e area;
- `src/components/portal/`: composizione delle pagine e componenti visuali riusabili;
- `src/features/`: schemi Zod e Server Actions;
- `src/server/auth/`: autenticazione e verifica membership;
- `src/server/dal/`: query filtrate per appartamento;
- `prisma/schema.prisma`: modello dati;
- `prisma/migrations/`: migrazione SQL iniziale;
- `prisma/seed.ts`: bootstrap locale degli account.

## Funzioni operative

- login reale e logout con cookie di sessione;
- registrazione self-service con onboarding: chi crea un appartamento riceve dal server la membership `OWNER`;
- inviti monouso per gli inquilini, con token salvato solo come hash, scadenza, revoca e accettazione vincolata all'email;
- selezione dell'appartamento attivo per account con più membership;
- verifica email e recupero password tramite email transazionali Resend;
- rate limit Better Auth persistito su PostgreSQL, adatto a più istanze serverless;
- route proprietario/inquilino protette e ruolo verificato dal database;
- isolamento delle query tramite `apartmentId` della membership attiva;
- pagine separate per dashboard, bollette, spese, segnalazioni, messaggi, calendario, documenti e profilo;
- creazione di bollette, spese, segnalazioni, eventi e schede documento tramite Server Actions;
- pianificazione dei canoni ricorrenti e registrazione dei pagamenti al saldo delle spese;
- allegati privati delle bollette in PDF, JPG, PNG o WebP, con validazione della firma del file, limite di 3 MB e download autorizzato per appartamento e ruolo;
- autorizzazioni server-side, validazione Zod e audit log per ogni creazione;
- lettura reale da PostgreSQL per dashboard, bollette, spese, canoni, segnalazioni, calendario, documenti, messaggi, notifiche e profilo;
- commenti e avanzamento delle segnalazioni, conferma presenza agli eventi e aggiornamento degli stati economici;
- gestione locale dell'appartamento e sospensione/riattivazione delle membership da parte del proprietario;
- audit attività consultabile dal profilo proprietario;
- accesso e collegamento account Google con consenso incrementale e token OAuth cifrati;
- calendario Google dedicato per appartamento, con creazione, modifica e annullamento idempotente degli eventi CasaHub;
- invio email tramite Gmail con contenuto cifrato AES-256-GCM mentre è in coda, limiti di frequenza e retry asincroni;
- layout responsive desktop/mobile, ricerca e pannello notifiche.

Notifiche realtime push, import degli eventi creati direttamente in Google e le altre integrazioni esterne restano moduli successivi. La TODO aggiornata è in `TODO_IMPLEMENTAZIONE.md`.

## Preparazione della produzione

Gli account seed sono esclusivamente locali: in produzione ogni beta tester si registra e crea il proprio appartamento dall'onboarding. Non eseguire `db:seed` sul database di produzione.

Configura su Vercel, con scope `Production`:

```text
DATABASE_URL
DATABASE_URL_UNPOOLED
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DATA_ENCRYPTION_KEY
CRON_SECRET
```

`BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL` devono coincidere con il dominio pubblico HTTPS. `RESEND_API_KEY` e `AUTH_EMAIL_FROM` sono opzionali e servono solo per il recupero password e l'invio automatico degli inviti; senza di essi gli inviti possono essere condivisi copiando il link generato dall'app.

`DATA_ENCRYPTION_KEY` deve contenere esattamente 32 byte casuali codificati Base64. Generane una distinta per ogni ambiente, per esempio con `openssl rand -base64 32`, e conservala esclusivamente nel secret manager. `CRON_SECRET` protegge il worker `/api/cron/google-integrations`; deve essere lungo, casuale e diverso dalle altre chiavi.

### Configurazione Google

1. Nel progetto Google Cloud abilita **Google Calendar API** e **Gmail API**.
2. Configura la schermata consenso OAuth e crea un client di tipo **Web application**.
3. Aggiungi come redirect autorizzato `{BETTER_AUTH_URL}/api/auth/callback/google`, usando HTTPS in produzione.
4. Inserisci client ID e client secret nelle variabili server `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
5. Applica la migrazione prima di aprire il pannello Profilo:

```bash
npm run db:deploy
```

CasaHub richiede prima i soli dati di identità; gli scope minimali `calendar.app.created` e `gmail.send` vengono richiesti separatamente quando l'utente attiva il relativo servizio. In sviluppo sono accettate soltanto origini HTTP su `localhost`/`127.0.0.1`, anche se Next sceglie una porta diversa; in produzione l'origine rimane vincolata al dominio HTTPS configurato.

I token OAuth sono cifrati dal layer di autenticazione. Destinatario, oggetto e corpo delle email in coda sono cifrati con AES-256-GCM e contesto autenticato; vengono decifrati soltanto in memoria durante l'invio. Le chiamate Google usano HTTPS. Per la protezione completa a riposo e in transito, il PostgreSQL di produzione deve avere cifratura storage/backup e TLS obbligatorio.

Il percorso beta previsto è:

1. proprietario: registrazione → creazione appartamento → dashboard;
2. inquilino: link invito → registrazione/accesso → accettazione → dashboard;
3. account con più appartamenti: selezione esplicita da `/appartamenti`, riconvalidata dal server a ogni richiesta.

## Storage privato degli allegati

1. Crea uno store Vercel Blob con accesso `Private`.
2. Copia il relativo token in `BLOB_READ_WRITE_TOKEN` nell'ambiente locale e in quello di produzione.
3. Non esporre il token come variabile `NEXT_PUBLIC_*`: upload e download passano esclusivamente dal server.

Senza il token è ancora possibile salvare una bolletta priva di allegato; il form mostra invece un errore esplicito se viene selezionato un file.

## Verifiche

```bash
npm test
npm run lint
npm run build
```
