import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./Dapp";
import './utils/errorHandler'; // Add error handler for extension errors

// We import bootstrap here, but you can remove if you want
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";

import "./assets/scss/paper-dashboard.scss?v=1.2.0";
import "./assets/demo/demo.css";
import { Switch, NavLink, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./utils/PrivateRoute.js";
import PublicRoute from "./utils/PublicRoute.js";
import { Redirect } from "react-router-dom";

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        {/* <Route path="/login" component={Login} /> */}
        <PublicRoute path="/login" component={Login} />
        <PrivateRoute path="/" component={Dapp} />
        {/* <Route path="/" component={Dapp} /> */}
        {/* <PrivateRoute path="/dashboard" component={Dapp} /> */}
        <Redirect exact from="/" to="/" />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
