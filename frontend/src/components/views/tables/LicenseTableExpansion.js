/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import ListItemText from "@material-ui/core/ListItemText";

import Divider from "@material-ui/core/Divider";

import {
  Card,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  Row,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Col,
  CardSubtitle,
} from "reactstrap";

import { Link } from "react-router-dom";
import { LicenseTableExtensionGraph } from "components/graphs/LicenseTableExpansionGraph";

class LicenseTableExtension extends React.Component {
  constructor(props) {
    super(props);
  }

  _getRoyaltiesSum(flag) {
    let roy = 0;
    if (this.props.managerData.length != 0) {
      for (const managerData of this.props.managerData) {
        if (managerData.managerAddress === this.props.managerAddress) {
          for (let i = 0; i < managerData.royaltyData.length - 2; i = i + 3) {
            if (managerData.royaltyData[i + 2] === flag) {
              roy += managerData.royaltyData[i];
            }
          }
        }
      }
    }
    return roy;
  }

  render() {
    console.log("expansion prop", this.props);

    let managerAddress = this.props.rowData[1];
    let unpaidRoyalties = this._getRoyaltiesSum(0);
    return (
      <>
        <div className="content">
          <div className="card-simple">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">
                  {" "}
                  Smart License - {managerAddress}{" "}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="4">
                    <Card className="card-simple">
                      <CardSubtitle> General Information </CardSubtitle>
                      <CardBody></CardBody>
                    </Card>
                    {/* <Row>
                      <Col md="6">
                        <Link to="/licensee/payments">
                          <Card className="card-stats">
                            <CardBody>
                              <Row>
                                <Col>
                                  <div className="icon-big text-center icon-warning">
                                    <i className="nc-icon nc-money-coins text-success" />
                                  </div>
                                </Col>
                                <Col md="8" xs="7">
                                  <div className="numbers">
                                    <p className="card-category">
                                      Related Payments
                                    </p>
                                    <CardTitle tag="p"></CardTitle>
                                    <p />
                                  </div>
                                </Col>
                              </Row>
                            </CardBody>
                            <CardFooter></CardFooter>
                          </Card>
                        </Link>
                      </Col>
                      <Col md="6">
                        <Link to={"/licensee/devices"}>
                          <Card className="card-stats">
                            <CardBody>
                              <Row>
                                <Col>
                                  <div className="icon-big text-center icon-warning">
                                    <i className="nc-icon nc-tile-56" />
                                  </div>
                                </Col>
                                <Col md="8" xs="7">
                                  <div className="numbers">
                                    <p className="card-category">
                                      Related Devices
                                    </p>
                                    <CardTitle tag="p"></CardTitle>
                                    <p />
                                  </div>
                                </Col>
                              </Row>
                            </CardBody>
                            <CardFooter></CardFooter>
                          </Card>
                        </Link>
                      </Col>
                    </Row> */}
                  </Col>
                  <Col md="8">
                    <Card className="chart">
                      <CardBody style={{ height: 375 }}>
                        <LicenseTableExtensionGraph
                          data={this.props.managerData}
                          managerAddress={this.props.managerAddress}
                        />
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="button-container">
                  <Row>
                    <Col className="ml-auto" lg="3" md="6" xs="6">
                      <h5>
                         <br />
                        <small>Related Devices</small>
                      </h5>
                    </Col>
                    <Col className="ml-auto mr-auto" lg="4" md="6" xs="6">
                      <h5>
                        {14.04} <br />
                        <small>Contract Starting Date</small>
                      </h5>
                    </Col>
                    <Col className="mr-auto" lg="3">
                      <h5>
                        {unpaidRoyalties}$ <br />
                        <small>Total Due Payment</small>
                      </h5>
                    </Col>
                  </Row>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }
}

export default LicenseTableExtension;
