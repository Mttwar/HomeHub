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

## Fuori ambito richiesto: API e servizi esterni

- [ ] Upload/scansione/cancellazione di allegati per documenti e segnalazioni: richiede storage privato e servizio antimalware. L'upload bollette esistente resta opzionale tramite Vercel Blob.
- [ ] Inviti e verifica email, recupero password e notifiche email: richiedono un provider email.
- [ ] Google Calendar OAuth e sincronizzazione bidirezionale.
- [ ] Octopus Energy e letture reali dei consumi. La card energia resta marcata chiaramente come demo.
- [ ] WhatsApp e altri canali di messaggistica esterni.
- [ ] Passkey/2FA e rate limiting distribuito: richiedono configurazione o servizi specifici dell'ambiente di autenticazione/deploy.
- [ ] Deploy, WAF, monitoraggio, backup e restore: attività infrastrutturali dell'ambiente di produzione.

## Hardening successivo (non dipende dal prodotto, ma dall'ambiente di test/go-live)

- [ ] Test di integrazione contro un PostgreSQL isolato per query IDOR, messaggi, notifiche e transazioni economiche.
- [ ] Test end-to-end e accessibilità automatica dei flussi critici.
- [ ] Politiche definitive di retention, esportazione e cancellazione account approvate a livello legale.
- [ ] Migrazione di archiviazione/soft-delete per documenti e record economici, una volta definite le regole di conservazione.

## Verifica eseguita

- `npx tsc --noEmit`: superato.
- `npm run lint`: superato.
- `npm test`: 11 test superati.
- `npm run build`: superato, 23 route generate correttamente.
- Database Docker: non verificato perché Docker Desktop non era avviato durante l'audit.
