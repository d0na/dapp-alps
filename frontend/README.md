# Sample React Dapp

This directory has a sample Dapp to interact with your contracts, built using
React.

## Docs

- Dapp contracts overview: [docs/README-DAPP.md](docs/README-DAPP.md)
- Mocked data usage: [docs/README-MOCKS.md](docs/README-MOCKS.md)
- Environment variables: [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)
- Setup instructions: [docs/SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)
- Smart License version flow: [docs/VERSION_STATUS_FLOW.md](docs/VERSION_STATUS_FLOW.md)

## Running the Dapp

This project uses [`create-react-app`](https://create-react-app.dev/), so most
configuration files are handled by it.

To run it, you just need to execute `npm start` in a terminal, and open
[http://localhost:3000](http://localhost:3000).

To learn more about what `create-react-app` offers, you can read
[its documentation](https://create-react-app.dev/docs/getting-started).

## Architecture of the Dapp

This Dapp consists of multiple React Components, which you can find in
`src/components`.

Most of them are presentational components, have no logic, and just render HTML.

The core functionality is implemented in `src/components/Dapp.js`, which has
examples of how to connect to the user's wallet, initialize your Ethereum
connection and contracts, read from the contract's state, and send transactions.

You can use the `Dapp` component as a starting point for your project. It has
comments explaining each part of its code, and indicating what's specific to
this project, and what can be reused.

## Note

Before running the dApp:

- Ensure the Hardhat node is running: `npx hardhat node`
- Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
- Select the correct network in the configuration dialog
- Contract addresses are loaded automatically after deployment

Current network: *Hardhat Local*
