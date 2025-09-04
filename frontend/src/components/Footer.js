
import React from "react";


import {
  Row,
  Col,
  Container,
} from "reactstrap";

class Footer extends React.Component {
  render() {
    return (
      <footer
        // className={"footer" + (this.props.default ? " footer-default" : "")}
        className={"footer footer-default"}
      >
        <Container fluid={this.props.fluid ? true : false}>
          <Row>

            <div className="credits ml-auto">
              <div className="copyright">
              This is an application developed for a research project conducted by the Engineering Department,  University of Cambridge,  sponsored by Research England’s Connecting Capability Fund award CCF18-7157 - 
              Promoting the Internet of Things via Collaboration between HEIs and Industry (Pitch-In).
              </div>

              <div className="footerText">
                &copy; {1900 + new Date().getYear()}, ALPS
              </div>
            </div>

          </Row>
        </Container>
      </footer>
    );
  }
}


export default Footer;
