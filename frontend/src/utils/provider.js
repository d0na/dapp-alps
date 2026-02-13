import { ethers } from "ethers";

// Centralized RPC config driven by .env with light validation.
const NETWORK_CONFIG = {
  development: {
    rpcUrl: process.env.REACT_APP_DEV_RPC_URL,
    chainId: parseInt(process.env.REACT_APP_DEV_CHAIN_ID, 10) || 31337
  },
  alps: {
    rpcUrl: process.env.REACT_APP_ALPS_RPC_URL,
    chainId: parseInt(process.env.REACT_APP_ALPS_CHAIN_ID, 10) || 1337
  },
  custom: {
    rpcUrl: process.env.REACT_APP_CUSTOM_RPC_URL,
    chainId: parseInt(process.env.REACT_APP_CUSTOM_CHAIN_ID, 10) || 31337
  }
};

// Default network when localStorage is missing or empty.
const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK || "development";

let provider;
let providerNetworkKey;
const validatedNetworks = new Set();

// Reads user-selected network from localStorage (fallback to default).
const getNetworkKey = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_NETWORK;
  }
  return window.localStorage.getItem("networkType") || DEFAULT_NETWORK;
};

// Validate chainId once per network to catch misconfigured RPC endpoints.
const logConnection = (networkKey, rpcUrl, expectedChainId, actualChainId) => {
  const details = [
    `rpc=${rpcUrl}`,
    `expectedChainId=${expectedChainId || "n/a"}`,
    `actualChainId=${actualChainId || "n/a"}`
  ].join(", ");
  console.log(`[RPC] network=${networkKey} ${details}`);
};

const validateNetwork = async (networkKey, expectedChainId, rpcUrl) => {
  if (!expectedChainId || validatedNetworks.has(networkKey)) {
    return;
  }

  try {
    const network = await provider.getNetwork();
    logConnection(networkKey, rpcUrl, expectedChainId, network.chainId);
    if (network.chainId !== expectedChainId) {
      console.warn(
        `RPC chainId mismatch for ${networkKey}: expected ${expectedChainId}, got ${network.chainId}`
      );
    }
  } catch (error) {
    logConnection(networkKey, rpcUrl, expectedChainId, null);
    console.warn(`Failed to validate RPC network for ${networkKey}:`, error);
  } finally {
    validatedNetworks.add(networkKey);
  }
};

// Returns a shared provider for the current network selection.
export const getProvider = () => {
  const networkKey = getNetworkKey();
  const config = NETWORK_CONFIG[networkKey] || NETWORK_CONFIG[DEFAULT_NETWORK];
  let rpcUrl = config ? config.rpcUrl : undefined;

  if (!rpcUrl && networkKey === "development") {
    rpcUrl = "http://localhost:8545";
    console.warn(`[RPC] Missing DEV RPC URL, falling back to ${rpcUrl}`);
  }

  if (!config || !rpcUrl) {
    throw new Error(`Missing RPC URL for network: ${networkKey}`);
  }

  if (!provider || providerNetworkKey !== networkKey) {
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    providerNetworkKey = networkKey;
  }

  validateNetwork(networkKey, config.chainId, rpcUrl);

  return provider;
};
