# TODO implementazione CasaHub

Audit eseguito l'8 agosto 2026 confrontando codice, schema Prisma, `ANALISI.md`, `INDICAZIONI_SVILUPPO.md` e checklist di sicurezza.

## Completato in questa iterazione (funzioni locali)

- [x] Sostituire i dati statici della dashboard con aggregazioni PostgreSQL per appartamento e ruolo.
- [x] Rendere persistenti elenco, riepilogo, categorie e stati delle spese.
- [x] Registrare un pagamento quando una spesa passa allo stato `PAID`.
- [x] Gestire i canoni ricorrenti con importo, decorrenza e giorno di scadenza.
- [x] Rendere persistente l'archivio documenti, compresa la visibilità condivisa/solo proprietario.
- [x] Rendere persistente la messaggistica interna e creare automaticamente la conversazione della casa.
- [x] Creare notifiche in-app per nuovi record, messaggi, commenti e aggiornamenti; aggiungere il comando “segna tutte come lette”.
- [x] Calcolare badge di segnalazioni e messaggi dal database, senza numeri fissi.
- [x] Completare le segnalazioni con descrizione, commenti, audit e cambio di stato autorizzato.
- [x] Completare il calendario interno con navigazione mensile, eventi reali e risposta dell'inquilino.
- [x] Consentire al proprietario di aggiornare lo stato delle bollette e delle spese.
- [x] Mostrare dati reali di appartamento e membership; consentire modifica dell'appartamento e sospensione/riattivazione dell'inquilino.
- [x] Esporre al proprietario l'audit delle attività importanti.
- [x] Collegare la ricerca delle pagine a bollette, spese, segnalazioni, messaggi, calendario e documenti.
- [x] Rimuovere o sostituire i controlli UI che promettevano azioni locali inesistenti.
- [x] Estendere la matrice permessi e i test di validazione per le nuove operazioni.

## API e servizi esterni

- [ ] Upload/scansione/cancellazione di allegati per documenti e segnalazioni: richiede storage privato e servizio antimalware. L'upload bollette esistente resta opzionale tramite Vercel Blob.
- [x] Inviti, verifica email e recupero password tramite provider transazionale configurabile.
- [x] Login/collegamento Google con consenso incrementale e revoca sicura.
- [x] Sincronizzazione CasaHub → Google Calendar per creazione, modifica e annullamento degli eventi.
- [x] Invio Gmail con outbox cifrata, idempotenza operativa, rate limit e retry.
- [ ] Import Google Calendar → CasaHub e webhook bidirezionali. È separato dall'export richiesto e richiede gestione dei canali push/sync token.
- [ ] Octopus Energy e letture reali dei consumi. La card energia resta marcata chiaramente come demo.
- [ ] WhatsApp e altri canali di messaggistica esterni.
- [ ] Passkey/2FA per i proprietari. Il rate limiting dell'autenticazione è già persistito su PostgreSQL.
- [ ] Deploy, WAF, monitoraggio, backup e restore: attività infrastrutturali dell'ambiente di produzione.

## Hardening successivo (non dipende dal prodotto, ma dall'ambiente di test/go-live)

- [ ] Test di integrazione contro un PostgreSQL isolato per query IDOR, messaggi, notifiche e transazioni economiche.
- [ ] Test end-to-end e accessibilità automatica dei flussi critici.
- [ ] Politiche definitive di retention, esportazione e cancellazione account approvate a livello legale.
- [ ] Migrazione di archiviazione/soft-delete per documenti e record economici, una volta definite le regole di conservazione.

## Verifica eseguita

- `npx tsc --noEmit`: superato.
- `npm run lint`: superato.
- `npm test`: suite completa superata, inclusi i test AES-256-GCM.
- `npm run build`: superato, incluse le route di attivazione Google e del worker protetto.
- Database Docker: non verificato perché Docker Desktop non era avviato durante l'audit.
