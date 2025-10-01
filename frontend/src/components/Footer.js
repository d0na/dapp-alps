
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
        <Container>
          <Row>
            <Col md="12" className="text-center">
              <div style={{ 
                maxWidth: '1000px', 
                margin: '0 auto', 
                padding: '0 20px',
                lineHeight: '1.5'
              }}>
                <div className="copyright" style={{ marginBottom: '8px', fontSize: '12px' }}>
                  This is an application developed for a research project conducted by the Engineering Department, University of Cambridge, sponsored by Research England's Connecting Capability Fund award CCF18-7157 - Promoting the Internet of Things via Collaboration between HEIs and Industry (Pitch-In).
                </div>

                <div className="footerText" style={{ fontSize: '12px', fontWeight: '500' }}>
                  &copy; {1900 + new Date().getYear()}, ALPS
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}


export default Footer;
