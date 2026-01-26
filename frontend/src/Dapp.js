import React from "react";

import Dashboard from "./components/Dashboard";
import PrivateRoute from "./utils/PrivateRoute.js";
import PublicRoute from "./utils/PublicRoute.js";

import PerfectScrollbar from "perfect-scrollbar";
import Footer from "./components/Footer.js";
import Sidebar from "./components/Sidebar.js";
import DemoNavbar from "./components/DemoNavbar.js";
import { getCurrentNetworkConfig, getContractAddress } from "config/network";
import "./debug-env"; // Debug environment variables

import { useManagerData } from "hooks/useManagerData";

import Royalties from "components/views/Royalties";
import { Redirect } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import ActiveLicenses from "components/views/ActiveLicenses";
import BuildSmartLicense from "components/build-smart-license/BuildSmartLicense";

var ps;
export class DappLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
    };
    this.mainPanel = React.createRef();
  }

  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
  }

  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.body.classList.toggle("perfect-scrollbar-on");
    }
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
          {this.props.dataError && (
            <div className="alert alert-danger" style={{ margin: '20px', padding: '15px' }}>
              <h4>Configuration Error</h4>
              <p>{this.props.dataError}</p>
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
                  managerData={this.props.managerData}
                  // entity={this.entity}
                  key={0}
                />
              
          
            </Route>
            <Route
              path={"/royalties"} >
                <Royalties
                  {...this.props}
                  managerData={this.props.managerData}
                  key={1}
                />

            </Route>
            <Route
              path={"/licenses"} >
                <ActiveLicenses
                  {...this.props}
                  managerData={this.props.managerData}
                  key={2}
                />
              
            </Route>
            <Route
              path={"/create-smart-license"} >
                <BuildSmartLicense
                  {...this.props}
                  key={3}
                  resolveEntityName={this.props.resolveEntityName}
                />
              
            </Route>
          </Switch>
          {/* <PrivateRoute path="/active-licenses" component={Dashboard} /> */}
          {/* <Redirect exact from="/" to="/" /> */}
          <Footer />
        </div>
        {/* </BrowserRouter> */}
      </div>
    );
  }
}

export const Dapp = (props) => {
  const { managerData, error, isMockData, resolveEntityName } = useManagerData();
  return (
    <DappLayout
      {...props}
      managerData={managerData}
      dataError={error}
      isMockData={isMockData}
      resolveEntityName={resolveEntityName}
    />
  );
};
