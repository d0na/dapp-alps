# Mock Usage Map

This document lists where mocked data/files are used in the frontend codebase.

## useManagerData hook

- File: `src/hooks/useManagerData.js`
- Mock file: `src/assets/mock-data/activeLicensesTable-data.json`
- Env flag: `REACT_APP_USE_MOCK_DATA`
- Behavior: if blockchain fetch fails and `REACT_APP_USE_MOCK_DATA` is true, it falls back to mock manager data.

## Dapp data flow

- File: `src/Dapp.js`
- Usage: reads `isMockData` from `useManagerData` to reflect mock vs live data.

## Build Smart License (mock generation)

- File: `src/components/build-smart-license/BuildSmartLicense.js`
- Behavior: generates a mock smart license object for UI/flow when blockchain interaction is not available.

## Step Configuration (mock checks and data)

- File: `src/components/build-smart-license/steps/StepConfiguration.js`
- Behavior: uses mock logic to detect smart license/oracle addresses and returns mock data for configuration UI.
* * 
