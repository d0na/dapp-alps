# Setup Instructions - DApp ALPS

## Full setup

### 1. Start the local blockchain
```bash
# Terminal 1 - Start Hardhat node
npx hardhat node
```

### 2. Deploy the contracts
```bash
# Terminal 2 - Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Automatic configuration
Contract addresses are loaded automatically:
- Development: loaded from `contract-address.json` after deploy
- ALPS Network: uses preconfigured addresses
- Custom: uses environment variables

Manual address setup is no longer required.

### 4. Configure environment variables (optional)
```bash
# Copy the example file
cd frontend
cp .env.example .env

# Edit values if needed
# nano .env
```

### 5. Start the frontend
```bash
# Terminal 3 - Start React
cd frontend
npm start
```

## Network configuration

The application supports dynamic network configuration with automatic contract address handling.

### Development (recommended)
- URL: `http://localhost:8545`
- Chain ID: `31337`
- Addresses: loaded automatically from `contract-address.json` after deploy
- Use: Local development with Hardhat

### ALPS Network
- URL: `http://131.114.2.151:8545` (configurable via `REACT_APP_ALPS_RPC_URL`)
- Chain ID: `1337` (configurable via `REACT_APP_ALPS_CHAIN_ID`)
- Addresses: configurable via environment variables
- Use: ALPS production network

### Custom configuration
- URL: configurable via `REACT_APP_CUSTOM_RPC_URL`
- Chain ID: configurable via `REACT_APP_CUSTOM_CHAIN_ID`
- Addresses: configurable via environment variables
- Use: custom networks

## Environment variables configuration

### .env file
Create a `.env` file in `frontend/` to customize configuration:

```bash
cd frontend
cp .env.example .env
```

### Main variables
- `REACT_APP_DEFAULT_NETWORK`: default network (development/alps/custom)
- `REACT_APP_ALPS_*`: ALPS network configuration
- `REACT_APP_CUSTOM_*`: custom network configuration

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for full documentation.


