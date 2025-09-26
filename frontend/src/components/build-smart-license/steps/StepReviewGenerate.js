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
import Toast from "../../common/Toast";
import useToast from "../../../hooks/useToast";

// Convert JSON data to form data format for StepConfiguration
const convertJsonToFormData = (jsonString) => {
  try {
    const jsonData = JSON.parse(jsonString);
    
    // Check if this is the new versioned format or legacy format
    let manualData, rules;
    
    if (jsonData.versions && Array.isArray(jsonData.versions)) {
      // New versioned format - extract data from current version
      const currentVersion = jsonData.versions.find(v => v.versionNumber === jsonData.currentVersion) || jsonData.versions[jsonData.versions.length - 1];
      
      if (currentVersion && currentVersion.data) {
        manualData = {
          name: jsonData.name || '',
          territory: jsonData.parties?.territory || jsonData.territory || '',
          licensor: jsonData.parties?.licensor || jsonData.licensor || '',
          licensee: jsonData.parties?.licensee || jsonData.licensee || '',
          duration: currentVersion.data.duration || '',
          ips: currentVersion.data.ips || '',
          comment: currentVersion.comment || '',
          rules: currentVersion.data.rules || []
        };
        rules = currentVersion.data.rules || [];
      } else {
        throw new Error('No valid version data found');
      }
    } else {
      // Legacy format - process as before
      manualData = {
        name: jsonData.name || '',
        territory: jsonData.territory || '',
        licensor: jsonData.licensor || '',
        licensee: jsonData.licensee || '',
        duration: jsonData.duration || '',
        ips: jsonData.ips || '',
        comment: jsonData.comment || '',
        rules: jsonData.rules || []
      };
      rules = jsonData.rules || [];
    }
    
    return {
      manualData,
      rules
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {
      manualData: {
        name: '',
        territory: '',
        licensor: '',
        licensee: '',
        duration: '',
        ips: '',
        comment: '',
        rules: []
      },
      rules: []
    };
  }
};

const StepReviewGenerate = ({ 
  generatedJson, 
  generatedContract,
  uploadedSolidity,
  generateJson,
  isVerificationMode,
  contractComparisonValid,
  setContractComparisonValid,
  handleBack, 
  handleNext
}) => {
  const classes = useBuildSmartLicenseStyles();
  const [activeTab, setActiveTab] = useState('1');
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  // Removed approval and deployment logic - now handled in StepDeployment
  const [contractComparison, setContractComparison] = useState({
    isSimilar: false,
    similarity: 0,
    differences: [],
    generatedElements: [],
    uploadedElements: []
  });

  // Compare generated contract with uploaded contract
  const compareContracts = (generated, uploaded) => {
    if (!generated || !uploaded) {
      return {
        isSimilar: false,
        similarity: 0,
        differences: ['Missing generated or uploaded contract'],
        generatedElements: [],
        uploadedElements: []
      };
    }

    // Extract key elements from contracts
    const extractElements = (contract) => {
      const elements = [];
      
      // Extract contract name
      const contractMatch = contract.match(/contract\s+(\w+)/);
      if (contractMatch) elements.push({ type: 'contract', name: contractMatch[1] });
      
      // Extract structs
      const structMatches = contract.match(/struct\s+(\w+)\s*{/g);
      if (structMatches) {
        structMatches.forEach(match => {
          const name = match.match(/struct\s+(\w+)/)[1];
          elements.push({ type: 'struct', name });
        });
      }
      
      // Extract functions
      const functionMatches = contract.match(/function\s+(\w+)\s*\(/g);
      if (functionMatches) {
        functionMatches.forEach(match => {
          const name = match.match(/function\s+(\w+)/)[1];
          elements.push({ type: 'function', name });
        });
      }
      
      // Extract mappings
      const mappingMatches = contract.match(/mapping\s*\([^)]+\)\s+(\w+)/g);
      if (mappingMatches) {
        mappingMatches.forEach(match => {
          const name = match.match(/mapping\s*\([^)]+\)\s+(\w+)/)[1];
          elements.push({ type: 'mapping', name });
        });
      }
      
      // Extract events
      const eventMatches = contract.match(/event\s+(\w+)\s*\(/g);
      if (eventMatches) {
        eventMatches.forEach(match => {
          const name = match.match(/event\s+(\w+)/)[1];
          elements.push({ type: 'event', name });
        });
      }
      
      return elements;
    };

    const generatedElements = extractElements(generated);
    const uploadedElements = extractElements(uploaded);
    
    // Compare elements
    const differences = [];
    let matches = 0;
    const totalElements = Math.max(generatedElements.length, uploadedElements.length);
    
    // Check for missing elements in uploaded contract
    generatedElements.forEach(genEl => {
      const found = uploadedElements.find(uploadEl => 
        uploadEl.type === genEl.type && uploadEl.name === genEl.name
      );
      if (!found) {
        differences.push(`Missing ${genEl.type}: ${genEl.name}`);
      } else {
        matches++;
      }
    });
    
    // Check for extra elements in uploaded contract
    uploadedElements.forEach(uploadEl => {
      const found = generatedElements.find(genEl => 
        genEl.type === uploadEl.type && genEl.name === uploadEl.name
      );
      if (!found) {
        differences.push(`Extra ${uploadEl.type}: ${uploadEl.name}`);
      }
    });
    
    const similarity = totalElements > 0 ? (matches / totalElements) * 100 : 0;
    const isSimilar = similarity >= 80; // 80% similarity threshold
    
    return {
      isSimilar,
      similarity,
      differences,
      generatedElements,
      uploadedElements
    };
  };

  // Compare contracts when they change
  useEffect(() => {
    if (generatedContract && uploadedSolidity) {
      const comparison = compareContracts(generatedContract, uploadedSolidity);
      setContractComparison(comparison);
      // Update parent component with comparison validity
      setContractComparisonValid(comparison.isSimilar);
    }
  }, [generatedContract, uploadedSolidity, setContractComparisonValid]);

  // Approval and deployment logic moved to StepDeployment component

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
      showSuccess('JSON copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedJson;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccess('JSON copied to clipboard!');
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

    // Extract data based on format (new versioned or legacy)
    let displayData;
    if (jsonData.versions && Array.isArray(jsonData.versions)) {
      // New versioned format
      const currentVersion = jsonData.versions.find(v => v.versionNumber === jsonData.currentVersion) || jsonData.versions[jsonData.versions.length - 1];
      displayData = {
        name: jsonData.name,
        territory: jsonData.parties?.territory || jsonData.territory,
        licensor: jsonData.parties?.licensor || jsonData.licensor,
        licensee: jsonData.parties?.licensee || jsonData.licensee,
        duration: currentVersion?.data?.duration || '',
        ips: currentVersion?.data?.ips || '',
        rules: currentVersion?.data?.rules || [],
        licenseId: jsonData.licenseId,
        currentVersion: jsonData.currentVersion,
        status: jsonData.status,
        createdAt: jsonData.createdAt,
        lastModified: jsonData.lastModified
      };
    } else {
      // Legacy format
      displayData = {
        name: jsonData.name,
        territory: jsonData.territory,
        licensor: jsonData.licensor,
        licensee: jsonData.licensee,
        duration: jsonData.duration,
        ips: jsonData.ips,
        rules: jsonData.rules || []
      };
    }

    return (
      <div>
        {/* Version Information (only for new format) */}
        {jsonData.versions && (
          <Row>
            <Col md="12">
              <Alert color="info">
                <strong>License Information:</strong><br />
                License ID: {displayData.licenseId}<br />
                Current Version: {displayData.currentVersion}<br />
                Status: <Badge color="primary">{displayData.status}</Badge><br />
                Created: {new Date(displayData.createdAt).toLocaleDateString()}<br />
                Last Modified: {new Date(displayData.lastModified).toLocaleDateString()}
              </Alert>
            </Col>
          </Row>
        )}
        
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>License Name</strong></Label>
              <Input type="text" value={displayData.name || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Territory</strong></Label>
              <Input type="text" value={displayData.territory || ''} readOnly />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>Licensor</strong></Label>
              <Input type="text" value={displayData.licensor || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Licensee</strong></Label>
              <Input type="text" value={displayData.licensee || ''} readOnly />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="6">
            <FormGroup>
              <Label><strong>Duration</strong></Label>
              <Input type="text" value={displayData.duration || ''} readOnly />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label><strong>Intellectual Property</strong></Label>
              <Input type="textarea" value={displayData.ips || ''} readOnly rows="3" />
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="12">
            <h5 style={{ marginTop: '20px', marginBottom: '15px' }}>Rules Configuration</h5>
            {displayData.rules && displayData.rules.length > 0 ? (
              displayData.rules.map((rule, index) => (
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
                        
                        {/* Step Structure Display */}
                        {rule.royaltyRate.stepStructure && rule.royaltyRate.stepStructure.steps && rule.royaltyRate.stepStructure.steps.length > 0 && (
                          <div style={{ marginTop: '15px' }}>
                            <strong>Step Structure ({rule.royaltyRate.stepStructure.xAxis}):</strong>
                            <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                              {rule.royaltyRate.stepStructure.steps.map((step, stepIndex) => (
                                <div key={step.id || stepIndex} style={{ 
                                  marginBottom: '8px',
                                  padding: '8px',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '4px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                      <strong>≤ {step.threshold || step.x}</strong> → <strong>${step.rate || step.y}</strong>
                                    </span>
                                    <span style={{ fontSize: '0.9em', color: '#6c757d' }}>
                                      {step.description}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {rule.royaltyRate.stepStructure.infiniteValue && (
                                <div style={{ 
                                  marginBottom: '8px',
                                  padding: '8px',
                                  backgroundColor: '#e8f5e8',
                                  borderRadius: '4px',
                                  border: '1px solid #c3e6c3'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                      <strong>∞</strong> → <strong>${rule.royaltyRate.stepStructure.infiniteValue}</strong>
                                    </span>
                                    <span style={{ fontSize: '0.9em', color: '#6c757d' }}>
                                      Infinite value
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Min/Max Display */}
                        {(rule.royaltyRate.min || rule.royaltyRate.max) && (
                          <div style={{ marginTop: '10px' }}>
                            <strong>Limits:</strong>
                            <span style={{ marginLeft: '10px' }}>
                              {rule.royaltyRate.min && `Min: $${rule.royaltyRate.min}`}
                              {rule.royaltyRate.min && rule.royaltyRate.max && ' | '}
                              {rule.royaltyRate.max && `Max: $${rule.royaltyRate.max}`}
                            </span>
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
          Review configuration and generated smart contract
        </p>
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
                manualData={convertJsonToFormData(generatedJson).manualData}
                setManualData={() => {}} // No-op function for read-only
                rules={convertJsonToFormData(generatedJson).rules}
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
                      showSuccess('Contract copied to clipboard!');
                    } catch (err) {
                      showError('Failed to copy to clipboard');
                    }
                  }}
                  block
                  disabled={!generatedContract}
                >
                  Copy Contract
                </Button>
              </Col>
            </Row>
            
            {/* Contract Comparison (only shown when both contracts exist) */}
            {generatedContract && uploadedSolidity && (
              <Row style={{ marginTop: '30px' }}>
                <Col md="12">
                  <Card style={{ 
                    backgroundColor: contractComparison.isSimilar ? '#d4edda' : '#f8d7da',
                    borderColor: contractComparison.isSimilar ? '#c3e6cb' : '#f5c6cb'
                  }}>
                    <CardHeader>
                      <CardTitle tag="h5">
                        {contractComparison.isSimilar ? '✅' : '⚠️'} Contract Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col md="6">
                          <h6>Similarity: {contractComparison.similarity.toFixed(1)}%</h6>
                          <p className={contractComparison.isSimilar ? 'text-success' : 'text-warning'}>
                            {contractComparison.isSimilar 
                              ? '✅ Contracts are similar! Ready to proceed.'
                              : '⚠️ Contracts have differences. Please review.'
                            }
                          </p>
                        </Col>
                        <Col md="6">
                          <h6>Elements Found:</h6>
                          <div style={{ fontSize: '0.9em' }}>
                            <strong>Generated:</strong> {contractComparison.generatedElements.length} elements<br/>
                            <strong>Uploaded:</strong> {contractComparison.uploadedElements.length} elements
                          </div>
                        </Col>
                      </Row>
                      
                      {contractComparison.differences.length > 0 && (
                        <Row style={{ marginTop: '15px' }}>
                          <Col md="12">
                            <h6>Differences Found:</h6>
                            <ul style={{ fontSize: '0.9em', maxHeight: '150px', overflowY: 'auto' }}>
                              {contractComparison.differences.map((diff, index) => (
                                <li key={index} style={{ marginBottom: '5px' }}>
                                  <span style={{ color: contractComparison.isSimilar ? '#28a745' : '#dc3545' }}>
                                    {contractComparison.isSimilar ? '✅' : '❌'}
                                  </span> {diff}
                                </li>
                              ))}
                            </ul>
                          </Col>
                        </Row>
                      )}
                      
                      {/* Detailed Elements Comparison */}
                      <Row style={{ marginTop: '15px' }}>
                        <Col md="6">
                          <h6>Generated Contract Elements:</h6>
                          <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '10px', 
                            borderRadius: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            fontSize: '0.8em'
                          }}>
                            {contractComparison.generatedElements.map((el, index) => (
                              <div key={index} style={{ marginBottom: '3px' }}>
                                <span style={{ 
                                  color: '#007bff',
                                  fontWeight: 'bold'
                                }}>{el.type}:</span> {el.name}
                              </div>
                            ))}
                          </div>
                        </Col>
                        <Col md="6">
                          <h6>Uploaded Contract Elements:</h6>
                          <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '10px', 
                            borderRadius: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            fontSize: '0.8em'
                          }}>
                            {contractComparison.uploadedElements.map((el, index) => (
                              <div key={index} style={{ marginBottom: '3px' }}>
                                <span style={{ 
                                  color: '#28a745',
                                  fontWeight: 'bold'
                                }}>{el.type}:</span> {el.name}
                              </div>
                            ))}
                          </div>
                        </Col>
                      </Row>
                      
                      {/* Simulation Button for Testing */}
                      <Row style={{ marginTop: '15px' }}>
                        <Col md="12" className="text-center">
                          <Button
                            color="info"
                            onClick={() => {
                              setContractComparison(prev => ({
                                ...prev,
                                isSimilar: true,
                                similarity: 100,
                                differences: []
                              }));
                              setContractComparisonValid(true);
                              showSuccess('Contract comparison simulated as valid for testing purposes!');
                            }}
                            size="sm"
                            style={{ marginRight: '10px' }}
                          >
                            Simulate Valid Comparison (Testing)
                          </Button>
                          <Button
                            color="secondary"
                            onClick={() => {
                              setContractComparison(prev => ({
                                ...prev,
                                isSimilar: false,
                                similarity: Math.random() * 50 + 20, // Random between 20-70%
                                differences: [
                                  'Missing function: deployLicense',
                                  'Extra function: customFunction',
                                  'Missing struct: LicenseData'
                                ]
                              }));
                              setContractComparisonValid(false);
                              showInfo('Contract comparison reset with random differences for testing!');
                            }}
                            size="sm"
                          >
                            Reset Comparison (Testing)
                          </Button>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>
        </TabContent>


        {/* Contract comparison info for verification mode */}
        {uploadedSolidity && (
          <Row style={{ marginTop: '20px' }}>
            <Col md="12">
              <Card style={{ 
                backgroundColor: contractComparison.isSimilar ? '#d4edda' : '#fff3cd',
                borderColor: contractComparison.isSimilar ? '#c3e6cb' : '#ffeaa7'
              }}>
                <CardHeader>
                  <CardTitle tag="h5">
                    {contractComparison.isSimilar ? '✅' : '⚠️'} Contract Comparison Status
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Alert color={contractComparison.isSimilar ? 'success' : 'warning'}>
                    <strong>
                      {contractComparison.isSimilar 
                        ? 'Contracts are similar! Ready to proceed to deployment.'
                        : 'Contracts have differences. Please review the comparison above.'
                      }
                    </strong>
                  </Alert>
                  <div className="text-center">
                    <Button
                      color="info"
                      onClick={() => setActiveTab('4')}
                      size="lg"
                    >
                      Review Contract Comparison
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
            <Button
              color="primary"
              onClick={handleNext}
              disabled={isVerificationMode ? !contractComparisonValid : !generatedJson}
            >
              Next
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

StepReviewGenerate.propTypes = {
  generatedJson: PropTypes.string.isRequired,
  generatedContract: PropTypes.string.isRequired,
  uploadedSolidity: PropTypes.string, // Optional uploaded solidity contract
  generateJson: PropTypes.func.isRequired,
  isVerificationMode: PropTypes.bool.isRequired,
  contractComparisonValid: PropTypes.bool.isRequired,
  setContractComparisonValid: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default StepReviewGenerate;