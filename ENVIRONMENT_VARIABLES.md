# Environment Variables Configuration

Questo documento descrive le variabili d'ambiente utilizzate per configurare la DApp ALPS.

## Setup

1. **Crea il file `.env` nella directory `frontend/`:**
```bash
cd frontend
cp .env.example .env
```

2. **Modifica i valori nel file `.env` secondo le tue necessità**

## Variabili d'Ambiente

### Configurazione Generale

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `REACT_APP_DEFAULT_NETWORK` | `development` | Rete di default all'avvio |

### Development Network (Hardhat Local)

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `REACT_APP_DEV_RPC_URL` | `http://localhost:8545` | URL del nodo Hardhat locale |
| `REACT_APP_DEV_CHAIN_ID` | `31337` | Chain ID di Hardhat |
| `REACT_APP_DEV_NETWORK_NAME` | `Hardhat Local` | Nome visualizzato della rete |

### ALPS Network

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `REACT_APP_ALPS_RPC_URL` | `http://131.114.2.151:8545` | URL del nodo ALPS |
| `REACT_APP_ALPS_CHAIN_ID` | `1337` | Chain ID della rete ALPS |
| `REACT_APP_ALPS_NETWORK_NAME` | `ALPS Network` | Nome visualizzato della rete |
| `REACT_APP_ALPS_TOKEN_ADDRESS` | `0x...` | Indirizzo del contratto Token |
| `REACT_APP_ALPS_ENTITY_ADDRESS` | `0x...` | Indirizzo del contratto Entity |
| `REACT_APP_ALPS_MANAGER_ADDRESS` | `0x...` | Indirizzo del contratto Manager |

### Custom Network

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `REACT_APP_CUSTOM_RPC_URL` | `http://localhost:8545` | URL del nodo personalizzato |
| `REACT_APP_CUSTOM_CHAIN_ID` | `31337` | Chain ID della rete personalizzata |
| `REACT_APP_CUSTOM_NETWORK_NAME` | `Custom Network` | Nome visualizzato della rete |
| `REACT_APP_CUSTOM_TOKEN_ADDRESS` | (vuoto) | Indirizzo del contratto Token |
| `REACT_APP_CUSTOM_ENTITY_ADDRESS` | (vuoto) | Indirizzo del contratto Entity |
| `REACT_APP_CUSTOM_MANAGER_ADDRESS` | (vuoto) | Indirizzo del contratto Manager |

## Esempio di File .env

```env
# Network Configuration
REACT_APP_DEFAULT_NETWORK=development

# Development Network (Hardhat Local)
REACT_APP_DEV_RPC_URL=http://localhost:8545
REACT_APP_DEV_CHAIN_ID=31337
REACT_APP_DEV_NETWORK_NAME=Hardhat Local

# ALPS Network
REACT_APP_ALPS_RPC_URL=http://131.114.2.151:8545
REACT_APP_ALPS_CHAIN_ID=1337
REACT_APP_ALPS_NETWORK_NAME=ALPS Network
REACT_APP_ALPS_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
REACT_APP_ALPS_ENTITY_ADDRESS=0x2345678901234567890123456789012345678901
REACT_APP_ALPS_MANAGER_ADDRESS=0x3456789012345678901234567890123456789012

# Custom Network
REACT_APP_CUSTOM_RPC_URL=http://localhost:8545
REACT_APP_CUSTOM_CHAIN_ID=31337
REACT_APP_CUSTOM_NETWORK_NAME=Custom Network
REACT_APP_CUSTOM_TOKEN_ADDRESS=
REACT_APP_CUSTOM_ENTITY_ADDRESS=
REACT_APP_CUSTOM_MANAGER_ADDRESS=
```

## Note Importanti

1. **Prefisso `REACT_APP_`**: Tutte le variabili d'ambiente devono iniziare con `REACT_APP_` per essere accessibili nel codice React.

2. **Valori di Default**: Se una variabile non è definita, verrà utilizzato il valore di default specificato nel codice.

3. **Indirizzi dei Contratti**: Per la rete ALPS, assicurati di impostare gli indirizzi corretti dei contratti deployati.

4. **Riavvio**: Dopo aver modificato il file `.env`, riavvia il server di sviluppo React.

5. **Sicurezza**: Non committare il file `.env` nel repository. Usa `.env.example` per documentare le variabili necessarie.

## Configurazione per Diversi Ambienti

### Sviluppo Locale
```env
REACT_APP_DEFAULT_NETWORK=development
```

### Test su Rete ALPS
```env
REACT_APP_DEFAULT_NETWORK=alps
REACT_APP_ALPS_TOKEN_ADDRESS=0x...
REACT_APP_ALPS_ENTITY_ADDRESS=0x...
REACT_APP_ALPS_MANAGER_ADDRESS=0x...
```

### Produzione
```env
REACT_APP_DEFAULT_NETWORK=alps
# Imposta tutti gli indirizzi corretti per la produzione
```

