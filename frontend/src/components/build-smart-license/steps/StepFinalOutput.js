import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  Alert,
} from "reactstrap";
import Toast from "../../common/Toast";
import useToast from "../../../hooks/useToast";

const StepFinalOutput = ({ 
  generatedJson, 
  generatedSmartContract, 
  handleBack, 
  handleDownloadAll,
  handleDeployContract
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Parse JSON to extract data for visualization
  const parseJsonForVisualization = () => {
    try {
      const data = JSON.parse(generatedJson);
      return data;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  const jsonData = parseJsonForVisualization();

  const handleDownloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-license-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadContract = () => {
    const blob = new Blob([generatedSmartContract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-license-contract-${Date.now()}.sol`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${type} copied to clipboard!`);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccess(`${type} copied to clipboard!`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Final Output - Smart License Generated</CardTitle>
        <p className="card-category">
          Review your generated JSON, Smart Contract, and summary
        </p>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md="12">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={activeTab === '1' ? 'active' : ''}
                  onClick={() => setActiveTab('1')}
                >
                  JSON Configuration
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === '2' ? 'active' : ''}
                  onClick={() => setActiveTab('2')}
                >
                  Smart Contract
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === '3' ? 'active' : ''}
                  onClick={() => setActiveTab('3')}
                >
                  License Summary
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
              {/* JSON Configuration Tab */}
              <TabPane tabId="1">
                <div style={{ padding: '20px 0' }}>
                  <Row>
                    <Col md="12">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <h5>JSON Configuration</h5>
                        <div>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => handleCopyToClipboard(generatedJson, 'JSON')}
                            style={{ marginRight: '10px' }}
                          >
                            Copy
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={handleDownloadJson}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <textarea
                        rows="25"
                        value={generatedJson}
                        readOnly
                        style={{
                          width: '100%',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '12px',
                          resize: 'vertical'
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* Smart Contract Tab */}
              <TabPane tabId="2">
                <div style={{ padding: '20px 0' }}>
                  <Row>
                    <Col md="12">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <h5>Generated Smart Contract</h5>
                        <div>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => handleCopyToClipboard(generatedSmartContract, 'Smart Contract')}
                            style={{ marginRight: '10px' }}
                          >
                            Copy
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={handleDownloadContract}
                            style={{ marginRight: '10px' }}
                          >
                            Download
                          </Button>
                          <Button
                            color="success"
                            size="sm"
                            onClick={handleDeployContract}
                          >
                            Deploy
                          </Button>
                        </div>
                      </div>
                      <textarea
                        rows="25"
                        value={generatedSmartContract}
                        readOnly
                        style={{
                          width: '100%',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '12px',
                          resize: 'vertical'
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* License Summary Tab */}
              <TabPane tabId="3">
                <div style={{ padding: '20px 0' }}>
                  {!jsonData ? (
                    <Alert color="warning">
                      <strong>No data available for summary.</strong> Please ensure the JSON is properly formatted.
                    </Alert>
                  ) : (
                    <Row>
                      {/* License Summary */}
                      <Col md="12">
                        <Card style={{ marginBottom: '20px' }}>
                          <CardHeader>
                            <CardTitle tag="h6">License Summary</CardTitle>
                          </CardHeader>
                          <CardBody>
                            <Row>
                              <Col md="3">
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                  <h6>License Name</h6>
                                  <Badge color="primary" style={{ fontSize: '14px' }}>
                                    {jsonData.smartLicense?.title || 'N/A'}
                                  </Badge>
                                </div>
                              </Col>
                              <Col md="3">
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                  <h6>Licensor</h6>
                                  <Badge color="info" style={{ fontSize: '14px' }}>
                                    {jsonData.smartLicense?.licensor || 'N/A'}
                                  </Badge>
                                </div>
                              </Col>
                              <Col md="3">
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                  <h6>Licensee</h6>
                                  <Badge color="success" style={{ fontSize: '14px' }}>
                                    {jsonData.smartLicense?.licensee || 'N/A'}
                                  </Badge>
                                </div>
                              </Col>
                              <Col md="3">
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                  <h6>Duration</h6>
                                  <Badge color="warning" style={{ fontSize: '14px' }}>
                                    {jsonData.smartLicense?.terms?.duration?.months || '0'} months
                                  </Badge>
                                </div>
                              </Col>
                            </Row>
                            <Row style={{ marginTop: '20px' }}>
                              <Col md="6">
                                <h6>Territory</h6>
                                <p>{jsonData.smartLicense?.terms?.territory || 'N/A'}</p>
                              </Col>
                              <Col md="6">
                                <h6>Royalty Rate</h6>
                                <p>{jsonData.smartLicense?.terms?.royaltyRate || '0'}%</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md="12">
                                <h6>Intellectual Property</h6>
                                <p>{jsonData.smartLicense?.intellectualProperty?.description || 'N/A'}</p>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  )}
                </div>
              </TabPane>
            </TabContent>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Row style={{ marginTop: '30px' }}>
          <Col md="12" className="text-center">
            <Button
              color="secondary"
              onClick={handleBack}
              style={{ marginRight: '15px' }}
            >
              Back
            </Button>
            <Button
              color="success"
              onClick={handleDownloadAll}
              style={{ marginRight: '15px' }}
            >
              Download All Files
            </Button>
            <Button
              color="primary"
              onClick={handleDeployContract}
            >
              Deploy Smart Contract
            </Button>
          </Col>
        </Row>
        
        {/* Toast Notifications */}
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      </CardBody>
    </Card>
  );
};

StepFinalOutput.propTypes = {
  generatedJson: PropTypes.string.isRequired,
  generatedSmartContract: PropTypes.string.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleDownloadAll: PropTypes.func.isRequired,
  handleDeployContract: PropTypes.func.isRequired,
};

export default StepFinalOutput;