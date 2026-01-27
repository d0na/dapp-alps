# Environment Variables Configuration

This document describes the environment variables used to configure the ALPS DApp.

## Setup

1. Create the `.env` file in the `frontend/` directory:
```bash
cd frontend
cp .env.example .env
```

2. Edit values in `.env` as needed.

## Environment variables

### General configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_DEFAULT_NETWORK` | `development` | Default network on startup |

### Development network (Hardhat Local)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_DEV_RPC_URL` | `http://localhost:8545` | Hardhat local node URL |
| `REACT_APP_DEV_CHAIN_ID` | `31337` | Hardhat chain ID |
| `REACT_APP_DEV_NETWORK_NAME` | `Hardhat Local` | Display name of the network |

### ALPS network

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_ALPS_RPC_URL` | `http://131.114.2.151:8545` | ALPS node URL |
| `REACT_APP_ALPS_CHAIN_ID` | `1337` | ALPS chain ID |
| `REACT_APP_ALPS_NETWORK_NAME` | `ALPS Network` | Display name of the network |
| `REACT_APP_ALPS_TOKEN_ADDRESS` | `0x...` | Token contract address |
| `REACT_APP_ALPS_ENTITY_ADDRESS` | `0x...` | Entity contract address |
| `REACT_APP_ALPS_MANAGER_ADDRESS` | `0x...` | Manager contract address |

### Custom network

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_CUSTOM_RPC_URL` | `http://localhost:8545` | Custom node URL |
| `REACT_APP_CUSTOM_CHAIN_ID` | `31337` | Custom chain ID |
| `REACT_APP_CUSTOM_NETWORK_NAME` | `Custom Network` | Display name of the network |
| `REACT_APP_CUSTOM_TOKEN_ADDRESS` | (empty) | Token contract address |
| `REACT_APP_CUSTOM_ENTITY_ADDRESS` | (empty) | Entity contract address |
| `REACT_APP_CUSTOM_MANAGER_ADDRESS` | (empty) | Manager contract address |

## .env example

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

## Important notes

1. `REACT_APP_` prefix: all variables must start with `REACT_APP_` to be available in React code.
2. Default values: if a variable is not defined, the default value from code is used.
3. Contract addresses: for ALPS, set the correct deployed contract addresses.
4. Restart: after editing `.env`, restart the React dev server.
5. Security: do not commit `.env` to the repository. Use `.env.example` to document variables.

## Configuration for different environments

### Local development
```env
REACT_APP_DEFAULT_NETWORK=development
```

### Testing on ALPS network
```env
REACT_APP_DEFAULT_NETWORK=alps
REACT_APP_ALPS_TOKEN_ADDRESS=0x...
REACT_APP_ALPS_ENTITY_ADDRESS=0x...
REACT_APP_ALPS_MANAGER_ADDRESS=0x...
```

### Production
```env
REACT_APP_DEFAULT_NETWORK=alps
# Set all correct production addresses
```
