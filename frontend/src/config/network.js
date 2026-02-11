// Network configuration - uses environment variables with fallback defaults
export const NETWORK_CONFIG = {
  development: {
    // Fallback values are used if env vars are missing.
    rpcUrl: process.env.REACT_APP_DEV_RPC_URL || "http://localhost:8545",
    chainId: parseInt(process.env.REACT_APP_DEV_CHAIN_ID) || 31337,
    name: process.env.REACT_APP_DEV_NETWORK_NAME || "Hardhat Local",
    contracts: {
      // These should be set via environment variables
      token: process.env.REACT_APP_DEV_TOKEN_ADDRESS || null,
      entity: process.env.REACT_APP_DEV_ENTITY_ADDRESS || null,
      manager: process.env.REACT_APP_DEV_MANAGER_ADDRESS || null
    }
  },
  alps: {
    // Fallback values are used if env vars are missing.
    rpcUrl: process.env.REACT_APP_ALPS_RPC_URL ,
    chainId: parseInt(process.env.REACT_APP_ALPS_CHAIN_ID) || 1337,
    name: process.env.REACT_APP_ALPS_NETWORK_NAME || "ALPS Network",
    contracts: {
      // These should be set via environment variables
      token: process.env.REACT_APP_ALPS_TOKEN_ADDRESS || null,
      entity: process.env.REACT_APP_ALPS_ENTITY_ADDRESS || null,
      manager: process.env.REACT_APP_ALPS_MANAGER_ADDRESS || null
    }
  },
  custom: {
    // Fallback values are used if env vars are missing.
    rpcUrl: process.env.REACT_APP_CUSTOM_RPC_URL || "http://localhost:8545",
    chainId: parseInt(process.env.REACT_APP_CUSTOM_CHAIN_ID) || 31337,
    name: process.env.REACT_APP_CUSTOM_NETWORK_NAME || "Custom Network",
    contracts: {
      token: process.env.REACT_APP_CUSTOM_TOKEN_ADDRESS || null,
      entity: process.env.REACT_APP_CUSTOM_ENTITY_ADDRESS || null,
      manager: process.env.REACT_APP_CUSTOM_MANAGER_ADDRESS || null
    }
  }
};

// Get current network configuration
export const getCurrentNetworkConfig = () => {
  const defaultNetwork = process.env.REACT_APP_DEFAULT_NETWORK || 'development';
  const networkType = localStorage.getItem('networkType') || defaultNetwork;
  return NETWORK_CONFIG[networkType] || NETWORK_CONFIG.development;
};

// Set network configuration
export const setNetworkConfig = (networkType) => {
  localStorage.setItem('networkType', networkType);
  return NETWORK_CONFIG[networkType] || NETWORK_CONFIG.development;
};

// Load contract addresses from deployment
// Get contract address for current network
export const getContractAddress = (contractType) => {
  const networkConfig = getCurrentNetworkConfig();
  const contractAddress = networkConfig.contracts[contractType];
  
  if (contractAddress && contractAddress !== '0x...' && contractAddress !== null) {
    return contractAddress;
  }
  
  // Fallback: try to get from sessionStorage
  const fallbackAddress = sessionStorage.getItem(`${contractType}Address`);
  if (fallbackAddress) {
    return fallbackAddress;
  }
  
  return null;
};

// Set contract address for current network
export const setContractAddress = (contractType, address) => {
  const networkType = localStorage.getItem('networkType') || 'development';
  const key = `${contractType}Address`;
  sessionStorage.setItem(key, address);
  console.log(`Set ${contractType} address for ${networkType}:`, address);
};
