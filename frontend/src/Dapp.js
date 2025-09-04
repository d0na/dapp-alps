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

import ManagerArtifact from "contracts/ManagerContract.json";
import EntityArtifact from "contracts/EntityContract.json";

import Royalties from "components/views/Royalties";
import { Redirect } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import ActiveLicenses from "components/views/ActiveLicenses";

var ps;
export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
      entity: undefined,
      managerData: [],
    };
    this.mainPanel = React.createRef();
    this.token = getToken();
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

  async _initializeEthers() {
    // We first initialize ethers by creating a provider
    let url = "http://131.114.2.151:8545";
    this._provider = new ethers.providers.JsonRpcProvider(url);
    // this._provider = new ethers.providers.JsonRpcProvider();
    this._provider.getBlockNumber().then((result) => {
      console.log("Current block number: " + result);
  });
    this._provider.listAccounts().then((result) => {
      console.log("Managed Accounts: " + result);
  });


    this._entity = new ethers.Contract(
      this.token,
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
    if (this._managerArr.length != 0) {
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
