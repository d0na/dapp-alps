import React from "react";

import Dashboard from "./components/Dashboard";
import PrivateRoute from "./utils/PrivateRoute.js";
import PublicRoute from "./utils/PublicRoute.js";

import PerfectScrollbar from "perfect-scrollbar";
import Footer from "./components/Footer.js";
import Sidebar from "./components/Sidebar.js";
import DemoNavbar from "./components/DemoNavbar.js";
import { ethers } from "ethers";
import { getToken } from "utils/Common";
import { getCurrentNetworkConfig, getContractAddress, loadContractAddresses, setContractAddress } from "config/network";
import "./debug-env"; // Debug environment variables

import ManagerArtifact from "contracts/ManagerContract.json";
import EntityArtifact from "contracts/EntityContract.json";

import Royalties from "components/views/Royalties";
import { Redirect } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import ActiveLicenses from "components/views/ActiveLicenses";
import BuildSmartLicense from "components/build-smart-license/BuildSmartLicense";

var ps;
export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
      entity: undefined,
      managerData: [],
      error: null,
    };
    this.mainPanel = React.createRef();
    this.token = getToken();
    this._managerArr = [];
  }

  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    this._initialize();
  }

  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    this._stopPollingData();
  }
  componentDidUpdate(e) {
    // e.preventDefault();
    if (e.history.action === "PUSH") {
      this.mainPanel.current.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
    }
  }
  handleActiveClick = (color) => {
    this.setState({ activeColor: color });
  };
  handleBgClick = (color) => {
    this.setState({ backgroundColor: color });
  };

  _initialize() {
    this._initializeEthers();
    this._startPollingData();
  }

  async _loadContractAddresses() {
    try {
      // Try to load from contract-address.json first
      const addresses = await loadContractAddresses();
      if (addresses) {
        // Set the addresses for the current network
        if (addresses.Token) {
          setContractAddress('token', addresses.Token);
        }
        if (addresses.Entity) {
          setContractAddress('entity', addresses.Entity);
        }
        if (addresses.Manager) {
          setContractAddress('manager', addresses.Manager);
        }
      }
    } catch (error) {
      console.log("Could not load contract addresses:", error);
    }
  }

  async _initializeEthers() {
    try {
      // Get network configuration
      const networkConfig = getCurrentNetworkConfig();
      console.log("Using network config:", networkConfig);
      console.log("Environment variables debug:");
      console.log("- REACT_APP_DEV_ENTITY_ADDRESS:", process.env.REACT_APP_DEV_ENTITY_ADDRESS);
      console.log("- REACT_APP_ALPS_ENTITY_ADDRESS:", process.env.REACT_APP_ALPS_ENTITY_ADDRESS);
      
      this._provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Test connection
      try {
        const blockNumber = await this._provider.getBlockNumber();
        console.log(`Connected to ${networkConfig.name}, block number: ${blockNumber}`);
      } catch (error) {
        console.error(`Failed to connect to ${networkConfig.name}:`, error);
        
        // Try fallback to localhost if not already trying localhost
        if (networkConfig.rpcUrl !== "http://localhost:8545") {
          console.log("Trying localhost fallback...");
          this._provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
          const blockNumber = await this._provider.getBlockNumber();
          console.log("Connected to localhost fallback, block number: " + blockNumber);
        } else {
          throw error;
        }
      }
      
      // List accounts (this might fail on some networks)
      try {
        const accounts = await this._provider.listAccounts();
        console.log("Managed Accounts: " + accounts);
      } catch (error) {
        console.log("Could not list accounts (this is normal for some networks)");
      }
    } catch (error) {
      console.error("Failed to initialize ethers provider:", error);
      // Set a flag to show error in UI
      this.setState({ 
        error: `Failed to connect to blockchain network. Please check your network configuration and ensure the node is running. Error: ${error.message}` 
      });
      return;
    }


    // Load contract addresses automatically
    await this._loadContractAddresses();
    
    // Get entity contract address
    const entityAddress = getContractAddress('entity') || this.token;
    if (!entityAddress) {
      console.error("No entity contract address found.");
      this.setState({ 
        error: "No entity contract address found. Please deploy contracts and try again." 
      });
      return;
    }
    
    console.log("Using entity contract address:", entityAddress);

    try {
      this._entity = new ethers.Contract(
        entityAddress,
        EntityArtifact.abi,
        this._provider.getSigner(0)
      );
      console.log("Entity contract:", this._entity);

      const contractsArr = await this._entity.getActiveLicenseeSLs();
      console.log(
        "Associated Manager Contracts: ",
        JSON.stringify(contractsArr, null, 4)
      );

      this._managerArr = new Array();
      for (const _address of contractsArr) {
        this._managerArr.push(
          new ethers.Contract(
            _address,
            ManagerArtifact.abi,
            this._provider.getSigner(0)
          )
        );
      }

      this._getManagerData();
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      this.setState({ 
        error: "Failed to initialize contracts. Please check your contract configuration." 
      });
    }
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._getManagerData(), 15000);
    // this._pollDataIntervalTest = setInterval(() => this._updateEntityData(), 1000);

    // We run it once immediately so we don't have to wait for it
    // this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  _transformManagerLegacyData(data) {
    let transformedData = [];
    if (data.length % 3 != 0) {
      console.log("Invalid array input for legacy data transform.");
    } else {
      for (let i = 0; i < data.length; i++) {
        transformedData.push(parseInt(data[i]._hex, 16));
      }
    }
    return transformedData;
  }

  async _getManagerData() {
    try {
      if (this._managerArr && this._managerArr.length != 0) {
        let _managerData = [];
        for (const _manager of this._managerArr) {
          let managerAddress = _manager.address;
          let licensee = await _manager.getLicensee();
          let licensor = await _manager.getLicensor();
          let isActive = await _manager.isActive();
          let royaltyData = this._transformManagerLegacyData(
            await _manager.getRoyaltyHistoryLegacyDapp()
          );
          _managerData.push({
            managerAddress,
            licensee,
            licensor,
            isActive,
            royaltyData,
          });
        }
        console.log("Manager Data Arr:", _managerData);
        this.setState({ managerData: [..._managerData] });
      } else {
        console.log("No manager contracts available");
      }
    } catch (error) {
      console.error("Error fetching manager data:", error);
      // Don't set error state here as it might be temporary
    }
  }

  render() {
    return (
      <div className="wrapper">
        {/* <BrowserRouter> */}
        <Sidebar
          // {...this.props}
          bgColor={this.state.backgroundColor}
          activeColor={this.state.activeColor}
        />
        <div className="main-panel" ref={this.mainPanel}>
          <DemoNavbar/>
          
          {/* Error Display */}
          {this.state.error && (
            <div className="alert alert-danger" style={{ margin: '20px', padding: '15px' }}>
              <h4>Configuration Error</h4>
              <p>{this.state.error}</p>
              <p><strong>To fix this:</strong></p>
              <ol>
                <li>Make sure Hardhat node is running: <code>npx hardhat node</code></li>
                <li>Deploy contracts: <code>npx hardhat run scripts/deploy.js --network localhost</code></li>
                <li>Select the correct network in the configuration dialog</li>
                <li>Contract addresses will be loaded automatically after deployment</li>
              </ol>
              <p><strong>Current network:</strong> {getCurrentNetworkConfig().name}</p>
              <p><strong>Entity contract:</strong> {getContractAddress('entity') || 'Not found'}</p>
            </div>
          )}

          {/* <Dashboard
            {...this.props}
            managerArr={this.managerArr}
            managerData={this.state.managerData}
            entity={this.entity}
          /> */}
          <Switch>
            <Route
              exact
              path="/">
            
                <Dashboard
                  // {...this.props}
                  managerArr={this.managerArr}
                  managerData={this.state.managerData}
                  // entity={this.entity}
                  key={0}
                />
              
          
            </Route>
            <Route
              path={"/royalties"} >
                <Royalties
                  {...this.props}
                  managerArr={this.managerArr}
                  managerData={this.state.managerData}
                  entity={this.entity}
                  key={1}
                />

            </Route>
            <Route
              path={"/licenses"} >
                <ActiveLicenses
                  {...this.props}
                  managerArr={this.managerArr}
                  managerData={this.state.managerData}
                  entity={this.entity}
                  key={2}
                />
              
            </Route>
            <Route
              path={"/create-smart-license"} >
                <BuildSmartLicense
                  {...this.props}
                  key={3}
                />
              
            </Route>
          </Switch>
          {/* <PrivateRoute path="/active-licenses" component={Dashboard} /> */}
          {/* <Redirect exact from="/" to="/" /> */}
          <Footer fluid />
        </div>
        {/* </BrowserRouter> */}
      </div>
    );
  }
}
