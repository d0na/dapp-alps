/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

import { Button, Row, Col } from "reactstrap";
import ActiveLicensesTable from "./tables/ActiveLicensesTable";

class ActiveLicenses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <ActiveLicensesTable {...this.props} />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default ActiveLicenses;
