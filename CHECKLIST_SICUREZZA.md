# CasaHub — checklist sicurezza e privacy

Questa checklist deve essere completata prima di ogni rilascio in produzione. Non sostituisce una revisione professionale legale o di sicurezza.

## Identità e permessi

- [ ] Il ruolo proviene dal database, non dal client.
- [ ] Non esiste un selettore per cambiare ruolo.
- [ ] Sessione validata server-side su ogni azione protetta.
- [ ] Membership verificata su ogni record collegato a un appartamento.
- [ ] Test IDOR tra due appartamenti diversi.
- [ ] 2FA o passkey attiva per i proprietari.
- [ ] Sessioni revocabili e scadenze configurate.
- [ ] Login, reset e inviti sottoposti a rate limit.

## Dati e documenti

- [ ] Allegati archiviati esclusivamente in storage privato.
- [ ] Download autorizzato nella stessa Route Handler che serve il file.
- [ ] Allowlist di estensioni e controllo della firma reale.
- [ ] Limiti di dimensione, quota e frequenza.
- [ ] Nomi storage generati dal server.
- [ ] Scansione antimalware e quarantena.
- [ ] `nosniff` e cache privata/no-store sui documenti sensibili.
- [ ] Nessun documento, messaggio o token nei log.

## Applicazione

- [ ] Input validati con Zod sul server.
- [ ] CSP senza eccezioni non documentate.
- [ ] HSTS, anti-framing, Referrer-Policy e Permissions-Policy.
- [ ] CSRF protetto su tutte le mutazioni basate su cookie.
- [ ] Webhook firmati, timestamp verificati e idempotenti.
- [ ] Errori pubblici privi di stack trace o identificativi sensibili.
- [ ] Dipendenze e immagini di build sottoposte a scansione.
- [ ] Audit log per azioni privilegiate.

## Integrazione Google

- [x] Scope OAuth minimali e consenso separato per login, Calendar e Gmail.
- [x] Access token e refresh token cifrati nel database dal layer di autenticazione.
- [x] Destinatario, oggetto e corpo Gmail cifrati AES-256-GCM mentre sono in coda.
- [x] Chiave dati separata dai secret OAuth e mai esposta tramite variabili `NEXT_PUBLIC_*`.
- [x] Revoca Google bloccata se eliminerebbe l'unico metodo di accesso dell'utente.
- [x] Errori Google sanitizzati e privi di token o contenuto delle email.
- [x] Worker protetto da secret, job idempotenti e retry limitati.
- [x] Origini localhost dinamiche abilitate esclusivamente fuori produzione.
- [ ] Cifratura storage, backup e TLS del PostgreSQL verificati nell'ambiente di produzione.
- [ ] Rotazione provata di OAuth client secret, `DATA_ENCRYPTION_KEY` e `CRON_SECRET`.

## Privacy

- [ ] Finalità e base giuridica definite per ogni categoria di dati.
- [ ] Raccolti soltanto i dati necessari.
- [ ] Retention definita e automatizzata.
- [ ] Esportazione, rettifica e cancellazione testate.
- [ ] DPA e sub-responsabili verificati.
- [ ] Regione e trasferimenti internazionali verificati.
- [ ] DPIA valutata per consumi e monitoraggio dettagliato.
- [ ] Informativa privacy e contatti pubblicati.

## Vercel e operazioni

- [ ] Production, Preview e Development usano segreti separati.
- [ ] Le variabili sensibili sono marcate e accessibili al team minimo.
- [ ] Regione Functions allineata a database e storage.
- [ ] WAF e rate limiting attivi.
- [ ] Preview deployment protetti.
- [ ] Backup e ripristino provati.
- [ ] Alert di sicurezza e disponibilità configurati.
- [ ] Procedura di rotazione segreti provata.
- [ ] Piano di risposta agli incidenti e contatti disponibili.
- [ ] Rollback applicativo e database documentato.

## Qualità

- [ ] `next build` completata senza errori.
- [ ] TypeScript strict senza eccezioni ingiustificate.
- [ ] Test unitari, integrazione ed E2E verdi.
- [ ] Test accessibilità WCAG 2.2 AA.
- [ ] Nessuna PII nei dati di test o Preview.
- [ ] Security review finale completata da una persona diversa dall'autore della feature.
