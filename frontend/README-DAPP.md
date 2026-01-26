README Dapp Contracts

Questo progetto include diversi smart contract (in `../contracts`). La dApp puo' interagire con tutti, ma alcuni sono di supporto e vengono invocati tra loro on-chain.

Panoramica e relazioni

- EntityContract (`../contracts/EntityContract.sol`)
  - Gestisce liste di smart license come licensor/licensee.
  - Chiama `ManagerContract.isActive()` per filtrare licenze attive/terminate.
- ManagerContract (`../contracts/ManagerContract.sol`)
  - Rappresenta uno Smart License con licensee/licensor, stato attivo e scadenza.
  - Tiene riferimenti a `Aggregator` e `RoyaltyComputation` e li aggiorna (owner-only).
  - Espone dati usati dalla dApp (licensee/licensor, royalties legacy).
- AggregatorContract (`../contracts/Aggregator.sol`)
  - Aggrega valori di attributi leggendo da `Verification`.
  - Fornisce i valori per il calcolo delle royalties.
- RoyaltyComputationContract (`../contracts/RoyaltyComputation.sol`)
  - Calcola royalties usando i valori forniti dall'`Aggregator`.
- VerificationContract (`../contracts/Verification.sol`)
  - Gateway/oracolo per la raccolta dei valori di attributo.
- Token (`../contracts/Token.sol`)
  - Token di esempio standalone (non dipende dagli altri contratti).
- ALPSBase (`../contracts/ALPSBase.sol`)
  - Solo tipi condivisi (struct) usati dagli altri contratti.
- Migrations (`../contracts/Migrations.sol`)
  - Contratto di deploy/migrazione, non usato dalla dApp.

Catena tipica di chiamate

dApp -> EntityContract/ManagerContract
ManagerContract -> AggregatorContract/RoyaltyComputationContract
AggregatorContract -> VerificationContract

Note sul frontend

Attualmente nel frontend vengono usati solo `EntityContract` e `ManagerContract` tramite le ABI in `src/contracts/`.
