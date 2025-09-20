import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  Progress,
  Alert
} from 'reactstrap';
import {
  StepModeSelection,
  StepConfiguration,
  StepFileUpload,
  StepReviewGenerate,
  generateSmartLicenseJson
} from './index';

const BuildSmartLicense = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState('');
  const [manualData, setManualData] = useState({});
  const [rules, setRules] = useState([]);
  const [aiText, setAiText] = useState('');
  const [generatedJson, setGeneratedJson] = useState('');
  const [generatedSmartContract, setGeneratedSmartContract] = useState('');
  const [uploadedJson, setUploadedJson] = useState('');
  const [uploadedSolidity, setUploadedSolidity] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(false);

  // Update generatedJson when uploadedJson changes (for upload mode)
  useEffect(() => {
    if (mode === 'upload' && uploadedJson) {
      setGeneratedJson(uploadedJson);
    }
  }, [uploadedJson, mode]);

  // Update generatedSmartContract when uploadedSolidity changes (for upload mode)
  useEffect(() => {
    if (mode === 'upload' && uploadedSolidity) {
      setGeneratedSmartContract(uploadedSolidity);
    }
  }, [uploadedSolidity, mode]);

  const steps = [
    'Mode Selection',
    'Configuration',
    'Review & Generate'
  ];

  const verificationSteps = [
    'Mode Selection',
    'File Upload',
    'Review & Verify'
  ];

  // Generate smart contract from JSON
  const generateSmartContract = (jsonData) => {
    try {
      const config = JSON.parse(jsonData);
      
      // Mock smart contract generation
      const contract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SmartLicense is Ownable, ReentrancyGuard {
    struct LicenseData {
        string name;
        address licensor;
        address licensee;
        string territory;
        uint256 duration;
        string intellectualProperty;
        bool isActive;
        uint256 createdAt;
    }
    
    LicenseData public licenseData;
    mapping(address => bool) public approvedBy;
    bool public isApproved;
    bool public isDeployed;
    
    event LicenseCreated(string name, address licensor, address licensee);
    event LicenseApproved(address approver);
    event LicenseDeployed();
    
    constructor(
        string memory _name,
        address _licensor,
        address _licensee,
        string memory _territory,
        uint256 _duration,
        string memory _intellectualProperty
    ) {
        licenseData = LicenseData({
            name: _name,
            licensor: _licensor,
            licensee: _licensee,
            territory: _territory,
            duration: _duration,
            intellectualProperty: _intellectualProperty,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit LicenseCreated(_name, _licensor, _licensee);
    }
    
    function approveLicense() external {
        require(msg.sender == licenseData.licensor || msg.sender == licenseData.licensee, "Not authorized");
        require(!approvedBy[msg.sender], "Already approved");
        
        approvedBy[msg.sender] = true;
        emit LicenseApproved(msg.sender);
        
        if (approvedBy[licenseData.licensor] && approvedBy[licenseData.licensee]) {
            isApproved = true;
        }
    }
    
    function deployLicense() external onlyOwner {
        require(isApproved, "License not approved by both parties");
        require(!isDeployed, "Already deployed");
        
        isDeployed = true;
        emit LicenseDeployed();
    }
    
    function getLicenseInfo() external view returns (LicenseData memory) {
        return licenseData;
    }
}`;
      
      return contract;
    } catch (error) {
      console.error('Error generating smart contract:', error);
      return '// Error generating contract: ' + error.message;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Show validation errors when trying to proceed from Configuration step
      setShowValidationErrors(true);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Generate smart contract when moving to Step 3
      if (currentStep === 1 && generatedJson) {
        const contract = generateSmartContract(generatedJson);
        setGeneratedSmartContract(contract);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'upload') {
      setIsVerificationMode(true);
    } else {
      setIsVerificationMode(false);
    }
    handleNext();
  };

  const generateJson = () => {
    const json = generateSmartLicenseJson(mode, manualData, aiText);
    setGeneratedJson(json);
    
    // Generate mock smart contract
    const smartContract = generateMockSmartContract(json);
    setGeneratedSmartContract(smartContract);
  };

  // Auto-generate JSON when reaching the final step
  useEffect(() => {
    if (currentStep === 2 && !generatedJson) {
      generateJson();
    }
  }, [currentStep, mode, manualData, aiText]);

  const generateMockSmartContract = (jsonData) => {
    const data = JSON.parse(jsonData);
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SmartLicense is Ownable, ReentrancyGuard {
    struct LicenseInfo {
        string title;
        address licensor;
        address licensee;
        string intellectualProperty;
        uint256 duration;
        string territory;
        uint256 royaltyRate;
        bool isActive;
        uint256 createdAt;
    }
    
    LicenseInfo public licenseInfo;
    
    event LicenseCreated(
        string indexed title,
        address indexed licensor,
        address indexed licensee,
        uint256 royaltyRate
    );
    
    event RoyaltyPaid(
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(
        string memory _title,
        address _licensor,
        string memory _intellectualProperty,
        uint256 _duration,
        string memory _territory,
        uint256 _royaltyRate
    ) {
        licenseInfo = LicenseInfo({
            title: _title,
            licensor: _licensor,
            licensee: address(0),
            intellectualProperty: _intellectualProperty,
            duration: _duration,
            territory: _territory,
            royaltyRate: _royaltyRate,
            isActive: false,
            createdAt: block.timestamp
        });
        
        emit LicenseCreated(_title, _licensor, address(0), _royaltyRate);
    }
    
    function activateLicense(address _licensee) external onlyOwner {
        require(_licensee != address(0), "Invalid licensee address");
        licenseInfo.licensee = _licensee;
        licenseInfo.isActive = true;
    }
    
    function payRoyalty() external payable nonReentrant {
        require(licenseInfo.isActive, "License not active");
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        // Transfer royalty to licensor
        payable(licenseInfo.licensor).transfer(msg.value);
        
        emit RoyaltyPaid(msg.sender, msg.value, block.timestamp);
    }
    
    function getLicenseInfo() external view returns (LicenseInfo memory) {
        return licenseInfo;
    }
    
    function isLicenseValid() external view returns (bool) {
        return licenseInfo.isActive && 
               block.timestamp < licenseInfo.createdAt + licenseInfo.duration;
    }
    
    // Emergency functions
    function pauseLicense() external onlyOwner {
        licenseInfo.isActive = false;
    }
    
    function resumeLicense() external onlyOwner {
        licenseInfo.isActive = true;
    }
    
    function updateRoyaltyRate(uint256 _newRate) external onlyOwner {
        licenseInfo.royaltyRate = _newRate;
    }
}`;
  };


  const handleDownloadAll = () => {
    // Download JSON
    const jsonBlob = new Blob([generatedJson], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `smart-license-${Date.now()}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);

    // Download Smart Contract
    const contractBlob = new Blob([generatedSmartContract], { type: 'text/plain' });
    const contractUrl = URL.createObjectURL(contractBlob);
    const contractLink = document.createElement('a');
    contractLink.href = contractUrl;
    contractLink.download = `smart-license-contract-${Date.now()}.sol`;
    document.body.appendChild(contractLink);
    contractLink.click();
    document.body.removeChild(contractLink);
    URL.revokeObjectURL(contractUrl);
  };

  const handleDeployContract = () => {
    // Here you would typically deploy the smart contract to the blockchain
    console.log('Deploying smart contract...');
    alert('Smart Contract deployment initiated! Check the console for details.');
  };

  const renderCurrentStep = () => {
    const currentSteps = isVerificationMode ? verificationSteps : steps;
    
    switch (currentStep) {
      case 0:
        return (
          <StepModeSelection
            mode={mode}
            setMode={setMode}
            handleNext={() => handleModeSelection(mode)}
          />
        );
      case 1:
        if (isVerificationMode) {
          return (
            <StepFileUpload
              uploadedJson={uploadedJson}
              setUploadedJson={setUploadedJson}
              uploadedSolidity={uploadedSolidity}
              setUploadedSolidity={setUploadedSolidity}
              handleNext={handleNext}
              handleBack={handleBack}
            />
          );
        } else {
          return (
            <StepConfiguration
              mode={mode}
              manualData={manualData}
              setManualData={setManualData}
              rules={rules}
              setRules={setRules}
              aiText={aiText}
              setAiText={setAiText}
              handleNext={handleNext}
              handleBack={handleBack}
              showValidationErrors={showValidationErrors}
              setShowValidationErrors={setShowValidationErrors}
            />
          );
        }
      case 2:
        return (
          <StepReviewGenerate
            generatedJson={generatedJson}
            generatedContract={generatedSmartContract}
            uploadedSolidity={uploadedSolidity}
            generateJson={generateJson}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                {isVerificationMode ? 'Verify Smart License Proposal' : 'Create Smart License'}
              </CardTitle>
              <p className="card-category">
                {isVerificationMode 
                  ? 'Review and verify existing smart license proposals for deployment'
                  : 'Build and deploy smart licenses for intellectual property management'
                }
              </p>
            </CardHeader>
            <CardBody>
              {/* Progress Indicator */}
              <Row>
                <Col md="12">
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      {(isVerificationMode ? verificationSteps : steps).map((step, index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '10px',
                            backgroundColor: index <= currentStep ? '#007bff' : '#e9ecef',
                            color: index <= currentStep ? 'white' : '#6c757d',
                            borderRadius: '4px',
                            marginRight: index < steps.length - 1 ? '10px' : '0',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <Progress
                      value={(currentStep + 1) / steps.length * 100}
                      color="primary"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Current Step Content */}
              <Row>
                <Col md="12">
                  {renderCurrentStep()}
                </Col>
              </Row>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BuildSmartLicense;