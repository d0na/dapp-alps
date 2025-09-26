# 📋 Flusso Logico degli Stati delle Versioni Smart License

## 🔄 **Stati Disponibili:**

### 1. **`draft`** - Versione in Bozza
- **Descrizione**: Versione ancora in lavorazione dal creatore
- **Colore**: Grigio (`secondary`)
- **Quando**: Durante la creazione iniziale o modifiche non ancora finalizzate

### 2. **`proposed`** - Versione Proposta
- **Descrizione**: Versione proposta per l'approvazione del validatore
- **Colore**: Blu (`primary`)
- **Quando**: Creatore ha completato la versione e la invia per approvazione

### 3. **`needs_revision`** - Necessita Revisione
- **Descrizione**: Versione rifiutata, necessita modifiche
- **Colore**: Arancione (`warning`)
- **Quando**: Validatore ha rifiutato la versione e richiede modifiche

### 4. **`approved`** - Approvata
- **Descrizione**: Versione approvata dal validatore
- **Colore**: Verde (`success`)
- **Quando**: Validatore ha approvato la versione ma non è ancora deployata

### 5. **`deployed`** - Deployata
- **Descrizione**: Versione deployata e attiva nel sistema
- **Colore**: Verde (`success`)
- **Quando**: Versione attiva e operativa

### 6. **`superseded`** - Sostituita
- **Descrizione**: Versione sostituita da una nuova versione
- **Colore**: Grigio chiaro (`light`)
- **Quando**: Una nuova versione ha sostituito questa versione

## 🔄 **Flusso di Transizione:**

```
draft → proposed → approved → deployed
  ↓         ↓
needs_revision ← ← ← ← ←
  ↓
proposed (nuova versione)
```

## 📊 **Esempio Pratico nel demo-license.json:**

### **Versione 1**: `superseded`
- **Storia**: Era `proposed` → `under_review` → `needs_revision` → `superseded`
- **Motivo**: Rifiutata per royalty troppo alte e durata troppo lunga
- **Feedback**: "Royalty rates too high, reduce by 30%, duration too long"

### **Versione 2**: `superseded`
- **Storia**: Era `proposed` → `under_review` → `needs_revision` → `superseded`
- **Motivo**: Rifiutata per mancanza di integrazione sensori aggiuntivi
- **Feedback**: "Need additional sensor suite integration"

### **Versione 3**: `deployed`
- **Storia**: Era `proposed` → `under_review` → `approved` → `deployed`
- **Motivo**: Approvata e deployata con successo
- **Feedback**: "Excellent improvements! Approved for deployment"

## 🎯 **Logica di Business:**

1. **Creatore** propone una versione (`proposed`)
2. **Validatore** decide direttamente:
   - ✅ **Approva** → `approved` → `deployed`
   - ❌ **Rifiuta** → `needs_revision` → creatore crea nuova versione
3. **Versione precedente** diventa `superseded` quando ne viene creata una nuova

## 🔧 **Implementazione UI:**

- **Tab di navigazione**: Mostrano tutti gli stati con colori appropriati
- **Feedback section**: Mostra solo per versioni con feedback
- **Status badges**: Colori coerenti in tutta l'interfaccia
- **Version details**: Mostrano la storia completa di ogni versione

## 🎨 **Colori degli Stati:**

- **Draft**: Grigio (`secondary`)
- **Proposed**: Blu (`primary`)
- **Needs Revision**: Arancione (`warning`)
- **Approved**: Verde (`success`)
- **Deployed**: Verde (`success`)
- **Superseded**: Grigio chiaro (`light`)
