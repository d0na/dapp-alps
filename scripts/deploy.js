// This is a script for deploying your contracts. You can adapt it to deploy

const { ethers } = require("hardhat");

// yours, or create new ones.
async function main() {
    // This is just a convenience check
    if (network.name === "hardhat") {
        console.warn(
            "You are trying to deploy a contract to the Hardhat Network, which" +
            "gets automatically created and destroyed every time. Use the Hardhat" +
            " option '--network localhost'"
        );
    }

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying the contracts with the account:",
        await deployer.getAddress()
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());
    const testAdr = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
    const testAdr2 = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();

    const Manager = await ethers.getContractFactory("ManagerContract");
    const manager1 = await Manager.deploy(testAdr, testAdr2, testAdr, testAdr2, 1250);
    await manager1.deployed();
    const manager2 = await Manager.deploy(testAdr2, testAdr, testAdr2, testAdr, 4500);
    await manager2.deployed();

    const EntityContract = await ethers.getContractFactory("EntityContract");
    const entityContract1 = await EntityContract.deploy("ENTITY V1", manager1.address, manager2.address);
    await entityContract1.deployed();
    console.log("Entity Address: ", entityContract1.address);


    // save the contract's artifacts and addresses in the frontend directories
    saveFrontendFiles(token, {
        token: token.address,
        entity: entityContract1.address,
        manager: manager1.address,
    });
    saveFrontendDevEnv({
        token: token.address,
        entity: entityContract1.address,
        manager: manager1.address,
    });
    // saveFrontendFiles(manager);
    const fs = require("fs");
    const contractsDir = __dirname + "/../frontend/src/contracts";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    const EntityArtifact = artifacts.readArtifactSync("EntityContract");
    const ManagerArtifact = artifacts.readArtifactSync("ManagerContract");
    fs.writeFileSync(
        contractsDir + "/ManagerContract.json",
        JSON.stringify(ManagerArtifact, null, 2)
    );
    fs.writeFileSync(
        contractsDir + "/EntityContract.json",
        JSON.stringify(EntityArtifact, null, 2)
    );
}

function saveFrontendFiles(token, addresses) {
    const fs = require("fs");
    const path = require("path");
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    const publicContractsDir = path.join(__dirname, "..", "frontend", "public", "contracts");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    if (!fs.existsSync(publicContractsDir)) {
        fs.mkdirSync(publicContractsDir, { recursive: true });
    }

    const addressPayload = {
        Token: addresses.token,
        Entity: addresses.entity,
        Manager: addresses.manager,
    };

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(addressPayload, undefined, 2)
    );
    fs.writeFileSync(
        path.join(publicContractsDir, "contract-address.json"),
        JSON.stringify(addressPayload, undefined, 2)
    );

    const TokenArtifact = artifacts.readArtifactSync("Token");

    fs.writeFileSync(
        path.join(contractsDir, "Token.json"),
        JSON.stringify(TokenArtifact, null, 2)
    );
}

function saveFrontendDevEnv(addresses) {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.join(__dirname, "..", "frontend", ".env.development");
    const entries = {
        REACT_APP_DEV_TOKEN_ADDRESS: addresses.token,
        REACT_APP_DEV_ENTITY_ADDRESS: addresses.entity,
        REACT_APP_DEV_MANAGER_ADDRESS: addresses.manager,
    };

    let content = "";
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, "utf8");
    }

    const lines = content.split(/\r?\n/);
    const updated = new Set();
    const nextLines = lines.map((line) => {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!match) {
            return line;
        }
        const key = match[1];
        if (Object.prototype.hasOwnProperty.call(entries, key)) {
            updated.add(key);
            return `${key}=${entries[key]}`;
        }
        return line;
    });

    for (const [key, value] of Object.entries(entries)) {
        if (!updated.has(key)) {
            nextLines.push(`${key}=${value}`);
        }
    }

    const output = nextLines.join("\n").replace(/\n+$/, "\n");
    fs.writeFileSync(envPath, output, "utf8");
}

function saveFrontendFilesDapp(contract, contractName) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../frontend/src/contracts";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify({ Token: token.address }, undefined, 2)
    );

    const TokenArtifact = artifacts.readArtifactSync("Token");

    fs.writeFileSync(
        contractsDir + "/Token.json",
        JSON.stringify(TokenArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
