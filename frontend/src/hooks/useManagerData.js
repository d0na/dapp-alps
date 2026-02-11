import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { getToken } from "utils/Common";
import { getCurrentNetworkConfig, getContractAddress } from "config/network";
import ManagerArtifact from "contracts/ManagerContract.json";
import EntityArtifact from "contracts/EntityContract.json";
import activeLicensesMock from "assets/mock-data/activeLicensesTable-data.json";
import { getEntityNameDebounced } from "utils/EntityResolver";

const DEFAULT_POLL_INTERVAL_MS = 15000;
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true";

const buildMockManagerData = () =>
  activeLicensesMock.map((item, index) => {
    const managerAddress = `0x${(index + 1).toString(16).padStart(40, "0")}`;
    const licenseeAddress = `0x${(index + 1001).toString(16).padStart(40, "0")}`;
    const licensorAddress = `0x${(index + 2001).toString(16).padStart(40, "0")}`;
    return {
      managerAddress,
      licensee: item.Licensee,
      licensor: item.Licensor,
      licenseeAddress,
      licensorAddress,
      licenseeName: item.Licensee,
      licensorName: item.Licensor,
      isActive: true,
      royaltyData: [],
    };
  });

const transformManagerLegacyData = (data) => {
  const transformedData = [];
  if (!Array.isArray(data) || data.length % 3 !== 0) {
    console.log("Invalid array input for legacy data transform.");
    return transformedData;
  }
  for (let i = 0; i < data.length; i++) {
    transformedData.push(parseInt(data[i]._hex, 16));
  }
  return transformedData;
};

const buildErrorMessage = (error) => {
  const message = error?.message ? error.message : String(error);
  return `Failed to load blockchain data. Error: ${message}`;
};

export const useManagerData = (options = {}) => {
  const { pollIntervalMs = DEFAULT_POLL_INTERVAL_MS } = options;
  const [managerData, setManagerData] = useState([]);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const pollRef = useRef(null);
  const isMountedRef = useRef(true);
  const defaultNameRef = useRef({
    licensor: "Unknown Licensor",
    licensee: "Unknown Licensee",
  });

  const loadManagerData = useCallback(async () => {
    try {
      const networkConfig = getCurrentNetworkConfig();
      let provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

      try {
        await provider.getBlockNumber();
      } catch (connectError) {
        // Fallback to localhost if the configured RPC is not reachable.
        if (networkConfig.rpcUrl !== "http://localhost:8545") {
          provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
          await provider.getBlockNumber();
        } else {
          throw connectError;
        }
      }

      const entityAddress = getContractAddress("entity") || getToken();
      // Fallback to stored token if the env-provided contract address is missing.
      if (!entityAddress) {
        throw new Error("No entity contract address found.");
      }

      const signer = provider.getSigner(0);
      const entity = new ethers.Contract(entityAddress, EntityArtifact.abi, signer);
      const contractsArr = await entity.getActiveLicenseeSLs();

      const managerContracts = contractsArr.map(
        (address) => new ethers.Contract(address, ManagerArtifact.abi, signer)
      );

      const data = [];
      for (const manager of managerContracts) {
        const managerAddress = manager.address;
        const licensee = await manager.getLicensee();
        const licensor = await manager.getLicensor();
        const isActive = await manager.isActive();
        const royaltyData = transformManagerLegacyData(
          await manager.getRoyaltyHistoryLegacyDapp()
        );
        data.push({
          managerAddress,
          licensee,
          licensor,
          licenseeAddress: licensee,
          licensorAddress: licensor,
          isActive,
          royaltyData,
        });
      }

      if (isMountedRef.current) {
        setManagerData(data);
        setError(null);
        setIsMockData(false);
      }
    } catch (loadError) {
      console.error("Failed to load manager data:", loadError);
      if (USE_MOCK_DATA) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        if (isMountedRef.current) {
          setManagerData(buildMockManagerData());
          setError(null);
          setIsMockData(true);
        }
      } else if (isMountedRef.current) {
        setError(buildErrorMessage(loadError));
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadManagerData();

    if (pollIntervalMs > 0) {
      pollRef.current = setInterval(loadManagerData, pollIntervalMs);
    }

    return () => {
      isMountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [loadManagerData, pollIntervalMs]);

  const resolveEntityName = useCallback(
    async (address, type) => {
      if (!address || typeof address !== "string") {
        return { name: "", isFromContract: false };
      }
      if (isMockData) {
        const addressKey = type === "licensor" ? "licensorAddress" : "licenseeAddress";
        const nameKey = type === "licensor" ? "licensorName" : "licenseeName";
        const fallbackKey = type === "licensor" ? "licensor" : "licensee";
        const match = managerData.find((item) => item[addressKey] === address);
        const name =
          (match && (match[nameKey] || match[fallbackKey])) ||
          defaultNameRef.current[type] ||
          "";
        return { name, isFromContract: false };
      }
      return getEntityNameDebounced(address, type, 1000);
    },
    [isMockData, managerData]
  );

  return { managerData, error, isMockData, reload: loadManagerData, resolveEntityName };
};
