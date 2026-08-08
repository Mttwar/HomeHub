# Analisi del prodotto — Gestione appartamento in affitto

## 1. Visione

Realizzare un'applicazione web responsive per centralizzare la gestione quotidiana di un appartamento in affitto e la comunicazione tra proprietario e persone che vivono nella casa.

L'app dovrà diventare il punto unico in cui consultare bollette e spese, controllare i consumi, inviare segnalazioni, scambiare messaggi e programmare interventi. In una fase successiva la stessa piattaforma potrà essere distribuita come app mobile, riutilizzando backend, dati e logiche di autorizzazione.

Nome provvisorio del prodotto: **CasaHub**.

## 2. Obiettivi

- Ridurre messaggi e documenti dispersi tra WhatsApp, email e cartelle locali.
- Dare al proprietario una visione immediata di pagamenti, scadenze, consumi e problemi aperti.
- Dare all'inquilino un modo semplice per consultare documenti, comunicare e seguire le proprie richieste.
- Conservare uno storico verificabile di spese, comunicazioni, allegati e interventi.
- Preparare un'architettura estendibile a più appartamenti, più proprietari e più inquilini.

## 3. Profili e permessi

Nel prodotto useremo il termine **proprietario (owner)** anziché “howner”. Il sistema deve applicare i permessi lato server, non soltanto nascondere elementi nell'interfaccia.

### Proprietario

Può:

- creare e configurare l'appartamento;
- invitare o rimuovere gli occupanti;
- pubblicare bollette, ricevute, contratti e comunicazioni;
- registrare affitto, spese condominiali e altre voci;
- vedere stato dei pagamenti e consumi disponibili;
- ricevere, assegnare e chiudere segnalazioni;
- creare appuntamenti e interventi;
- partecipare alla chat;
- configurare le integrazioni esterne.

### Inquilino / occupante

Può:

- consultare dashboard, bollette, spese e documenti a lui accessibili;
- vedere importi, scadenze e stato dei propri pagamenti;
- caricare ricevute o altri allegati;
- creare segnalazioni con foto e descrizione;
- seguire lo stato delle segnalazioni;
- partecipare alla chat;
- vedere e confermare appuntamenti o interventi.

### Estensione futura: amministratore o manutentore

Conviene non confondere il proprietario con l'amministratore di condominio. In futuro può essere introdotto un profilo esterno con accesso limitato a comunicazioni, documenti o interventi assegnati. Non è necessario nel primo MVP.

## 4. Struttura dell'app web

### Dashboard

La pagina iniziale deve mostrare soltanto le informazioni prioritarie per il profilo collegato:

- prossime scadenze e importi da pagare;
- ultime bollette e relativo stato;
- riepilogo dei consumi e confronto con il periodo precedente;
- segnalazioni aperte e relativo livello di urgenza;
- ultimi messaggi non letti;
- prossimi appuntamenti;
- azioni rapide: “Carica bolletta”, “Registra pagamento”, “Nuova segnalazione”, “Nuovo evento”.

Il proprietario vedrà una sintesi gestionale; l'inquilino vedrà soprattutto ciò che richiede una sua azione.

### Bollette e consumi

Funzioni previste:

- elenco per categoria: elettricità, gas, acqua, internet, condominio e altro;
- importo, periodo di riferimento, emissione, scadenza e stato;
- caricamento di PDF, immagini e ricevute;
- anteprima e download dell'allegato;
- ripartizione della spesa, inizialmente manuale;
- storico e filtri per periodo, categoria e stato;
- grafici dei consumi, se disponibili;
- notifiche prima della scadenza e per bollette non saldate.

Stati suggeriti: `bozza`, `da pagare`, `pagata`, `scaduta`, `contestata`.

### Spese e affitto

- canone mensile e relativa scadenza;
- deposito cauzionale;
- spese ricorrenti e straordinarie;
- registrazione del pagamento e caricamento ricevuta;
- distinzione tra importo previsto, pagato e residuo;
- storico mensile e totale annuale;
- esportazione futura in CSV o PDF.

Nel primo MVP il pagamento viene registrato manualmente. I pagamenti online richiedono una fase separata per provider, commissioni, rimborsi e aspetti fiscali.

### Segnalazioni

Una segnalazione deve contenere:

- titolo e descrizione;
- categoria, ad esempio idraulica, elettricità, elettrodomestici, condominio;
- urgenza;
- foto, video brevi o documenti;
- data e autore;
- stato e responsabile;
- commenti e storico delle modifiche;
- eventuale appuntamento collegato.

Flusso suggerito: `aperta` → `presa in carico` → `intervento programmato` → `risolta` → `chiusa`. Deve essere possibile riaprire una segnalazione.

### Messaggi e comunicazioni

Separare due concetti:

1. **Chat**, per conversazioni rapide tra proprietario e occupanti.
2. **Comunicazioni**, per avvisi più formali, eventualmente con conferma di lettura e allegati.

Ogni conversazione può essere generale oppure collegata a una bolletta, una segnalazione o un appuntamento. Sono necessarie notifiche e indicatori dei messaggi non letti.

### Calendario

- vista mensile e agenda;
- interventi di manutenzione, sopralluoghi, scadenze e incontri;
- partecipanti, luogo, note e promemoria;
- conferma o rifiuto dell'invito;
- collegamento tra evento e segnalazione;
- futura sincronizzazione con Google Calendar.

### Documenti

Archivio per contratto, verbali, certificazioni, inventario, regolamento e altri file non riconducibili a una singola bolletta. Ogni documento deve avere categoria, visibilità, autore, data e versione.

## 5. Integrazioni esterne

### Octopus Energy

La documentazione ufficiale Octopus espone API per account, tariffe e consumi. L'API REST documenta letture di consumo elettrico a intervalli di mezz'ora e richiede, per i dati del cliente, una API key. La documentazione GraphQL include anche telemetria di smart meter compatibili, ma disponibilità e granularità dipendono dal dispositivo, dall'account e dai permessi concessi.

Quindi “tempo reale” non deve essere promesso nel primo rilascio. È necessaria una **prova tecnica** usando l'account reale e verificando:

- paese e servizio Octopus utilizzato;
- tipo di smart meter e presenza di un dispositivo compatibile;
- credenziali/API disponibili;
- frequenza e ritardo effettivo dei dati;
- limiti di chiamata e condizioni d'uso;
- consenso esplicito del titolare dell'utenza.

Approccio consigliato:

1. MVP: inserimento manuale o importazione periodica dei consumi.
2. Fase successiva: collegamento Octopus in sola lettura e sincronizzazione pianificata.
3. Solo dopo la prova tecnica: widget quasi in tempo reale, se supportato dall'account.

Le chiavi Octopus devono essere cifrate e gestite esclusivamente dal backend; non devono mai arrivare al browser.

Riferimenti ufficiali consultati:

- [Octopus Energy — REST API endpoints](https://docs.octopus.energy/rest/guides/endpoints/)
- [Octopus Energy — GraphQL smart meter telemetry](https://docs.octopus.energy/graphql/reference/queries/)

### WhatsApp

L'integrazione va valutata in una fase successiva. Possibili obiettivi:

- inviare notifiche o promemoria;
- ricevere messaggi e allegarli a una conversazione;
- aprire WhatsApp con un messaggio precompilato.

Una vera chat bidirezionale richiede WhatsApp Business Platform, template approvati per alcuni messaggi, gestione dei consensi, costi e webhook. Per il primo MVP è preferibile una chat interna con notifiche email; eventualmente si può aggiungere un semplice collegamento “Apri in WhatsApp”.

### Email

Due livelli possibili:

- MVP: email transazionali per inviti, scadenze, nuovi messaggi e aggiornamenti delle segnalazioni;
- futuro: ricezione e associazione automatica delle risposte email alle conversazioni interne.

Il secondo livello richiede indirizzi dedicati, parsing dei messaggi, gestione degli allegati e protezione da spam o spoofing.

### Google Calendar

L'utente potrà collegare il proprio account tramite OAuth. L'app dovrà chiedere il minor numero di permessi possibile e consentire la disconnessione. Per ridurre complessità, la prima integrazione dovrebbe essere unidirezionale: creare o aggiornare su Google Calendar gli eventi generati nell'app. La sincronizzazione bidirezionale può arrivare in seguito, perché introduce conflitti e cancellazioni da riconciliare.

## 6. Requisiti del primo MVP web

### Inclusi

- registrazione, accesso e recupero password;
- un appartamento con un proprietario e uno o più occupanti invitati;
- ruoli e autorizzazioni;
- dashboard differenziata per ruolo;
- bollette con allegati e stati;
- affitto e spese con registrazione manuale dei pagamenti;
- segnalazioni con immagini, commenti e workflow;
- chat interna essenziale;
- calendario interno;
- notifiche in-app ed email;
- archivio documenti;
- interfaccia responsive per desktop, tablet e smartphone;
- registro delle principali attività.

### Esclusi dal primo MVP

- app native iOS e Android;
- pagamenti online;
- integrazione WhatsApp bidirezionale;
- sincronizzazione Google Calendar bidirezionale;
- dati Octopus realmente live senza previa prova tecnica;
- gestione di amministratori e manutentori esterni;
- contabilità o generazione di documenti fiscali;
- marketplace di fornitori.

## 7. Flussi principali

### Avvio dell'appartamento

1. Il proprietario crea l'account.
2. Inserisce dati essenziali dell'immobile.
3. Invita gli occupanti via email.
4. Gli occupanti accettano l'invito e impostano la password.
5. Il proprietario inserisce canone, scadenze e primi documenti.

### Gestione di una bolletta

1. Il proprietario carica PDF o foto.
2. Inserisce categoria, periodo, importo e scadenza.
3. L'app notifica gli occupanti interessati.
4. Un utente registra il pagamento e allega la ricevuta.
5. Il proprietario conferma o corregge lo stato.

### Gestione di un guasto

1. L'inquilino crea una segnalazione con foto e urgenza.
2. Il proprietario la prende in carico e comunica nella discussione collegata.
3. Viene programmato un intervento nel calendario.
4. Dopo l'intervento la segnalazione passa a risolta.
5. L'inquilino conferma oppure chiede la riapertura.

## 8. Modello dati iniziale

Entità principali:

- `User`: identità, contatti, preferenze e stato account;
- `Property`: appartamento e relativo indirizzo;
- `Membership`: relazione utente–appartamento, ruolo e periodo di validità;
- `Tenancy`: locazione, canone, deposito, date e occupanti;
- `Bill`: bolletta, categoria, periodo, importo, scadenza e stato;
- `Expense`: affitto o altra spesa;
- `PaymentRecord`: pagamento registrato e relativo importo;
- `Attachment`: file, tipo, dimensione, autore e visibilità;
- `Issue`: segnalazione, categoria, urgenza, stato e assegnatario;
- `Conversation`, `Message`, `ReadReceipt`: chat e letture;
- `CalendarEvent`, `Participant`: eventi e partecipazioni;
- `Notification`: notifiche in-app/email;
- `IntegrationConnection`: collegamenti Octopus, Google o futuri provider;
- `ConsumptionReading`: letture normalizzate con fonte, unità e data/ora;
- `AuditLog`: operazioni rilevanti e autore.

La relazione utente–immobile non deve essere codificata direttamente dentro `User`: questo consente a una persona di avere ruoli diversi su immobili diversi in futuro.

## 9. Architettura proposta

Per la web app è adatta un'architettura modulare, inizialmente distribuita come un unico prodotto:

- frontend responsive e installabile come PWA;
- backend con API e controllo centralizzato dei permessi;
- database relazionale, ad esempio PostgreSQL;
- object storage privato per PDF, foto e altri allegati;
- servizio di job in background per email, notifiche e sincronizzazioni;
- aggiornamenti live per chat e notifiche tramite WebSocket o servizio realtime;
- adapter separati per Octopus, Google Calendar, email e WhatsApp.

Una possibile implementazione pragmatica è Next.js con TypeScript, PostgreSQL e un ORM, autenticazione gestita e object storage compatibile S3. La scelta definitiva dipenderà da hosting, budget, competenze e requisiti di residenza dei dati.

Per il futuro mobile sono possibili due percorsi:

- partire dalla PWA responsive, sufficiente per validare il prodotto;
- aggiungere in seguito un'app React Native/Expo che riutilizzi API, tipi e regole del backend.

## 10. Sicurezza, privacy e affidabilità

- autorizzazione verificata per ogni immobile e risorsa;
- file privati accessibili con URL temporanei;
- cifratura delle credenziali delle integrazioni;
- autenticazione robusta e possibilità futura di 2FA;
- validazione di tipo e dimensione degli allegati e scansione antivirus;
- audit log per modifiche a importi, stati e documenti;
- backup del database e policy di conservazione dei file;
- esportazione e cancellazione dei dati secondo le regole applicabili;
- consenso e informativa chiari per consumi e integrazioni;
- accessibilità almeno WCAG 2.2 livello AA come obiettivo di progetto;
- date salvate con fuso orario e importi salvati come valori decimali con valuta.

Prima della pubblicazione servirà una verifica privacy e legale specifica per il paese d'uso, soprattutto per documenti personali, messaggi, dati energetici e conservazione dei contratti.

## 11. Requisiti non funzionali

- mobile-first e utilizzabile da browser moderni;
- caricamento rapido della dashboard anche con connessioni mobili;
- interfaccia in italiano, predisposta alla localizzazione;
- notifiche non duplicate e configurabili dall'utente;
- ricerca e filtri sulle liste principali;
- tracciamento degli errori e monitoraggio del backend;
- test automatici per autorizzazioni, calcoli e flussi critici;
- separazione rigorosa dei dati tra immobili.

## 12. Roadmap proposta

### Fase 0 — Definizione

- confermare utenti reali e problemi prioritari;
- definire paese, valuta, tipo di contratto e fornitore energetico;
- produrre wireframe dei flussi principali;
- svolgere la prova tecnica Octopus.

### Fase 1 — MVP web

- autenticazione e inviti;
- dashboard;
- bollette, spese, pagamenti manuali e allegati;
- segnalazioni;
- chat interna;
- calendario interno e notifiche email.

### Fase 2 — Integrazioni

- Google Calendar unidirezionale;
- importazione consumi Octopus, se validata;
- notifiche WhatsApp o collegamento rapido;
- report ed esportazioni.

### Fase 3 — Evoluzione

- multi-immobile;
- ruoli amministratore/manutentore;
- app mobile;
- pagamenti online;
- automazioni e analisi avanzata dei consumi.

## 13. Metriche utili

- percentuale di bollette registrate e pagate entro la scadenza;
- tempo medio di presa in carico e chiusura delle segnalazioni;
- numero di conversazioni o documenti gestiti senza uscire dall'app;
- utenti attivi mensili per ruolo;
- percentuale di inviti accettati;
- successo e freschezza delle sincronizzazioni esterne;
- errori di accesso a risorse non autorizzate, che devono restare a zero.

## 14. Decisioni ancora da prendere

Prima di passare al design o allo sviluppo è utile chiarire:

1. In quale paese si trova l'appartamento e quale valuta deve essere usata?
2. “Octopus” indica Octopus Energy e l'utenza è intestata al proprietario o all'inquilino?
3. L'app sarà inizialmente per un solo appartamento o deve supportarne subito più di uno?
4. Chi può dichiarare una spesa pagata e chi deve confermarla?
5. Le spese vengono sempre attribuite a una sola persona oppure devono essere ripartite?
6. I messaggi devono avere valore solo informativo o serve una conferma formale di lettura?
7. Quali documenti devono essere visibili a tutti e quali soltanto al proprietario?
8. Quali notifiche sono indispensabili nel primo rilascio?
9. È preferibile una soluzione cloud gestita oppure esistono vincoli di hosting e budget?

## 15. Prossimo passo consigliato

Trasformare questa analisi in una specifica del primo MVP e in wireframe per cinque schermate: accesso/invito, dashboard proprietario, dashboard inquilino, dettaglio bolletta e dettaglio segnalazione. In parallelo va verificata l'integrazione Octopus con un account reale, senza memorizzare credenziali nel frontend.
