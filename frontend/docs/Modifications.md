# Setup Instructions - DApp ALPS

## Resolved issues

The following issues were identified and fixed:

### 1. SCSS error
- Problem: `Top-level selectors may not contain the parent selector "&"`
- Fix: Added `placeholder-global()` mixin for global use

### 2. Connection errors
- Problem: Hardcoded URL `131.114.2.151:8545` was unreachable
- Fix:
  - Dynamic network configuration
  - Automatic fallback to localhost
  - Improved error handling

### 3. Token handling
- Problem: Token missing in sessionStorage
- Fix: Validation checks and clear error messages

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

## Error handling

The application now shows clear errors:

1. Connection error: cannot connect to blockchain
2. Missing token: Entity contract address not configured
3. Contracts unavailable: contracts not deployed

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

See `ENVIRONMENT_VARIABLES.md` for full documentation.

## Files modified

1. `frontend/src/assets/scss/paper-dashboard/mixins/_inputs.scss`
   - Added `placeholder-global()` mixin

2. `frontend/src/Dapp.js`
   - Dynamic network configuration
   - Improved error handling
   - Automatic fallback

3. `frontend/src/config/network.js` (new)
   - Centralized network configuration
   - Environment variable support

4. `frontend/src/components/auth/BlockchainConfigDialog.js`
   - Improved network selection dialog

5. `frontend/.env.example` (new)
   - Environment variable template

6. `ENVIRONMENT_VARIABLES.md` (new)
   - Full environment variables documentation

## Troubleshooting

### Error "Could not establish connection"
- Check that the Hardhat node is running
- Ensure port 8545 is free
- Use the configuration dialog to change network

### Error "No entity contract address found"
- Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
- Addresses are loaded automatically
- Select the correct network in the configuration dialog

### Error "Failed to connect to blockchain"
- Verify network connectivity
- Check that the blockchain node is active
- Try changing the network in the configuration dialog

## Next steps

1. Start the Hardhat node
2. Deploy contracts
3. Set the token
4. Start the frontend
5. The application should work without errors

If you still see issues, check the browser console for detailed error messages.
