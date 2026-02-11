# Dapp Contracts Overview

This project includes several smart contracts (in `../../contracts`). The dApp can interact with all of them, but some are support contracts invoked by others on-chain.

## Overview and relationships

- EntityContract (`../../contracts/EntityContract.sol`)
  - Manages lists of smart licenses as licensor/licensee.
  - Calls `ManagerContract.isActive()` to filter active/terminated licenses.
- ManagerContract (`../../contracts/ManagerContract.sol`)
  - Represents a Smart License with licensee/licensor, active status, and expiration.
  - Holds references to `Aggregator` and `RoyaltyComputation` and updates them (owner-only).
  - Exposes data used by the dApp (licensee/licensor, legacy royalties).
- AggregatorContract (`../../contracts/Aggregator.sol`)
  - Aggregates attribute values from `Verification`.
  - Provides values for royalty computation.
- RoyaltyComputationContract (`../../contracts/RoyaltyComputation.sol`)
  - Computes royalties using values from the `Aggregator`.
- VerificationContract (`../../contracts/Verification.sol`)
  - Gateway/oracle for collecting attribute values.
- Token (`../../contracts/Token.sol`)
  - Standalone example token (no dependency on other contracts).
- ALPSBase (`../../contracts/ALPSBase.sol`)
  - Shared types (structs) used by other contracts.
- Migrations (`../../contracts/Migrations.sol`)
  - Deployment/migration contract, not used by the dApp.

## Typical call chain

```
dApp -> EntityContract/ManagerContract
ManagerContract -> AggregatorContract/RoyaltyComputationContract
AggregatorContract -> VerificationContract
```

## Frontend note

Currently the frontend uses only `EntityContract` and `ManagerContract` via the ABIs in `../src/contracts/`.
