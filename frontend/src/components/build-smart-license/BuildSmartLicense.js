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
  StepDeployment,
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
  const [deploymentStatus, setDeploymentStatus] = useState('pending'); // pending, sent, approved, deployed
  const [contractComparisonValid, setContractComparisonValid] = useState(false);

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
    'Review & Generate',
    'Deploy'
  ];

  const verificationSteps = [
    'Mode Selection',
    'File Upload',
    'Review & Verify',
    'Deploy'
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

  const handleStepClick = (stepIndex) => {
    // Allow navigation to any step that has been completed or is the next step
    const currentSteps = isVerificationMode ? verificationSteps : steps;
    const maxAllowedStep = currentSteps.length - 1;
    
    // Allow going back to any previous step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
    // Allow going forward only if current step is valid
    else if (stepIndex === currentStep + 1) {
      // Check if current step is valid before allowing forward navigation
      if (currentStep === 0) {
        // Step 0 (Mode Selection) - can always proceed if mode is selected
        if (mode) {
          setCurrentStep(stepIndex);
        }
      } else if (currentStep === 1) {
        // Step 1 (Configuration or File Upload) - check validation
        if (isVerificationMode) {
          // For verification mode, check if files are uploaded
          if (uploadedJson && uploadedSolidity) {
            setCurrentStep(stepIndex);
          }
        } else {
          // For creation mode, check if configuration is valid
          const validation = getValidation();
          if (validation.isValid) {
            setCurrentStep(stepIndex);
          }
        }
      }
    }
  };

  // Validation helper function
  const getValidation = () => {
    if (mode === 'ai') {
      const isValid = aiText && aiText.trim().length >= 10;
      return { isValid };
    }
    
    // Manual mode validation
    const hasName = !!(manualData.name && manualData.name.trim());
    const hasLicensor = !!(manualData.licensor && manualData.licensor.trim());
    const hasLicensee = !!(manualData.licensee && manualData.licensee.trim());
    const hasDuration = !!(manualData.duration && manualData.duration.trim());
    const hasTerritory = !!(manualData.territory && manualData.territory.trim());
    const hasIPs = !!(manualData.ips && manualData.ips.trim());
    
    const isValid = hasName && hasLicensor && hasLicensee && hasDuration && hasTerritory && hasIPs;
    
    return { isValid };
  };

  // Check if we can navigate to a specific step
  const canNavigateToStep = (stepIndex) => {
    if (stepIndex <= currentStep) {
      return true; // Can always go back
    }
    
    if (stepIndex === currentStep + 1) {
      // Check if current step is valid
      if (currentStep === 0) {
        return !!mode; // Mode must be selected
      } else if (currentStep === 1) {
        if (isVerificationMode) {
          return !!(uploadedJson && uploadedSolidity);
        } else {
          const validation = getValidation();
          return validation.isValid;
        }
      } else if (currentStep === 2) {
        if (isVerificationMode) {
          return contractComparisonValid; // Contract comparison must be valid in verification mode
        } else {
          return !!generatedJson; // Must have generated JSON in creation mode
        }
      }
    }
    
    return false;
  };

  // Check if a step is completed
  const isStepCompleted = (stepIndex) => {
    if (stepIndex < currentStep) {
      return true; // Previous steps are always completed
    }
    
    if (stepIndex === currentStep) {
      // Current step is completed if:
      if (stepIndex === 0) {
        return !!mode; // Mode selected
      } else if (stepIndex === 1) {
        if (isVerificationMode) {
          return !!(uploadedJson && uploadedSolidity);
        } else {
          const validation = getValidation();
          return validation.isValid;
        }
      } else if (stepIndex === 2) {
        if (isVerificationMode) {
          return contractComparisonValid; // Contract comparison must be valid in verification mode
        } else {
          return !!generatedJson; // JSON generated in creation mode
        }
      } else if (stepIndex === 3) {
        return deploymentStatus !== 'pending'; // Deployment step started (sent, approved, or deployed)
      }
    }
    
    return false;
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
            isVerificationMode={isVerificationMode}
            contractComparisonValid={contractComparisonValid}
            setContractComparisonValid={setContractComparisonValid}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        );
      case 3:
        return (
          <StepDeployment
            generatedJson={generatedJson}
            generatedContract={generatedSmartContract}
            uploadedSolidity={uploadedSolidity}
            deploymentStatus={deploymentStatus}
            setDeploymentStatus={setDeploymentStatus}
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
                      {(isVerificationMode ? verificationSteps : steps).map((step, index) => {
                        const isClickable = index <= currentStep || (index === currentStep + 1 && canNavigateToStep(index));
                        const isCompleted = isStepCompleted(index);
                        const isCurrent = index === currentStep;
                        const isNext = index === currentStep + 1;
                        
                        return (
                          <div
                            key={index}
                            onClick={() => isClickable && handleStepClick(index)}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '10px',
                              backgroundColor: isCompleted ? '#28a745' : (isCurrent ? '#007bff' : '#e9ecef'),
                              color: isCompleted ? 'white' : (isCurrent ? 'white' : '#6c757d'),
                              borderRadius: '4px',
                              marginRight: index < (isVerificationMode ? verificationSteps : steps).length - 1 ? '10px' : '0',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              cursor: isClickable ? 'pointer' : 'default',
                              opacity: isClickable ? 1 : 0.6,
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              if (isClickable) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isClickable) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                          >
                            {isCompleted && '✓ '}{step}
                            {isNext && !isClickable && ' (Complete current step)'}
                          </div>
                        );
                      })}
                    </div>
                    <Progress
                      value={(currentStep + 1) / (isVerificationMode ? verificationSteps : steps).length * 100}
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