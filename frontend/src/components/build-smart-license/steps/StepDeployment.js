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
  Input,
  Alert,
  Badge,
  Progress
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import Toast from "../../common/Toast";
import useToast from "../../../hooks/useToast";
import { sendForApproval as updateLicenseStatus } from '../utils/jsonGenerator';

const StepDeployment = ({ 
  generatedJson, 
  generatedContract,
  uploadedSolidity,
  setGeneratedJson,
  deploymentStatus,
  setDeploymentStatus,
  handleBack,
  handleNext
}) => {
  // Check if we're in verification mode (file upload mode)
  const isVerificationMode = !!uploadedSolidity;
  const classes = useBuildSmartLicenseStyles();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientType, setRecipientType] = useState('licensor'); // 'licensor' or 'licensee'
  const [approvalComment, setApprovalComment] = useState('');
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [shouldDownloadAfterUpdate, setShouldDownloadAfterUpdate] = useState(false);

  // Initialize recipient address when component mounts or JSON changes
  useEffect(() => {
    if (generatedJson && recipientType) {
      const addresses = getAddressesFromJson();
      setRecipientAddress(addresses[recipientType] || '');
    }
  }, [generatedJson, recipientType]);

  // Effect to handle download after state update
  useEffect(() => {
    if (shouldDownloadAfterUpdate && generatedJson) {
      // Check if the JSON has the updated status
      try {
        const jsonData = JSON.parse(generatedJson);
        if (jsonData.status === 'proposed') {
          // State has been updated, now download
          handleDownloadJson();
          handleDownloadContract();
          setShouldDownloadAfterUpdate(false);
          
          // Simulate sending for approval
          setTimeout(() => {
            setIsValidating(false);
            setDeploymentStatus('sent');
            showSuccess('License sent for approval! Status changed to "proposed". Files downloaded automatically.');
          }, 2000);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setShouldDownloadAfterUpdate(false);
        setIsValidating(false);
        showError('Error processing license data');
      }
    }
  }, [generatedJson, shouldDownloadAfterUpdate]);

  // Download functions
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

  // Check if license is in draft status
  const isDraftStatus = () => {
    if (!generatedJson) return false;
    try {
      const jsonData = JSON.parse(generatedJson);
      return jsonData.status === 'draft';
    } catch (error) {
      return false;
    }
  };

  // Get addresses from JSON
  const getAddressesFromJson = () => {
    if (!generatedJson) return { licensor: '', licensee: '' };
    
    try {
      const jsonData = JSON.parse(generatedJson);
      return {
        licensor: jsonData.parties?.licensor || '',
        licensee: jsonData.parties?.licensee || ''
      };
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { licensor: '', licensee: '' };
    }
  };

  // Update recipient address when type changes
  const handleRecipientTypeChange = (type) => {
    setRecipientType(type);
    const addresses = getAddressesFromJson();
    setRecipientAddress(addresses[type] || '');
  };

  // Send for approval
  const sendForApproval = () => {
    if (!recipientAddress) {
      showError('Please enter recipient address');
      return;
    }
    
    if (!generatedJson) {
      showError('No license data available to send for approval');
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Update license status to proposed
      const updatedJson = updateLicenseStatus(generatedJson);
      setGeneratedJson(updatedJson);
      
      // Set flag to download after state update
      setShouldDownloadAfterUpdate(true);
      
      setDeploymentStatus('sent');
      const message = approvalComment 
        ? `License sent for approval to ${recipientType}: ${recipientAddress}\nComment: ${approvalComment}`
        : `License sent for approval to ${recipientType}: ${recipientAddress}`;
      showSuccess(message);
    } catch (error) {
      setIsValidating(false);
      showError('Error sending license for approval: ' + error.message);
    }
  };

  // Approve license
  const approveLicense = () => {
    setDeploymentStatus('approved');
    showSuccess('License approved! Ready for deployment.');
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
          showSuccess('Smart License deployed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Deploy Smart License</CardTitle>
        <p className="card-category">
          {isVerificationMode 
            ? 'Deploy the verified smart license to the blockchain'
            : 'Approve and deploy your smart license to the blockchain'
          }
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

        {/* Approval Process - Only for creation mode */}
        {!isVerificationMode && (
          <Row style={{ marginBottom: '30px' }}>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Approval Process</CardTitle>
                </CardHeader>
                <CardBody>
                  {deploymentStatus === 'pending' && isDraftStatus() && (
                    <div>
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label for="recipientType">Recipient Type</Label>
                            <Input
                              type="select"
                              id="recipientType"
                              value={recipientType}
                              onChange={(e) => handleRecipientTypeChange(e.target.value)}
                            >
                              <option value="licensor">Licensor</option>
                              <option value="licensee">Licensee</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label for="recipientAddress">Recipient Address</Label>
                            <Input
                              type="text"
                              id="recipientAddress"
                              value={recipientAddress}
                              onChange={(e) => setRecipientAddress(e.target.value)}
                              placeholder="0x..."
                              readOnly={true}
                              style={{ backgroundColor: '#f8f9fa' }}
                            />
                            <small className="text-muted">
                              Address automatically filled from license data
                            </small>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="12">
                          <FormGroup>
                            <Label for="approvalComment">Approval Comment (Optional)</Label>
                            <Input
                              type="textarea"
                              id="approvalComment"
                              value={approvalComment}
                              onChange={(e) => setApprovalComment(e.target.value)}
                              placeholder="Add any comments or notes for the recipient..."
                              rows="3"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="12">
                          <Button
                            color="primary"
                            onClick={sendForApproval}
                            disabled={!recipientAddress || !generatedJson || isValidating}
                            size="lg"
                            block
                          >
                            {isValidating ? 'Sending...' : 'Send for Approval'}
                          </Button>
                        </Col>
                      </Row>
                    </div>
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
                        <h5>Smart License Deployed Successfully!</h5>
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
                                  showSuccess('Contract address copied to clipboard!');
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
                                  showSuccess('Transaction hash copied to clipboard!');
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
                              showInfo('License management dashboard would open here');
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
        )}

        {/* Direct Deployment for Verification Mode */}
        {isVerificationMode && (
          <Row style={{ marginBottom: '30px' }}>
            <Col md="12">
              <Card style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3' }}>
                <CardHeader>
                  <CardTitle tag="h5">Direct Deployment</CardTitle>
                </CardHeader>
                <CardBody>
                  <Alert color="info">
                    <strong>Verification Mode:</strong> Since you're reviewing an existing license proposal, you can deploy directly without approval process.
                  </Alert>
                  
                  {deploymentStatus === 'pending' && (
                    <div className="text-center">
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
                        <h5>Smart License Deployed Successfully!</h5>
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
                                  showSuccess('Contract address copied to clipboard!');
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
                                  showSuccess('Transaction hash copied to clipboard!');
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
                              showInfo('License management dashboard would open here');
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

StepDeployment.propTypes = {
  generatedJson: PropTypes.string.isRequired,
  generatedContract: PropTypes.string.isRequired,
  uploadedSolidity: PropTypes.string, // Optional uploaded solidity contract
  setGeneratedJson: PropTypes.func.isRequired,
  deploymentStatus: PropTypes.string.isRequired,
  setDeploymentStatus: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default StepDeployment;
