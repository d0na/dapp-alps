import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Badge,
  Input,
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import StepConfiguration from "./StepConfiguration";

const StepReviewGenerate = ({ 
  generatedJson, 
  generatedContract,
  generateJson, 
  handleBack, 
  handleNext,
  manualData,
  rules
}) => {
  const classes = useBuildSmartLicenseStyles();
  const [activeTab, setActiveTab] = useState('1');
  const [approvalStatus, setApprovalStatus] = useState('pending'); // pending, sent, approved, deployed
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);


  // Send for approval
  const sendForApproval = () => {
    if (!recipientAddress) {
      alert('Please enter recipient address');
      return;
    }
    
    setIsValidating(true);
    // Simulate sending for approval
    setTimeout(() => {
      setApprovalStatus('sent');
      setIsValidating(false);
      alert('License sent for approval to ' + recipientAddress);
    }, 2000);
  };

  // Approve license
  const approveLicense = () => {
    setApprovalStatus('approved');
    alert('License approved! Ready for deployment.');
  };

  // Deploy license
  const deployLicense = () => {
    setApprovalStatus('deployed');
    alert('Smart License deployed successfully!');
  };

  // Contract is now generated automatically by the parent component
  // when transitioning from Step 2 to Step 3


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

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedJson);
      alert('JSON copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedJson;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('JSON copied to clipboard!');
    }
  };

  // Render read-only form derived from JSON
  const renderReadOnlyForm = () => {
    if (!generatedJson) {
      return (
        <Alert color="info">
          No JSON configuration available. Please generate the JSON first.
        </Alert>
      );
    }

    let jsonData;
    try {
      jsonData = JSON.parse(generatedJson);
    } catch (error) {
      return (
        <Alert color="danger">
          Error parsing JSON configuration: {error.message}
        </Alert>
      );
    }

    return (
      <div>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>License Name</strong></Label>
              <Input type="text" value={jsonData.name || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Territory</strong></Label>
              <Input type="text" value={jsonData.territory || ''} readOnly />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>Licensor</strong></Label>
              <Input type="text" value={jsonData.licensor || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Licensee</strong></Label>
              <Input type="text" value={jsonData.licensee || ''} readOnly />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>Duration</strong></Label>
              <Input type="text" value={jsonData.duration || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Intellectual Property</strong></Label>
              <Input type="textarea" value={jsonData.ips || ''} readOnly rows="3" />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="12">
            <h5 style={{ marginTop: '20px', marginBottom: '15px' }}>Rules Configuration</h5>
            {jsonData.rules && jsonData.rules.length > 0 ? (
              jsonData.rules.map((rule, index) => (
                <Card key={rule.id || index} style={{ marginBottom: '15px' }}>
                  <CardHeader>
                    <CardTitle tag="h6">Rule {index + 1}: {rule.name}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col md="6">
                        <strong>Validity Period:</strong> {rule.validityStart} - {rule.validityEnd}
                      </Col>
                      <Col md="6">
                        <strong>Evaluation Interval:</strong> {rule.evaluationInterval?.duration || 'N/A'}
                      </Col>
                    </Row>
                    
                    {rule.royaltyBase && rule.royaltyBase.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        <strong>Royalty Bases:</strong>
                        {rule.royaltyBase.map((rb, rbIndex) => (
                          <div key={rb.id || rbIndex} style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <Badge color="info" style={{ marginRight: '5px' }}>RB{rbIndex + 1}</Badge>
                            {rb.displayName} - {rb.intellectualProperty}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {rule.royaltyRate && (
                      <div style={{ marginTop: '15px' }}>
                        <strong>Royalty Rate:</strong> {rule.royaltyRate.type}
                        {rule.royaltyRate.type === 'lumpsum' && ` - $${rule.royaltyRate.lumpsumValue}`}
                        {rule.royaltyRate.type === 'proportional' && ` - $${rule.royaltyRate.proportionalValue} × ${rule.royaltyRate.proportionalRB}`}
                        {rule.royaltyRate.type === 'custom' && (
                          <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <strong>Custom Function:</strong> {rule.royaltyRate.customFunc}
                            {rule.royaltyRate.summary && (
                              <div style={{ fontStyle: 'italic', color: '#666' }}>
                                {rule.royaltyRate.summary}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            ) : (
              <Alert color="warning">
                No rules configured in this license.
              </Alert>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Review & Generate Smart License</CardTitle>
        <p className="card-category">
          Review configuration, generate smart contract, and manage approval process
        </p>
        
        {/* Approval Status */}
        <div style={{ marginTop: '15px' }}>
          <Badge 
            color={
              approvalStatus === 'pending' ? 'secondary' :
              approvalStatus === 'sent' ? 'warning' :
              approvalStatus === 'approved' ? 'success' :
              'info'
            }
            style={{ fontSize: '0.9rem', padding: '8px 12px' }}
          >
            Status: {
              approvalStatus === 'pending' ? 'Pending Review' :
              approvalStatus === 'sent' ? 'Sent for Approval' :
              approvalStatus === 'approved' ? 'Approved - Ready to Deploy' :
              'Deployed'
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardBody>
        {/* Tabs */}
        <Nav tabs>
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => setActiveTab('1')}
            >
              Original Configuration
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '2' ? 'active' : ''}
              onClick={() => setActiveTab('2')}
            >
              Form Review
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '3' ? 'active' : ''}
              onClick={() => setActiveTab('3')}
            >
              JSON Configuration
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '4' ? 'active' : ''}
              onClick={() => setActiveTab('4')}
            >
              Smart Contract
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* Tab 1: Original Configuration */}
          <TabPane tabId="1">
            <div style={{ 
              border: '2px solid #e9ecef', 
              borderRadius: '8px', 
              padding: '20px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ 
                marginBottom: '20px', 
                padding: '10px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <strong>Original Configuration (Read-Only)</strong>
                <br />
                <small className="text-muted">This shows the exact interface from Step 2 in read-only mode</small>
              </div>
              
              <StepConfiguration
                mode="manual"
                manualData={manualData}
                setManualData={() => {}} // No-op function for read-only
                rules={rules}
                setRules={() => {}} // No-op function for read-only
                aiText=""
                setAiText={() => {}} // No-op function for read-only
                handleNext={() => {}} // No-op function for read-only
                handleBack={() => {}} // No-op function for read-only
                showValidationErrors={false}
                setShowValidationErrors={() => {}} // No-op function for read-only
                isReadOnly={true} // Custom prop to make it read-only
              />
            </div>
          </TabPane>

          {/* Tab 2: Form Review */}
          <TabPane tabId="2">
            {renderReadOnlyForm()}
          </TabPane>

          {/* Tab 3: JSON Configuration */}
          <TabPane tabId="3">
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="generatedJson">Generated Smart License JSON</Label>
                  <textarea
                    id="generatedJson"
                    rows="25"
                    value={generatedJson}
                    readOnly
                    className={classes.jsonDisplay}
                    style={{
                      width: '100%',
                      minHeight: '500px',
                      height: 'auto',
                      resize: 'vertical',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      backgroundColor: '#f8f9fa',
                      overflowY: 'auto'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="6">
                <Button
                  color="secondary"
                  onClick={handleDownloadJson}
                  block
                  disabled={!generatedJson}
                >
                  Download JSON
                </Button>
              </Col>
              <Col md="6">
                <Button
                  color="warning"
                  onClick={handleCopyToClipboard}
                  block
                  disabled={!generatedJson}
                >
                  Copy to Clipboard
                </Button>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 4: Smart Contract */}
          <TabPane tabId="4">
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="generatedContract">Generated Smart Contract (Solidity)</Label>
                  <textarea
                    id="generatedContract"
                    rows="25"
                    value={generatedContract}
                    readOnly
                    style={{
                      width: '100%',
                      minHeight: '500px',
                      height: 'auto',
                      resize: 'vertical',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      backgroundColor: '#f8f9fa',
                      overflowY: 'auto'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="6">
                <Button
                  color="secondary"
                  onClick={() => {
                    const blob = new Blob([generatedContract], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `SmartLicense-${Date.now()}.sol`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  block
                  disabled={!generatedContract}
                >
                  Download .sol
                </Button>
              </Col>
              <Col md="6">
                <Button
                  color="warning"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedContract);
                      alert('Contract copied to clipboard!');
                    } catch (err) {
                      alert('Failed to copy to clipboard');
                    }
                  }}
                  block
                  disabled={!generatedContract}
                >
                  Copy Contract
                </Button>
              </Col>
            </Row>
          </TabPane>
        </TabContent>

        {/* Approval Actions */}
        <Row style={{ marginTop: '30px' }}>
          <Col md="12">
            <Card style={{ backgroundColor: '#f8f9fa' }}>
              <CardHeader>
                <CardTitle tag="h5">Approval & Deployment</CardTitle>
              </CardHeader>
              <CardBody>
                {approvalStatus === 'pending' && (
                  <Row>
                    <Col md="8">
                      <FormGroup>
                        <Label for="recipientAddress">Recipient Address (Licensor/Licensee)</Label>
                        <Input
                          type="text"
                          id="recipientAddress"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="0x..."
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <Button
                        color="primary"
                        onClick={sendForApproval}
                        disabled={!recipientAddress || !generatedJson || isValidating}
                        block
                        style={{ marginTop: '30px' }}
                      >
                        {isValidating ? 'Sending...' : 'Send for Approval'}
                      </Button>
                    </Col>
                  </Row>
                )}
                
                {approvalStatus === 'sent' && (
                  <Alert color="warning">
                    License sent for approval. Waiting for recipient to review and approve.
                  </Alert>
                )}
                
                {approvalStatus === 'approved' && (
                  <div>
                    <Alert color="success">
                      License approved by both parties! Ready for deployment.
                    </Alert>
                    <Button
                      color="success"
                      onClick={deployLicense}
                      size="lg"
                    >
                      Deploy Smart License
                    </Button>
                  </div>
                )}
                
                {approvalStatus === 'deployed' && (
                  <Alert color="info">
                    Smart License deployed successfully! The license is now active on the blockchain.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col md="12" className="text-right" style={{ marginTop: '15px' }}>
            <Button
              color="secondary"
              onClick={handleBack}
              style={{ marginRight: '15px' }}
            >
              Back
            </Button>
            <Button
              color="primary"
              onClick={handleNext}
              disabled={!generatedJson}
            >
              Next
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

StepReviewGenerate.propTypes = {
  generatedJson: PropTypes.string.isRequired,
  generatedContract: PropTypes.string.isRequired,
  generateJson: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  manualData: PropTypes.object, // Manual data for original configuration
  rules: PropTypes.array, // Rules for original configuration
};

export default StepReviewGenerate;