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
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  Progress
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";

const StepDeployment = ({ 
  generatedJson, 
  generatedContract,
  uploadedSolidity,
  deploymentStatus,
  setDeploymentStatus,
  handleBack,
  handleNext
}) => {
  const classes = useBuildSmartLicenseStyles();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  // Send for approval
  const sendForApproval = () => {
    if (!recipientAddress) {
      alert('Please enter recipient address');
      return;
    }
    
    setIsValidating(true);
    // Simulate sending for approval
    setTimeout(() => {
      setDeploymentStatus('sent');
      setIsValidating(false);
      alert('License sent for approval to ' + recipientAddress);
    }, 2000);
  };

  // Approve license
  const approveLicense = () => {
    setDeploymentStatus('approved');
    alert('License approved! Ready for deployment.');
  };

  // Deploy license
  const deployLicense = () => {
    setDeploymentStatus('deploying');
    setDeploymentProgress(0);
    
    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDeploymentStatus('deployed');
          setContractAddress('0x' + Math.random().toString(16).substr(2, 40));
          setTransactionHash('0x' + Math.random().toString(16).substr(2, 64));
          alert('Smart License deployed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

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
    const blob = new Blob([generatedContract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartLicense-${Date.now()}.sol`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Deploy Smart License</CardTitle>
        <p className="card-category">
          Approve and deploy your smart license to the blockchain
        </p>
        
        {/* Approval Status */}
        <div style={{ marginTop: '15px' }}>
          <Badge 
            color={
              deploymentStatus === 'pending' ? 'secondary' :
              deploymentStatus === 'sent' ? 'warning' :
              deploymentStatus === 'approved' ? 'success' :
              deploymentStatus === 'deploying' ? 'info' :
              'primary'
            }
            style={{ fontSize: '0.9rem', padding: '8px 12px' }}
          >
            Status: {
              deploymentStatus === 'pending' ? 'Pending Review' :
              deploymentStatus === 'sent' ? 'Sent for Approval' :
              deploymentStatus === 'approved' ? 'Approved - Ready to Deploy' :
              deploymentStatus === 'deploying' ? 'Deploying...' :
              'Deployed Successfully'
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardBody>
        {/* License Summary */}
        <Row style={{ marginBottom: '30px' }}>
          <Col md="12">
            <Card style={{ backgroundColor: '#f8f9fa' }}>
              <CardHeader>
                <CardTitle tag="h5">License Summary</CardTitle>
              </CardHeader>
              <CardBody>
                {generatedJson && (
                  <div>
                    <h6>Configuration:</h6>
                    <pre style={{ 
                      backgroundColor: '#e9ecef', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {JSON.stringify(JSON.parse(generatedJson), null, 2)}
                    </pre>
                  </div>
                )}
                
                <Row style={{ marginTop: '15px' }}>
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
                      color="secondary"
                      onClick={handleDownloadContract}
                      block
                      disabled={!generatedContract}
                    >
                      Download Contract
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Approval Process */}
        <Row style={{ marginBottom: '30px' }}>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Approval Process</CardTitle>
              </CardHeader>
              <CardBody>
                {deploymentStatus === 'pending' && (
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
                
                {deploymentStatus === 'sent' && (
                  <Alert color="warning">
                    License sent for approval. Waiting for recipient to review and approve.
                  </Alert>
                )}
                
                {deploymentStatus === 'approved' && (
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
                
                {deploymentStatus === 'deploying' && (
                  <div>
                    <Alert color="info">
                      Deploying smart license to blockchain...
                    </Alert>
                    <Progress value={deploymentProgress} color="success" style={{ height: '20px' }}>
                      {deploymentProgress}%
                    </Progress>
                  </div>
                )}
                
                {deploymentStatus === 'deployed' && (
                  <div>
                    <Alert color="success">
                      <h5>🎉 Smart License Deployed Successfully!</h5>
                      <p>Your smart license is now active on the blockchain.</p>
                    </Alert>
                    
                    <Row>
                      <Col md="6">
                        <Card style={{ backgroundColor: '#d4edda' }}>
                          <CardBody>
                            <h6>Contract Address:</h6>
                            <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                              {contractAddress}
                            </code>
                            <br />
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(contractAddress);
                                alert('Contract address copied to clipboard!');
                              }}
                            >
                              Copy Address
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col md="6">
                        <Card style={{ backgroundColor: '#d1ecf1' }}>
                          <CardBody>
                            <h6>Transaction Hash:</h6>
                            <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                              {transactionHash}
                            </code>
                            <br />
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(transactionHash);
                                alert('Transaction hash copied to clipboard!');
                              }}
                            >
                              Copy Hash
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Row style={{ marginTop: '20px' }}>
                      <Col md="12" className="text-center">
                        <Button
                          color="primary"
                          size="lg"
                          onClick={() => {
                            // In a real app, this would open the contract on Etherscan
                            window.open(`https://etherscan.io/address/${contractAddress}`, '_blank');
                          }}
                          style={{ marginRight: '10px' }}
                        >
                          View on Etherscan
                        </Button>
                        <Button
                          color="success"
                          size="lg"
                          onClick={() => {
                            alert('License management dashboard would open here');
                          }}
                        >
                          Manage License
                        </Button>
                      </Col>
                    </Row>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Response to Sender (for verification mode) */}
        {uploadedSolidity && deploymentStatus === 'pending' && (
          <Row style={{ marginTop: '20px' }}>
            <Col md="12">
              <Card style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3' }}>
                <CardHeader>
                  <CardTitle tag="h5">Response to Sender</CardTitle>
                </CardHeader>
                <CardBody>
                  <Alert color="info">
                    <strong>License proposal ready for review.</strong> You can now respond to the sender.
                  </Alert>
                  <div className="text-center">
                    <Button
                      color="success"
                      onClick={() => {
                        setDeploymentStatus('approved');
                        alert('Response sent to sender! License is approved and ready for deployment.');
                      }}
                      size="lg"
                      style={{ marginRight: '10px' }}
                    >
                      Approve & Respond to Sender
                    </Button>
                    <Button
                      color="warning"
                      onClick={() => {
                        setDeploymentStatus('pending');
                        alert('Response sent to sender requesting changes.');
                      }}
                      size="lg"
                    >
                      Request Changes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col md="12" className="text-right" style={{ marginTop: '15px' }}>
            <Button
              color="secondary"
              onClick={handleBack}
              style={{ marginRight: '15px' }}
            >
              Back
            </Button>
            {deploymentStatus === 'deployed' && (
              <Button
                color="primary"
                onClick={handleNext}
              >
                Finish
              </Button>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

StepDeployment.propTypes = {
  generatedJson: PropTypes.string.isRequired,
  generatedContract: PropTypes.string.isRequired,
  uploadedSolidity: PropTypes.string, // Optional uploaded solidity contract
  deploymentStatus: PropTypes.string.isRequired,
  setDeploymentStatus: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default StepDeployment;
