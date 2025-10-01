import { ethers } from "ethers";
import { getCurrentNetworkConfig } from "config/network";
import EntityArtifact from "contracts/EntityContract.json";

// Cache per evitare chiamate ripetute
const entityNameCache = new Map();

// Nomi di default fissi per fallback
const DEFAULT_NAMES = {
  licensor: "Unknown Licensor",
  licensee: "Unknown Licensee"
};

/**
 * Ottiene il nome di un'entità dato il suo indirizzo blockchain
 * @param {string} address - L'indirizzo blockchain dell'entità
 * @param {string} type - Il tipo di entità ('licensor' o 'licensee')
 * @returns {Promise<{name: string, isFromContract: boolean}>} - Il nome dell'entità e se è stato ottenuto dal contratto
 */
export const getEntityName = async (address, type = 'licensor') => {
  // Validazione input
  if (!address || typeof address !== 'string') {
    return { name: DEFAULT_NAMES[type] || DEFAULT_NAMES.licensor, isFromContract: false };
  }

  // Normalizza l'indirizzo
  const normalizedAddress = address.toLowerCase().trim();
  
  // Controlla la cache
  if (entityNameCache.has(normalizedAddress)) {
    return entityNameCache.get(normalizedAddress);
  }

  try {
    // Ottieni la configurazione della rete
    const networkConfig = getCurrentNetworkConfig();
    
    // Crea il provider
    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
    
    // Crea l'istanza del contratto
    const entityContract = new ethers.Contract(
      normalizedAddress,
      EntityArtifact.abi,
      provider
    );

    // Chiama la funzione name() del contratto
    const name = await entityContract.name();
    
    // Valida il nome restituito
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const cleanName = name.trim();
      const result = { name: cleanName, isFromContract: true };
      entityNameCache.set(normalizedAddress, result);
      return result;
    } else {
      throw new Error('Empty or invalid name returned from contract');
    }

  } catch (error) {
    console.warn(`Failed to get entity name for address ${address}:`, error.message);
    
    // Restituisce un nome di default
    const result = { name: DEFAULT_NAMES[type] || DEFAULT_NAMES.licensor, isFromContract: false };
    entityNameCache.set(normalizedAddress, result);
    return result;
  }
};


/**
 * Pulisce la cache dei nomi delle entità
 */
export const clearEntityNameCache = () => {
  entityNameCache.clear();
};

/**
 * Ottiene il nome di un'entità con debouncing per evitare chiamate eccessive
 * @param {string} address - L'indirizzo blockchain dell'entità
 * @param {string} type - Il tipo di entità ('licensor' o 'licensee')
 * @param {number} delay - Il delay in millisecondi per il debouncing
 * @returns {Promise<{name: string, isFromContract: boolean}>} - Il nome dell'entità e se è stato ottenuto dal contratto
 */
export const getEntityNameDebounced = (() => {
  const timeouts = new Map(); // Use Map to handle multiple addresses
  
  return (address, type = 'licensor', delay = 1000) => {
    return new Promise((resolve) => {
      const key = `${address}-${type}`;
      
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
      }
      
      const timeoutId = setTimeout(async () => {
        try {
          const result = await getEntityName(address, type);
          resolve(result);
        } catch (error) {
          resolve({ name: DEFAULT_NAMES[type] || DEFAULT_NAMES.licensor, isFromContract: false });
        } finally {
          timeouts.delete(key);
        }
      }, delay);
      
      timeouts.set(key, timeoutId);
    });
  };
})();
