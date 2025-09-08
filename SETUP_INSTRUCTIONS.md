# Setup Instructions - DApp ALPS

## Problemi Risolti

Ho identificato e risolto i seguenti problemi:

### 1. **Errore SCSS** ✅
- **Problema**: `Top-level selectors may not contain the parent selector "&"`
- **Soluzione**: Creato mixin `placeholder-global()` per uso globale

### 2. **Errori di Connessione** ✅
- **Problema**: URL hardcoded `131.114.2.151:8545` non raggiungibile
- **Soluzione**: 
  - Configurazione dinamica della rete
  - Fallback automatico a localhost
  - Gestione errori migliorata

### 3. **Gestione Token** ✅
- **Problema**: Token mancante in sessionStorage
- **Soluzione**: Controlli di validazione e messaggi di errore chiari

## Setup Completo

### 1. **Avvia la Blockchain Locale**
```bash
# Terminal 1 - Avvia Hardhat node
npx hardhat node
```

### 2. **Deploya i Contratti**
```bash
# Terminal 2 - Deploya i contratti
npx hardhat run scripts/deploy.js --network localhost
```

### 3. **Configurazione Automatica** ✅
Gli indirizzi dei contratti vengono caricati automaticamente:
- **Development**: Carica automaticamente da `contract-address.json` dopo il deploy
- **ALPS Network**: Usa indirizzi pre-configurati
- **Custom**: Usa variabili d'ambiente

**Non è più necessario impostare manualmente gli indirizzi!**

### 4. **Configura le Variabili d'Ambiente (Opzionale)**
```bash
# Copia il file di esempio
cd frontend
cp .env.example .env

# Modifica i valori se necessario
# nano .env
```

### 5. **Avvia il Frontend**
```bash
# Terminal 3 - Avvia React
cd frontend
npm start
```

## Configurazione della Rete

L'applicazione ora supporta configurazione dinamica della rete con **gestione automatica degli indirizzi dei contratti**:

### **Development (Raccomandato)**
- URL: `http://localhost:8545`
- Chain ID: `31337`
- **Indirizzi**: Caricati automaticamente da `contract-address.json` dopo il deploy
- Uso: Sviluppo locale con Hardhat

### **ALPS Network**
- URL: `http://131.114.2.151:8545` (configurabile via `REACT_APP_ALPS_RPC_URL`)
- Chain ID: `1337` (configurabile via `REACT_APP_ALPS_CHAIN_ID`)
- **Indirizzi**: Configurabili via variabili d'ambiente
- Uso: Rete ALPS di produzione

### **Custom Configuration**
- URL: Configurabile via `REACT_APP_CUSTOM_RPC_URL`
- Chain ID: Configurabile via `REACT_APP_CUSTOM_CHAIN_ID`
- **Indirizzi**: Configurabili via variabili d'ambiente
- Uso: Reti personalizzate

## Gestione Errori

L'applicazione ora mostra errori chiari:

1. **Errore di Connessione**: Se non riesce a connettersi alla blockchain
2. **Token Mancante**: Se l'indirizzo del contratto Entity non è configurato
3. **Contratti Non Disponibili**: Se i contratti non sono deployati

## Configurazione con Variabili d'Ambiente

### **File .env**
Crea un file `.env` nella directory `frontend/` per personalizzare la configurazione:

```bash
cd frontend
cp .env.example .env
```

### **Variabili Principali**
- `REACT_APP_DEFAULT_NETWORK`: Rete di default (development/alps/custom)
- `REACT_APP_ALPS_*`: Configurazione rete ALPS
- `REACT_APP_CUSTOM_*`: Configurazione rete personalizzata

Vedi `ENVIRONMENT_VARIABLES.md` per la documentazione completa.

## File Modificati

1. **`frontend/src/assets/scss/paper-dashboard/mixins/_inputs.scss`**
   - Aggiunto mixin `placeholder-global()`

2. **`frontend/src/Dapp.js`**
   - Configurazione dinamica della rete
   - Gestione errori migliorata
   - Fallback automatico

3. **`frontend/src/config/network.js`** (NUOVO)
   - Configurazione centralizzata delle reti
   - Supporto variabili d'ambiente

4. **`frontend/src/components/auth/BlockchainConfigDialog.js`**
   - Dialog per selezione rete migliorato

5. **`frontend/.env.example`** (NUOVO)
   - Template per variabili d'ambiente

6. **`ENVIRONMENT_VARIABLES.md`** (NUOVO)
   - Documentazione completa variabili d'ambiente

## Troubleshooting

### **Errore "Could not establish connection"**
- Verifica che Hardhat node sia in esecuzione
- Controlla che la porta 8545 sia libera
- Usa il dialog di configurazione per cambiare rete

### **Errore "No entity contract address found"**
- Deploya i contratti: `npx hardhat run scripts/deploy.js --network localhost`
- Gli indirizzi vengono caricati automaticamente
- Seleziona la rete corretta nel dialog di configurazione

### **Errore "Failed to connect to blockchain"**
- Verifica la connessione di rete
- Controlla che il nodo blockchain sia attivo
- Prova a cambiare rete nel dialog di configurazione

## Prossimi Passi

1. Avvia Hardhat node
2. Deploya i contratti
3. Imposta il token
4. Avvia il frontend
5. L'applicazione dovrebbe funzionare senza errori!

Se incontri ancora problemi, controlla la console del browser per messaggi di errore dettagliati.
