import React from "react";

import { Button, Row, Col } from "reactstrap";
import RoyaltiesTable from "./tables/RoyaltiesTable.js";

class Royalties extends React.Component {
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
              <RoyaltiesTable {...this.props} />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Royalties;
