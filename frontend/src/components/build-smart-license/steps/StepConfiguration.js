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
  Input,
  Label,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import { validateManualData, validateAiText } from "../utils/jsonGenerator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Typography from "@material-ui/core/Typography";

// Utility function to parse duration string (e.g., "5Y 10M 2D")
const parseDuration = (durationStr) => {
  if (!durationStr) return [];
  
  const parts = [];
  const regex = /(\d+)([YMD])/g;
  let match;
  
  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    parts.push({ value, unit });
  }
  
  return parts;
};

// Step Structure Component for Royalty Rate
const StepStructureComponent = ({ rule, royaltyRate, updateRuleNested, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [newStep, setNewStep] = useState({ x: '', y: '' });

  const addStep = () => {
    if (newStep.x && newStep.y) {
      const step = {
        id: Date.now(),
        x: parseFloat(newStep.x),
        y: parseFloat(newStep.y)
      };
      const updatedSteps = [...royaltyRate.stepStructure.steps, step].sort((a, b) => a.x - b.x);
      updateRuleNested(rule.id, 'royaltyRate.stepStructure.steps', updatedSteps);
      setNewStep({ x: '', y: '' });
    }
  };

  const removeStep = (stepId) => {
    const updatedSteps = royaltyRate.stepStructure.steps.filter(step => step.id !== stepId);
    updateRuleNested(rule.id, 'royaltyRate.stepStructure.steps', updatedSteps);
  };

  const chartData = [
    ...royaltyRate.stepStructure.steps.map(step => ({
      name: `${step.x}`,
      value: step.y,
      x: step.x
    })),
    // Add intermediate step to infinity if there are steps and infinite value
    ...(royaltyRate.stepStructure.steps.length > 0 && royaltyRate.stepStructure.infiniteValue ? [{
      name: `${Math.max(...royaltyRate.stepStructure.steps.map(s => s.x)) * 2}`,
      value: parseFloat(royaltyRate.stepStructure.infiniteValue),
      x: Math.max(...royaltyRate.stepStructure.steps.map(s => s.x)) * 2
    }] : []),
    // Add infinite value if it exists
    ...(royaltyRate.stepStructure.infiniteValue ? [{
      name: '∞',
      value: parseFloat(royaltyRate.stepStructure.infiniteValue),
      x: Infinity
    }] : [])
  ];

  return (
    <div>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={activeTab === '1' ? 'active' : ''}
            onClick={() => setActiveTab('1')}
          >
            Single Value
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === '2' ? 'active' : ''}
            onClick={() => setActiveTab('2')}
          >
            Step Structure
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Value ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={royaltyRate.lumpsumValue || royaltyRate.proportionalValue || ''}
                  onChange={(e) => {
                    if (royaltyRate.type === 'lumpsum') {
                      updateRuleNested(rule.id, 'royaltyRate.lumpsumValue', e.target.value);
                    } else if (royaltyRate.type === 'proportional') {
                      updateRuleNested(rule.id, 'royaltyRate.proportionalValue', e.target.value);
                    }
                  }}
                  readOnly={isReadOnly}
                  placeholder="Enter value"
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h5>{royaltyRate.lumpsumValue || royaltyRate.proportionalValue || '0'} $</h5>
                <small>Single value</small>
              </div>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>X-Axis (Royalty Base or Time)</Label>
                <Input
                  type="select"
                  value={royaltyRate.stepStructure.xAxis}
                  onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.stepStructure.xAxis', e.target.value)}
                  readOnly={isReadOnly}
                >
                  <option value="">Select X-Axis</option>
                  {rule.royaltyBase && rule.royaltyBase.length > 0 ? (
                    (rule.royaltyBase || []).map((rb, idx) => (
                      <option key={idx} value={rb.displayName}>{rb.displayName}</option>
                    ))
                  ) : (
                    <option value="" disabled>No Royalty Bases available</option>
                  )}
                  <option value="time">Time</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Add New Step</Label>
                <Row>
                  <Col md="6">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="X value"
                      value={newStep.x}
                      onChange={(e) => setNewStep({...newStep, x: e.target.value})}
                    />
                  </Col>
                  <Col md="6">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Y value ($)"
                      value={newStep.y}
                      onChange={(e) => setNewStep({...newStep, y: e.target.value})}
                    />
                  </Col>
                </Row>
                <Button 
                  color="primary" 
                  size="sm" 
                  onClick={addStep}
                  disabled={!newStep.x || !newStep.y}
                  style={{ marginTop: '10px' }}
                >
                  Add Step
                </Button>
              </FormGroup>

              <FormGroup>
                <Label>Infinite Value (Y for X → ∞)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={royaltyRate.stepStructure.infiniteValue}
                  onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.stepStructure.infiniteValue', e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="Value for infinite X"
                />
              </FormGroup>

              {(royaltyRate.stepStructure.steps.length > 0 || royaltyRate.stepStructure.infiniteValue) && (
                <div>
                  <Label>Current Steps</Label>
                  {royaltyRate.stepStructure.steps.map((step, idx) => (
                    <div key={step.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      margin: '4px 0',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <span>
                        {step.x} → {step.y} $
                      </span>
                      <Button 
                        color="danger" 
                        size="sm"
                        onClick={() => removeStep(step.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {royaltyRate.stepStructure.infiniteValue && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      margin: '4px 0',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '4px',
                      border: '1px solid #c3e6c3'
                    }}>
                      <span>
                        ∞ → {royaltyRate.stepStructure.infiniteValue} $
                      </span>
                      <Button 
                        color="danger" 
                        size="sm"
                        onClick={() => updateRuleNested(rule.id, 'royaltyRate.stepStructure.infiniteValue', '')}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Col>
            <Col md="6">
              {(chartData.length > 0 || royaltyRate.stepStructure.infiniteValue) ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          // Check if this is the infinite value by looking at the name parameter
                          if (name === '∞') {
                            return [`${value} $ (∞)`, 'Infinite Value'];
                          }
                          // Check if this is the intermediate step to infinity
                          if (royaltyRate.stepStructure.steps.length > 0 && royaltyRate.stepStructure.infiniteValue) {
                            const maxStep = Math.max(...royaltyRate.stepStructure.steps.map(s => s.x));
                            if (parseFloat(name) === maxStep * 2) {
                              return [`${value} $ (→∞)`, 'To Infinity'];
                            }
                          }
                          return [`${value} $`, 'Step Value'];
                        }}
                      />
                      <Legend />
                      <Line 
                        type="stepAfter" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <p>Add steps or infinite value to see the graph</p>
                </div>
              )}
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </div>
  );
};

// Smart Policy Dependencies Read-Only Component
const SmartPolicyDependenciesReadOnly = ({ rules }) => {
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extract smart policy dependencies from rules
  const extractDependencies = async (rules) => {
    const smartPolicyDeps = [];
    
    rules.forEach(rule => {
      rule.royaltyBase?.forEach(rb => {
        if (rb.oracleAddress && rb.oracleAddress.startsWith('0x') && rb.oracleAddress.length === 42) {
          // Check if this is a smart license address (not oracle)
          if (isSmartLicenseAddress(rb.oracleAddress)) {
            smartPolicyDeps.push({
              id: `${rule.id}-${rb.id}`,
              ruleId: rule.id,
              ruleName: rule.name,
              displayName: rb.displayName,
              smartLicenseAddress: rb.oracleAddress,
              propertyName: rb.propertyName,
              dependencyType: 'required',
              description: `Dependency from ${rule.name} - ${rb.displayName}`
            });
          }
        }
      });
    });

    // Remove duplicates based on smart license address
    const uniqueDeps = smartPolicyDeps.filter((dep, index, self) => 
      index === self.findIndex(d => d.smartLicenseAddress === dep.smartLicenseAddress)
    );

    return uniqueDeps;
  };

  // Mock function to check if address is a smart license (in real implementation, this would check the blockchain)
  const isSmartLicenseAddress = (address) => {
    // Mock logic: addresses starting with 0x1 are smart licenses, 0x2 are oracles
    return address.startsWith('0x1');
  };

  // Mock function to fetch smart license data from blockchain
  const fetchSmartLicenseData = async (address) => {
    // Simulate blockchain call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - in real implementation, this would call the blockchain
    const mockData = {
      '0x1234567890123456789012345678901234567890': {
        name: 'IoT Manufacturing Policy',
        version: '1.2.0',
        licensor: 'TechCorp Solutions',
        territory: 'Worldwide',
        status: 'Active',
        createdAt: '2024-01-15',
        royaltyRate: '8.5%'
      },
      '0x2345678901234567890123456789012345678901': {
        name: 'Security Compliance Policy',
        version: '2.1.0',
        licensor: 'SecureTech Inc.',
        territory: 'EU',
        status: 'Active',
        createdAt: '2024-02-20',
        royaltyRate: '12.0%'
      },
      '0x3456789012345678901234567890123456789012': {
        name: 'Device Activation Policy',
        version: '1.5.0',
        licensor: 'ActivationTech Ltd.',
        territory: 'North America',
        status: 'Active',
        createdAt: '2024-03-10',
        royaltyRate: '6.8%'
      }
    };

    return mockData[address] || {
      name: 'Unknown Smart License',
      version: 'N/A',
      licensor: 'Unknown',
      territory: 'N/A',
      status: 'Unknown',
      createdAt: 'N/A',
      royaltyRate: 'N/A'
    };
  };

  // Update dependencies when rules change
  useEffect(() => {
    const updateDependencies = async () => {
      setLoading(true);
      try {
        const extractedDeps = await extractDependencies(rules);
        
        // Fetch additional data for each dependency
        const enrichedDeps = await Promise.all(
          extractedDeps.map(async (dep) => {
            const smartLicenseData = await fetchSmartLicenseData(dep.smartLicenseAddress);
            return {
              ...dep,
              ...smartLicenseData
            };
          })
        );
        
        setDependencies(enrichedDeps);
      } catch (error) {
        console.error('Error updating dependencies:', error);
      } finally {
        setLoading(false);
      }
    };

    updateDependencies();
  }, [rules]);

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader>
        <CardTitle tag="h6">
          Smart Policy Dependencies
        </CardTitle>
        <p className="card-category">
          Smart Policy dependencies based on configured rules
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading dependencies...</span>
            </div>
            <p style={{ marginTop: '10px', color: '#6c757d' }}>Loading smart license data from blockchain...</p>
          </div>
        ) : dependencies.length > 0 ? (
          <div>
            <Label>Detected Dependencies ({dependencies.length})</Label>
            {dependencies.map((dep, index) => (
              <div key={dep.id} style={{ 
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                border: '1px solid #c3e6c3'
              }}>
                <Row>
                  <Col md="12">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h6 style={{ margin: 0, color: '#2e7d32' }}>
                        {dep.displayName} ({dep.name})
                      </h6>
                      <Badge color="success">Auto-detected</Badge>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="6">
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Smart License Address:</strong>
                      <br />
                      <code style={{ fontSize: '12px', color: '#666' }}>{dep.smartLicenseAddress}</code>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Property Name:</strong> {dep.propertyName}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Rule:</strong> {dep.ruleName}
                    </div>
                  </Col>
                  <Col md="6">
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Licensor:</strong> {dep.licensor}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Territory:</strong> {dep.territory}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Status:</strong> 
                      <Badge color={dep.status === 'Active' ? 'success' : 'warning'} style={{ marginLeft: '5px' }}>
                        {dep.status}
                      </Badge>
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="12">
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '8px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      <strong>Additional Info:</strong> Version {dep.version} | Created: {dep.createdAt} | Royalty Rate: {dep.royaltyRate}
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ color: '#6c757d', margin: 0 }}>
              No smart policy dependencies detected. Add smart license addresses in Rules Configuration to see dependencies.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Required field indicator component
const RequiredField = ({ children, isRequired = true }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {children}
    {isRequired && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
  </div>
);

// Validation status component
const ValidationStatus = ({ isValid, warnings, requiredFields, mode, showValidationErrors }) => {
  // Don't show validation status unless explicitly requested
  if (!showValidationErrors) {
    return null;
  }

  if (mode === 'ai') {
    return (
      <Alert color={isValid ? "success" : "warning"} style={{ marginBottom: '20px' }}>
        <strong>AI Input Status:</strong> {isValid ? "Valid text provided" : "Please provide sufficient text (minimum 10 characters)"}
      </Alert>
    );
  }

  const missingFields = [];
  if (requiredFields) {
    Object.entries(requiredFields).forEach(([field, hasValue]) => {
      if (!hasValue) {
        missingFields.push(field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
      }
    });
  }

  return (
    <Alert color={isValid ? "success" : "warning"} style={{ marginBottom: '20px' }}>
      <strong>Validation Status:</strong> {isValid ? "All required fields completed" : "Please complete required fields"}
      {!isValid && missingFields.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Missing required fields:</strong>
          <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
            {missingFields.map((field, idx) => (
              <li key={idx}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      {warnings && warnings.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Warnings:</strong>
          <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
            {warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </Alert>
  );
};

// Rules Configuration Component
const RulesConfiguration = ({ rules, setRules, isReadOnly = false }) => {
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      name: `Rule ${rules.length + 1}`,
      validityStart: '',
      validityEnd: '',
      evaluationInterval: {
        duration: ''
      },
      royaltyBase: [
        { id: Date.now(), oracleAddress: '', propertyName: '', displayName: 'RB01', intellectualProperty: '' }
      ],
      royaltyRate: {
        type: 'lumpsum', // lumpsum, proportional, custom
        lumpsumValue: '',
        proportionalValue: '',
        proportionalRB: '',
        customFunc: 'sum',
        customInputs: [],
        stepStructure: {
          xAxis: '', // Royalty Base or 'time'
          steps: [],
          infiniteValue: ''
        },
        min: '',
        max: ''
      }
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (ruleId) => {
    // Remove the rule and clean up any references
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    
    // If no rules remain, set empty array
    if (updatedRules.length === 0) {
      setRules([]);
      return;
    }
    
    // Clean up any references to removed rule's Royalty Bases in other rules
    const cleanedRules = updatedRules.map(rule => {
      const cleanedRule = { ...rule };
      
      // Clean up proportionalRB references if they point to non-existent Royalty Bases
      if (cleanedRule.royaltyRate?.proportionalRB) {
        const validRB = cleanedRule.royaltyBase?.find(rb => rb.displayName === cleanedRule.royaltyRate.proportionalRB);
        if (!validRB) {
          cleanedRule.royaltyRate.proportionalRB = '';
        }
      }
      
      // Clean up stepStructure.xAxis references if they point to non-existent Royalty Bases
      if (cleanedRule.royaltyRate?.stepStructure?.xAxis) {
        const validRB = cleanedRule.royaltyBase?.find(rb => rb.displayName === cleanedRule.royaltyRate.stepStructure.xAxis);
        if (!validRB && cleanedRule.royaltyRate.stepStructure.xAxis !== 'time') {
          cleanedRule.royaltyRate.stepStructure.xAxis = '';
        }
      }
      
      // Clean up custom inputs that reference non-existent Royalty Bases
      if (cleanedRule.royaltyRate?.customInputs) {
        cleanedRule.royaltyRate.customInputs = cleanedRule.royaltyRate.customInputs.map(input => {
          if (input.type === 'rb' && input.rb) {
            const validRB = cleanedRule.royaltyBase?.find(rb => rb.displayName === input.rb);
            if (!validRB) {
              return { ...input, rb: '' };
            }
          }
          return input;
        });
      }
      
      return cleanedRule;
    });
    
    setRules(cleanedRules);
  };

  const resetRule = (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const resetRule = {
        ...rule,
        name: '',
        validityStart: '',
        validityEnd: '',
        evaluationInterval: {
          duration: '',
          parsed: null
        },
        royaltyBase: [{
          id: Date.now(),
          oracleAddress: '',
          propertyName: '',
          displayName: 'RB01',
          intellectualProperty: ''
        }],
        royaltyRate: {
          type: 'lumpsum',
          lumpsumValue: '',
          proportionalValue: '',
          proportionalRB: '',
          customFunc: 'sum',
          customInputs: [],
          stepStructure: {
            xAxis: '',
            steps: [],
            infiniteValue: ''
          },
          min: '',
          max: ''
        }
      };
      setRules(rules.map(r => r.id === ruleId ? resetRule : r));
    }
  };

  const generateRoyaltyRateSummary = (rule) => {
    const { royaltyRate } = rule;
    
    switch (royaltyRate.type) {
      case 'lumpsum':
        return `Lumpsum: $${royaltyRate.lumpsumValue || '0'} (Fixed amount)`;
      
      case 'proportional':
        return `Proportional: $${royaltyRate.proportionalValue || '0'} × ${royaltyRate.proportionalRB || 'RB'} (Multiply by Royalty Base)`;
      
      case 'custom': {
        const inputCount = royaltyRate.customInputs?.length || 0;
        if (inputCount === 0) {
          return `Custom: ${royaltyRate.customFunc || 'sum'} function (No inputs configured)`;
        }
        
        // Analyze custom inputs to create a detailed description
        const inputDescriptions = royaltyRate.customInputs.map((input, index) => {
          switch (input.type) {
            case 'constant':
              return `const(${input.value || '0'})`;
            case 'rb':
              return `RB(${input.rb || 'none'})`;
            case 'func': {
              const nestedInputCount = input.inputs?.length || 0;
              return `func(${input.func || 'sum'})[${nestedInputCount} inputs]`;
            }
            default:
              return 'unknown';
          }
        });
        
        const inputsDesc = inputDescriptions.join(' + ');
        return `Custom: ${royaltyRate.customFunc || 'sum'}(${inputsDesc}) (${inputCount} inputs)`;
      }
      
      default:
        return 'No royalty rate configured';
    }
  };

  const updateRule = (ruleId, field, value) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const updateRuleNested = (ruleId, path, value) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newRule = { ...rule };
        const keys = path.split('.');
        let current = newRule;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newRule;
      }
      return rule;
    }));
  };

  // Royalty Base management
  const addRoyaltyBase = (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const currentRB = rule.royaltyBase || [];
      const rbNumber = String(currentRB.length + 1).padStart(2, '0');
      const newRB = {
        id: Date.now(),
        oracleAddress: '',
        propertyName: '',
        displayName: `RB${rbNumber}`,
        intellectualProperty: ''
      };
      updateRuleNested(ruleId, 'royaltyBase', [...currentRB, newRB]);
    }
  };

  const removeRoyaltyBase = (ruleId, rbId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule && rule.royaltyBase) {
      const rbToRemove = rule.royaltyBase.find(rb => rb.id === rbId);
      const newRB = rule.royaltyBase.filter(rb => rb.id !== rbId);
      
      // Update the royalty base array
      updateRuleNested(ruleId, 'royaltyBase', newRB);
      
      // Clean up references to the removed Royalty Base
      if (rbToRemove) {
        const cleanedRule = { ...rule };
        
        // Clean up proportionalRB reference if it points to the removed Royalty Base
        if (cleanedRule.royaltyRate?.proportionalRB === rbToRemove.displayName) {
          updateRuleNested(ruleId, 'royaltyRate.proportionalRB', '');
        }
        
        // Clean up stepStructure.xAxis reference if it points to the removed Royalty Base
        if (cleanedRule.royaltyRate?.stepStructure?.xAxis === rbToRemove.displayName) {
          updateRuleNested(ruleId, 'royaltyRate.stepStructure.xAxis', '');
        }
        
        // Clean up custom inputs that reference the removed Royalty Base
        if (cleanedRule.royaltyRate?.customInputs) {
          const cleanedInputs = cleanedRule.royaltyRate.customInputs.map(input => {
            if (input.type === 'rb' && input.rb === rbToRemove.displayName) {
              return { ...input, rb: '' };
            }
            return input;
          });
          updateRuleNested(ruleId, 'royaltyRate.customInputs', cleanedInputs);
        }
      }
    }
  };

  const updateRoyaltyBase = (ruleId, rbId, field, value) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule && rule.royaltyBase) {
      const rbToUpdate = rule.royaltyBase.find(rb => rb.id === rbId);
      const newRB = rule.royaltyBase.map(rb => 
        rb.id === rbId ? { ...rb, [field]: value } : rb
      );
      
      // Update the royalty base array
      updateRuleNested(ruleId, 'royaltyBase', newRB);
      
      // If displayName is being changed, update references
      if (field === 'displayName' && rbToUpdate) {
        const oldDisplayName = rbToUpdate.displayName;
        const newDisplayName = value;
        
        // Update proportionalRB reference if it points to the old display name
        if (rule.royaltyRate?.proportionalRB === oldDisplayName) {
          updateRuleNested(ruleId, 'royaltyRate.proportionalRB', newDisplayName);
        }
        
        // Update stepStructure.xAxis reference if it points to the old display name
        if (rule.royaltyRate?.stepStructure?.xAxis === oldDisplayName) {
          updateRuleNested(ruleId, 'royaltyRate.stepStructure.xAxis', newDisplayName);
        }
        
        // Update custom inputs that reference the old display name
        if (rule.royaltyRate?.customInputs) {
          const updatedInputs = rule.royaltyRate.customInputs.map(input => {
            if (input.type === 'rb' && input.rb === oldDisplayName) {
              return { ...input, rb: newDisplayName };
            }
            return input;
          });
          updateRuleNested(ruleId, 'royaltyRate.customInputs', updatedInputs);
        }
      }
    }
  };

  // Custom function management with tree structure
  const addCustomInput = (ruleId, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    const newInput = {
      id: Date.now(),
      type: 'constant', // constant, func, rb
      value: '',
      func: 'sum',
      rb: '',
      inputs: [] // For nested functions
    };
    
    if (parentPath) {
      // Add to nested function
      const pathParts = parentPath.split('.');
      const newInputs = [...rule.royaltyRate.customInputs];
      let current = newInputs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])].inputs;
      }
      // Ensure the parent input has inputs array
      const parentIndex = parseInt(pathParts[pathParts.length - 1]);
      if (!current[parentIndex].inputs) {
        current[parentIndex].inputs = [];
      }
      current[parentIndex].inputs.push(newInput);
      updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
    } else {
      // Add to main level
      updateRuleNested(ruleId, 'royaltyRate.customInputs', [...rule.royaltyRate.customInputs, newInput]);
    }
  };

  const removeCustomInput = (ruleId, inputIndex, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    let newInputs = [...rule.royaltyRate.customInputs];
    
    if (parentPath) {
      // Remove from nested function
      const pathParts = parentPath.split('.');
      let current = newInputs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])].inputs;
      }
      current.splice(parseInt(pathParts[pathParts.length - 1]), 1);
    } else {
      // Remove from main level
      newInputs.splice(inputIndex, 1);
    }
    
    updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
  };

  const updateCustomInput = (ruleId, inputIndex, field, value, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    
    // Create a deep copy of the customInputs array
    const deepCopyInputs = (inputs) => {
      return inputs.map(input => ({
        ...input,
        inputs: input.inputs ? deepCopyInputs(input.inputs) : []
      }));
    };
    
    let newInputs = deepCopyInputs(rule.royaltyRate.customInputs);
    
    if (parentPath) {
      // Update nested function
      const pathParts = parentPath.split('.');
      let current = newInputs;
      
      // Navigate through all path parts to reach the parent container
      for (let i = 0; i < pathParts.length; i++) {
        const pathIndex = parseInt(pathParts[i]);
        if (current[pathIndex] && current[pathIndex].inputs) {
          current = current[pathIndex].inputs;
        } else {
          console.error('Invalid path:', parentPath, 'at part', i);
          return;
        }
      }
      
      // Now current should be the inputs array containing the target input
      if (current[inputIndex]) {
        current[inputIndex] = { 
          ...current[inputIndex], 
          [field]: value 
        };
      } else {
        console.error('Target input not found at index:', inputIndex);
        return;
      }
    } else {
      // Update main level
      if (newInputs[inputIndex]) {
        newInputs[inputIndex] = { ...newInputs[inputIndex], [field]: value };
      } else {
        console.error('Main level input not found:', inputIndex);
        return;
      }
    }
    
    console.log('Final newInputs after update:', newInputs);
    updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
  };

  const getOperationInputs = (operation) => {
    switch (operation) {
      case 'sum': return 2;
      case 'multiply': return 2;
      case 'divide': return 2;
      case 'subtract': return 2;
      case 'max': return 2;
      case 'min': return 2;
      default: return 2;
    }
  };

  const renderCustomInputs = (rule, inputs, parentPath = '', isReadOnly = false) => {
    const depth = parentPath ? parentPath.split('.').length : 0;
    const indentLevel = depth * 20;
    
    return inputs.map((input, idx) => (
      <div key={input.id} style={{ 
        border: '1px solid #ddd', 
        padding: '15px', 
        margin: '10px 0', 
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        marginLeft: `${indentLevel}px`,
        borderLeft: depth > 0 ? '3px solid #007bff' : '1px solid #ddd'
      }}>
        {/* Level indicator */}
        {depth > 0 && (
          <div style={{ 
            marginBottom: '10px', 
            fontSize: '12px', 
            color: '#6c757d',
            fontWeight: 'bold'
          }}>
            ↳ Level {depth} - Input {idx + 1}
          </div>
        )}
        
        <Row>
          <Col md="4">
            <FormGroup>
              <Label>Input {idx + 1} Type</Label>
              <Input
                type="select"
                value={input.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  updateCustomInput(rule.id, idx, 'type', newType, parentPath);
                  
                  // If selecting "Function", automatically create the required inputs
                  if (newType === 'func') {
                    // Update func and inputs in a single operation to avoid race conditions
                    const inputsNeeded = getOperationInputs('sum'); // Default to sum function
                    const newInputs = [];
                    for (let i = 0; i < inputsNeeded; i++) {
                      newInputs.push({ 
                        id: Date.now() + i, 
                        type: 'constant', 
                        value: '', 
                        func: 'sum', 
                        rb: '',
                        inputs: []
                      });
                    }
                    
                    // Update both func and inputs at once
                    const currentRule = rules.find(r => r.id === rule.id);
                    let newInputsArray = [...currentRule.royaltyRate.customInputs];
                    
                    if (parentPath) {
                      // Update nested function
                      const pathParts = parentPath.split('.');
                      let current = newInputsArray;
                      for (let i = 0; i < pathParts.length - 1; i++) {
                        current = current[parseInt(pathParts[i])].inputs;
                      }
                      const targetIndex = parseInt(pathParts[pathParts.length - 1]);
                      current[targetIndex] = { 
                        ...current[targetIndex], 
                        func: 'sum',
                        inputs: newInputs
                      };
                    } else {
                      // Update main level
                      newInputsArray[idx] = { 
                        ...newInputsArray[idx], 
                        func: 'sum',
                        inputs: newInputs
                      };
                    }
                    
                    updateRuleNested(currentRule.id, 'royaltyRate.customInputs', newInputsArray);
                  }
                }}
                readOnly={isReadOnly}
              >
                <option value="constant">Constant</option>
                <option value="func">Function</option>
                <option value="rb">Royalty Base</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="6">
            {input.type === 'constant' && (
              <FormGroup>
                <Label>Constant Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={input.value || ''}
                  onChange={(e) => updateCustomInput(rule.id, idx, 'value', e.target.value, parentPath)}
                  readOnly={isReadOnly}
                  placeholder="Enter constant value"
                />
              </FormGroup>
            )}
            {input.type === 'func' && (
              <FormGroup>
                <Label>Function</Label>
                <Input
                  type="select"
                  value={input.func || 'sum'}
                  onChange={(e) => {
                    updateCustomInput(rule.id, idx, 'func', e.target.value, parentPath);
                    const inputsNeeded = getOperationInputs(e.target.value);
                    const currentInputs = input.inputs ? input.inputs.length : 0;
                    if (currentInputs < inputsNeeded) {
                      // Add missing inputs
                      const newInputs = [...(input.inputs || [])];
                      for (let i = currentInputs; i < inputsNeeded; i++) {
                        newInputs.push({ 
                          id: Date.now() + i, 
                          type: 'constant', 
                          value: '', 
                          func: 'sum', 
                          rb: '',
                          inputs: []
                        });
                      }
                      updateCustomInput(rule.id, idx, 'inputs', newInputs, parentPath);
                    } else if (currentInputs > inputsNeeded) {
                      // Remove excess inputs
                      updateCustomInput(rule.id, idx, 'inputs', (input.inputs || []).slice(0, inputsNeeded), parentPath);
                    }
                  }}
                  readOnly={isReadOnly}
                >
                  <option value="sum">Sum</option>
                  <option value="multiply">Multiply</option>
                  <option value="divide">Divide</option>
                  <option value="subtract">Subtract</option>
                  <option value="max">Max</option>
                  <option value="min">Min</option>
                </Input>
              </FormGroup>
            )}
            {input.type === 'rb' && (
              <FormGroup>
                <Label>Royalty Base</Label>
                <Input
                  type="select"
                  value={input.rb}
                  onChange={(e) => {
                    try {
                      updateCustomInput(rule.id, idx, 'rb', e.target.value, parentPath);
                    } catch (error) {
                      console.error('Error updating Royalty Base:', error);
                      // Fallback: update the input directly without path navigation
                      const currentRule = rules.find(r => r.id === rule.id);
                      if (currentRule && currentRule.royaltyRate && currentRule.royaltyRate.customInputs) {
                        const newInputs = [...currentRule.royaltyRate.customInputs];
                        if (parentPath) {
                          // Simple fallback for nested inputs
                          const pathParts = parentPath.split('.');
                          let current = newInputs;
                          for (let i = 0; i < pathParts.length - 1; i++) {
                            const pathIndex = parseInt(pathParts[i]);
                            if (current[pathIndex] && current[pathIndex].inputs) {
                              current = current[pathIndex].inputs;
                            }
                          }
                          const targetIndex = parseInt(pathParts[pathParts.length - 1]);
                          if (current[targetIndex]) {
                            current[targetIndex].rb = e.target.value;
                            updateRuleNested(currentRule.id, 'royaltyRate.customInputs', newInputs);
                          }
                        } else {
                          // Main level fallback
                          if (newInputs[idx]) {
                            newInputs[idx].rb = e.target.value;
                            updateRuleNested(currentRule.id, 'royaltyRate.customInputs', newInputs);
                          }
                        }
                      }
                    }
                  }}
                  readOnly={isReadOnly}
                >
                  <option value="">Select RB</option>
                  {rule.royaltyBase && rule.royaltyBase.length > 0 ? (
                    (rule.royaltyBase || []).map((rb, rbIdx) => (
                      <option key={rbIdx} value={rb.displayName}>{rb.displayName}</option>
                    ))
                  ) : (
                    <option value="" disabled>No Royalty Bases available</option>
                  )}
                </Input>
              </FormGroup>
            )}
          </Col>
          <Col md="2">
            {!isReadOnly && (
              <Button
                color="danger"
                size="sm"
                onClick={() => removeCustomInput(rule.id, idx, parentPath)}
                style={{ marginTop: '30px' }}
              >
                Remove
              </Button>
            )}
          </Col>
        </Row>
        
        {/* Render nested inputs for functions */}
        {input.type === 'func' && input.inputs && input.inputs.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px', 
              marginBottom: '10px',
              border: '1px solid #bbdefb'
            }}>
              <Label style={{ fontWeight: 'bold', color: '#1976d2' }}>
                ↳ Nested Function: {input.func} (Level {depth + 1})
              </Label>
            </div>
            {renderCustomInputs(rule, input.inputs, parentPath ? `${parentPath}.${idx}` : `${idx}`, isReadOnly)}
            <Button
              color="info"
              size="sm"
              onClick={() => addCustomInput(rule.id, parentPath ? `${parentPath}.${idx}` : `${idx}`)}
              style={{ marginTop: '10px' }}
            >
              Add Nested Input
            </Button>
          </div>
        )}
      </div>
    ));
  };

  const renderRoyaltyRateSection = (rule, isReadOnly = false) => {
    const { royaltyRate } = rule;

    return (
      <div>
        {/* Summary Field */}
        <Row style={{ marginBottom: '20px' }}>
          <Col md="12">
            <FormGroup>
              <Label>Configuration Summary</Label>
              <Input
                type="text"
                value={generateRoyaltyRateSummary(rule)}
                readOnly
                style={{ 
                  backgroundColor: '#e9ecef', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <FormGroup style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '8px' }}>Royalty Rate Type</Label>
              <Input
                type="select"
                value={royaltyRate.type}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.type', e.target.value)}
                readOnly={isReadOnly}
              >
                <option value="lumpsum">Lumpsum</option>
                <option value="proportional">Proportional</option>
                <option value="custom">Custom</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '8px' }}>Min Value</Label>
              <Input
                type="number"
                step="0.01"
                value={royaltyRate.min || ''}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.min', e.target.value)}
                readOnly={isReadOnly}
                placeholder="Min value"
              />
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup style={{ marginBottom: '20px' }}>
              <Label style={{ marginBottom: '8px' }}>Max Value</Label>
              <Input
                type="number"
                step="0.01"
                value={royaltyRate.max || ''}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.max', e.target.value)}
                readOnly={isReadOnly}
                placeholder="Max value"
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Proportional RB field - shown only when type is proportional */}
        {royaltyRate.type === 'proportional' && (
          <Row>
            <Col md="12">
              <FormGroup style={{ marginBottom: '20px' }}>
                <Label style={{ marginBottom: '8px' }}>Proportional RB</Label>
                <Input
                  type="select"
                  value={royaltyRate.proportionalRB || ''}
                  onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.proportionalRB', e.target.value)}
                  readOnly={isReadOnly}
                >
                  <option value="">Select RB</option>
                  {rule.royaltyBase && rule.royaltyBase.length > 0 ? (
                    (rule.royaltyBase || []).map((rb, idx) => (
                      <option key={idx} value={rb.displayName}>{rb.displayName}</option>
                    ))
                  ) : (
                    <option value="" disabled>No Royalty Bases available</option>
                  )}
                </Input>
              </FormGroup>
            </Col>
          </Row>
        )}

        {/* All royalty rate types now use the same tab structure */}
        <StepStructureComponent 
          rule={rule}
          royaltyRate={royaltyRate}
          updateRuleNested={updateRuleNested}
          isReadOnly={isReadOnly}
        />

        {/* Custom function editor - shown only when type is custom */}
        {royaltyRate.type === 'custom' && (
          <div style={{ marginTop: '20px' }}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Function</Label>
                  <Input
                    type="select"
                    value={royaltyRate.customFunc}
                    onChange={(e) => {
                      updateRuleNested(rule.id, 'royaltyRate.customFunc', e.target.value);
                      const inputsNeeded = getOperationInputs(e.target.value);
                      const currentInputs = royaltyRate.customInputs.length;
                      if (currentInputs < inputsNeeded) {
                        // Add missing inputs
                        const newInputs = [...royaltyRate.customInputs];
                        for (let i = currentInputs; i < inputsNeeded; i++) {
                          newInputs.push({ 
                            id: Date.now() + i, 
                            type: 'constant', 
                            value: '', 
                            func: 'sum', 
                            rb: '',
                            inputs: []
                          });
                        }
                        updateRuleNested(rule.id, 'royaltyRate.customInputs', newInputs);
                      } else if (currentInputs > inputsNeeded) {
                        // Remove excess inputs
                        updateRuleNested(rule.id, 'royaltyRate.customInputs', royaltyRate.customInputs.slice(0, inputsNeeded));
                      }
                    }}
                    readOnly={isReadOnly}
                  >
                    <option value="sum">Sum</option>
                    <option value="multiply">Multiply</option>
                    <option value="divide">Divide</option>
                    <option value="subtract">Subtract</option>
                    <option value="max">Max</option>
                    <option value="min">Min</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <div style={{ marginTop: '20px' }}>
              <Label>Function Inputs</Label>
              {renderCustomInputs(rule, royaltyRate.customInputs, '', isReadOnly)}
              {!isReadOnly && (
                <Button
                  color="info"
                  size="sm"
                  onClick={() => addCustomInput(rule.id)}
                  style={{ marginTop: '10px' }}
                >
                  Add Input
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader>
        <CardTitle tag="h6">
          <RequiredField>Rules Configuration</RequiredField>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No rules configured yet.</p>
            <Button color="primary" onClick={addRule}>
              Add First Rule
            </Button>
          </div>
        ) : (
          <div>
            <Row style={{ marginBottom: '20px' }}>
              <Col md="8">
                {!isReadOnly && (
                  <Button color="primary" onClick={addRule} style={{ marginRight: '10px' }}>
                    Add Rule
                  </Button>
                )}
                <small>Total Rules: {rules.length}</small>
              </Col>
            </Row>

            <Nav tabs>
              {rules.map((rule, index) => (
                <NavItem key={rule.id}>
                  <NavLink
                    className={activeRuleIndex === index ? 'active' : ''}
                    onClick={() => setActiveRuleIndex(index)}
                  >
                    {rule.name || `Rule ${index + 1}`}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            <TabContent activeTab={activeRuleIndex}>
              {rules.map((rule, index) => (
                <TabPane key={rule.id} tabId={index}>
                  <div style={{ padding: '20px 0' }}>
                    {/* Basic Information and Royalty Evaluation Interval - Side by Side */}
                    <Row>
                      <Col md="6">
                        {/* Basic Information Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            General Information
                          </h6>
                          <FormGroup>
                            <Label>Rule Name</Label>
                            <Input
                              type="text"
                              value={rule.name}
                              onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                              readOnly={isReadOnly}
                              placeholder="Enter rule name"
                            />
                          </FormGroup>

                          <Row>
                            <Col md="6">
                              <FormGroup>
                                <Label>Validity Start Date</Label>
                                <Input
                                  type="date"
                                  value={rule.validityStart}
                                  onChange={(e) => updateRule(rule.id, 'validityStart', e.target.value)}
                                  readOnly={isReadOnly}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <Label>Validity End Date</Label>
                                <Input
                                  type="date"
                                  value={rule.validityEnd}
                                  onChange={(e) => updateRule(rule.id, 'validityEnd', e.target.value)}
                                  readOnly={isReadOnly}
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          {!isReadOnly && (
                            <Button
                              color="danger"
                              onClick={() => removeRule(rule.id)}
                              style={{ marginTop: '10px' }}
                            >
                              Remove Rule
                            </Button>
                          )}
                        </div>
                      </Col>

                      <Col md="6">
                        {/* Royalty Evaluation Interval Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Evaluation Interval
                          </h6>
                          <Row>
                            <Col md="6">
                              <FormGroup>
                                <Label>Evaluation Interval</Label>
                                <Input
                                  type="text"
                                  value={rule.evaluationInterval.duration || ''}
                                  onChange={(e) => updateRuleNested(rule.id, 'evaluationInterval.duration', e.target.value)}
                                  readOnly={isReadOnly}
                                  placeholder="e.g., 1Y 0M 0D or 6M or 30D"
                                />
                                <small className="form-text text-muted">
                                  Format: Years (Y), Months (M), Days (D). Examples: 1Y 0M 0D, 6M, 30D
                                </small>
                              </FormGroup>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Royalty Base and Royalty Rate - Side by Side */}
                    <Row>
                      <Col md="6">
                        {/* Royalty Base Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Base (RB)
                          </h6>
                          {!isReadOnly && (
                            <Button
                              color="info"
                              size="sm"
                              onClick={() => addRoyaltyBase(rule.id)}
                              style={{ marginBottom: '15px' }}
                            >
                              Add RB
                            </Button>
                          )}
                          {(!rule.royaltyBase || rule.royaltyBase.length === 0) ? (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '20px', 
                              color: '#6c757d',
                              fontStyle: 'italic',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              border: '1px dashed #dee2e6'
                            }}>
                              No Royalty Bases configured. Click "Add RB" to create one.
                            </div>
                          ) : (
                            (rule.royaltyBase || []).map((rb, rbIndex) => {
                            return (
                            <div key={rb.id} style={{ 
                              marginBottom: '12px', 
                              padding: '12px', 
                              backgroundColor: '#ffffff',
                              border: '1px solid #e9ecef',
                              borderRadius: '6px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                              <Row>
                                <Col md="12">
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                  }}>
                                    <h6 style={{ 
                                      margin: 0, 
                                      color: '#495057',
                                      fontSize: '0.9rem',
                                      fontWeight: '600'
                                    }}>
                                      {rb.displayName || `RB${String(rbIndex + 1).padStart(2, '0')}`}
                                    </h6>
                                    {!isReadOnly && (
                                      <Button
                                        color="danger"
                                        size="sm"
                                        onClick={() => removeRoyaltyBase(rule.id, rb.id)}
                                        style={{ 
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          minWidth: '60px'
                                        }}
                                      >
                                        × Remove
                                      </Button>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col md="6">
                                  <FormGroup style={{ marginBottom: '8px' }}>
                                    <Label style={{ 
                                      fontSize: '0.75rem', 
                                      marginBottom: '3px',
                                      color: '#6c757d',
                                      fontWeight: '500'
                                    }}>
                                      Oracle Address / Smart License Address
                                    </Label>
                                    <Input
                                      type="text"
                                      value={rb.oracleAddress}
                                      onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'oracleAddress', e.target.value)}
                                      readOnly={isReadOnly}
                                      placeholder="0x..."
                                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md="6">
                                  <FormGroup style={{ marginBottom: '8px' }}>
                                    <Label style={{ 
                                      fontSize: '0.75rem', 
                                      marginBottom: '3px',
                                      color: '#6c757d',
                                      fontWeight: '500'
                                    }}>
                                      Property Name
                                    </Label>
                                    <Input
                                      type="text"
                                      value={rb.propertyName}
                                      onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'propertyName', e.target.value)}
                                      readOnly={isReadOnly}
                                      placeholder="e.g., getManufacturedCount"
                                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col md="6">
                                  <FormGroup style={{ marginBottom: '8px' }}>
                                    <Label style={{ 
                                      fontSize: '0.75rem', 
                                      marginBottom: '3px',
                                      color: '#6c757d',
                                      fontWeight: '500'
                                    }}>
                                      Display Name
                                    </Label>
                                    <Input
                                      type="text"
                                      value={rb.displayName}
                                      onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'displayName', e.target.value)}
                                      readOnly={isReadOnly}
                                      placeholder="e.g., Manufactured Units"
                                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md="6">
                                  <FormGroup style={{ marginBottom: '8px' }}>
                                    <Label style={{ 
                                      fontSize: '0.75rem', 
                                      marginBottom: '3px',
                                      color: '#6c757d',
                                      fontWeight: '500'
                                    }}>
                                      Intellectual Property (IP)
                                    </Label>
                                    <Input
                                      type="text"
                                      value={rb.intellectualProperty}
                                      onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'intellectualProperty', e.target.value)}
                                      readOnly={isReadOnly}
                                      placeholder="e.g., Patent ID, Copyright, Trademark"
                                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                            </div>
                            );
                            })
                          )}
                        </div>
                      </Col>

                      <Col md="6">
                        {/* Royalty Rate Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Rate
                          </h6>
                          {renderRoyaltyRateSection(rule, isReadOnly)}
                        </div>
                      </Col>
                    </Row>


                    {!isReadOnly && (
                      <Row>
                        <Col md="12" style={{ textAlign: 'center' }}>
                          <Button
                            color="warning"
                            onClick={() => resetRule(rule.id)}
                            style={{ marginTop: '10px' }}
                          >
                            Reset This Rule
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>
                </TabPane>
              ))}
            </TabContent>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Manual Configuration Form
const ManualConfigurationForm = ({ manualData, setManualData, validation, showValidationErrors, setShowValidationErrors, isReadOnly = false }) => {
  const updateManualData = (field, value) => {
    setManualData({ ...manualData, [field]: value });
  };

  // Function to handle JSON file upload and populate form
  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          // Validate and process the JSON data
          if (jsonData.name && jsonData.licensor && jsonData.licensee) {
            // Ensure rules have proper IDs if missing
            const processedRules = jsonData.rules?.map((rule, index) => ({
              ...rule,
              id: rule.id || Date.now() + index,
              royaltyBase: (rule.royaltyBase || []).map((rb, rbIndex) => ({
                ...rb,
                id: rb.id || Date.now() + index * 100 + rbIndex,
                intellectualProperty: rb.intellectualProperty || ''
              })),
              royaltyRate: {
                ...rule.royaltyRate,
                customInputs: rule.royaltyRate?.customInputs || [],
                stepStructure: {
                  ...rule.royaltyRate?.stepStructure,
                  steps: rule.royaltyRate?.stepStructure?.steps?.map((step, stepIndex) => ({
                    ...step,
                    id: step.id || Date.now() + index * 1000 + stepIndex
                  })) || []
                }
              }
            })) || [];
            
            const processedData = {
              ...jsonData,
              rules: processedRules
            };
            
            setManualData(processedData);
            alert('✅ License data loaded successfully! All fields have been populated.');
          } else {
            alert('❌ Invalid JSON format. Please ensure the file contains required fields: name, licensor, licensee');
          }
        } catch (error) {
          alert('❌ Error parsing JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert('❌ Please select a valid JSON file');
    }
    
    // Reset the input value to allow re-uploading the same file
    event.target.value = '';
  };


  return (
    <div>
      {!isReadOnly && (
        <Row style={{ marginBottom: '15px' }}>
          <Col md="12">
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ color: '#495057', fontSize: '14px', fontWeight: '500' }}>
                  Load from JSON file
                </span>
                <small style={{ color: '#6c757d', marginLeft: '8px' }}>
                  Upload to populate all fields automatically
                </small>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  style={{ display: 'none' }}
                  id="json-upload"
                />
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={() => document.getElementById('json-upload').click()}
                  style={{ 
                    fontSize: '12px',
                    padding: '6px 12px'
                  }}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      <ValidationStatus 
        isValid={validation.isValid} 
        warnings={validation.warnings} 
        requiredFields={validation.requiredFields}
        mode="manual"
        showValidationErrors={showValidationErrors}
      />
      
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="licenseName">
              <RequiredField>License Name</RequiredField>
            </Label>
            <Input
              type="text"
              id="licenseName"
              placeholder="Enter license name"
              value={manualData.name || ''}
              onChange={(e) => updateManualData('name', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasName}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="territory">
              <RequiredField>Territory</RequiredField>
            </Label>
            <Input
              type="text"
              id="territory"
              placeholder="e.g., Worldwide, USA, Europe"
              value={manualData.territory || ''}
              onChange={(e) => updateManualData('territory', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasTerritory}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="licensor">
              <RequiredField>Licensor</RequiredField>
            </Label>
            <Input
              type="text"
              id="licensor"
              placeholder="Enter blockchain address (0x...) or name"
              value={manualData.licensor || ''}
              onChange={(e) => updateManualData('licensor', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasLicensor}
            />
            <small className="form-text text-muted">
              Enter blockchain address or name
            </small>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="licensee">
              <RequiredField>Licensee</RequiredField>
            </Label>
            <Input
              type="text"
              id="licensee"
              placeholder="Enter blockchain address (0x...) or name"
              value={manualData.licensee || ''}
              onChange={(e) => updateManualData('licensee', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasLicensee}
            />
            <small className="form-text text-muted">
              Enter blockchain address or name
            </small>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="duration">
              <RequiredField>Duration</RequiredField>
            </Label>
            <Input
              type="text"
              id="duration"
              placeholder="e.g., 5Y 10M 2D or 3Y 6M or 2Y"
              value={manualData.duration || ''}
              onChange={(e) => updateManualData('duration', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasDuration}
            />
            <small className="form-text text-muted">
              Format: Years (Y), Months (M), Days (D). Examples: 5Y 10M 2D, 3Y 6M, 2Y
            </small>
          </FormGroup>
        </Col>
        <Col md="6">
        </Col>
      </Row>

      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="ips">
              <RequiredField>Intellectual Properties</RequiredField>
            </Label>
            <Input
              type="textarea"
              id="ips"
              rows="4"
              placeholder="Describe the intellectual properties being licensed"
              value={manualData.ips || ''}
              onChange={(e) => updateManualData('ips', e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.requiredFields?.hasIPs}
            />
          </FormGroup>
        </Col>
      </Row>

      {/* Rules Configuration */}
      <RulesConfiguration 
        rules={manualData.rules || []}
        setRules={(rules) => updateManualData('rules', rules)}
        isReadOnly={isReadOnly}
      />

      {/* Smart Policy Dependencies */}
      <SmartPolicyDependenciesReadOnly rules={manualData.rules || []} />
    </div>
  );
};

// AI Configuration Form
const AIConfigurationForm = ({ aiText, setAiText, validation, showValidationErrors, setShowValidationErrors, isReadOnly = false }) => {
  const classes = useBuildSmartLicenseStyles();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAiText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <ValidationStatus 
        isValid={validation.isValid} 
        warnings={validation.warnings} 
        mode="ai"
        showValidationErrors={showValidationErrors}
      />
      
      {!isReadOnly && (
        <Row>
          <Col md="12">
            <FormGroup>
              <Label for="fileUpload">Upload Document</Label>
              <div className={classes.uploadArea}>
                <input
                  accept=".txt,.doc,.docx,.pdf,.json"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    className={classes.uploadButton}
                  >
                    Upload Document
                  </Button>
                </label>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: TXT, DOC, DOCX, PDF, JSON
                </Typography>
              </div>
            </FormGroup>
          </Col>
        </Row>
      )}
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="aiTextInput">
              <RequiredField>Or Enter Text/JSON Manually</RequiredField>
            </Label>
            <Input
              type="textarea"
              id="aiTextInput"
              rows="10"
              placeholder="Paste license agreement text, contract details, or requirements for AI analysis..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              readOnly={isReadOnly}
              invalid={!validation.isValid}
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

// Main Step Configuration Component
const StepConfiguration = ({ 
  mode, 
  manualData, 
  setManualData, 
  aiText, 
  setAiText, 
  handleNext, 
  handleBack,
  showValidationErrors,
  setShowValidationErrors,
  isReadOnly = false
}) => {
  // Enhanced validation logic with detailed feedback
  const getValidation = () => {
    if (mode === 'ai') {
      const isValid = validateAiText(aiText);
      return {
        isValid,
        warnings: isValid ? [] : ["Please provide at least 10 characters of text"],
        requiredFields: { hasText: isValid }
      };
    }
    
    // Manual mode validation
    const hasName = !!(manualData.name && manualData.name.trim());
    const hasLicensor = !!(manualData.licensor && manualData.licensor.trim());
    const hasLicensee = !!(manualData.licensee && manualData.licensee.trim());
    const hasDuration = !!(manualData.duration && manualData.duration.trim());
    const hasTerritory = !!(manualData.territory && manualData.territory.trim());
    const hasIPs = !!(manualData.ips && manualData.ips.trim());
    
    const isValid = hasName && hasLicensor && hasLicensee && hasDuration && hasTerritory && hasIPs;
    const warnings = [];
    
    if (!hasName) warnings.push("License name is required");
    if (!hasLicensor) warnings.push("Licensor is required");
    if (!hasLicensee) warnings.push("Licensee is required");
    if (!hasDuration) warnings.push("Duration is required");
    if (!hasTerritory) warnings.push("Territory is required");
    if (!hasIPs) warnings.push("Intellectual properties description is required");
    
    return {
      isValid,
      warnings,
      requiredFields: {
        hasName,
        hasLicensor,
        hasLicensee,
        hasDuration,
        hasTerritory,
        hasIPs
      }
    };
  };
  
  const validation = getValidation();
  const isNextDisabled = !validation.isValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">
          {mode === 'manual' ? 'License Configuration' : 'AI-Assisted Creation'}
        </CardTitle>
        <p className="card-category">
          {mode === 'manual' 
            ? 'Configure license details with royalty structures and usage bases' 
            : 'Provide text or upload a document for AI analysis'
          }
        </p>
      </CardHeader>
      <CardBody>
        {mode === 'manual' ? (
          <ManualConfigurationForm 
            manualData={manualData}
            setManualData={setManualData}
            validation={validation}
            showValidationErrors={showValidationErrors}
            setShowValidationErrors={setShowValidationErrors}
            isReadOnly={isReadOnly}
          />
        ) : (
          <AIConfigurationForm 
            aiText={aiText}
            setAiText={setAiText}
            validation={validation}
            showValidationErrors={showValidationErrors}
            setShowValidationErrors={setShowValidationErrors}
            isReadOnly={isReadOnly}
          />
        )}
        
        {!isReadOnly && (
          <Row style={{ marginTop: '30px' }}>
            <Col md="12" className="text-right">
              <Button
                color="secondary"
                onClick={handleBack}
                className="mr-2"
              >
                Back
              </Button>
              <Button
                color="primary"
                onClick={handleNext}
                disabled={isNextDisabled}
              >
                Next
              </Button>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

// PropTypes
RequiredField.propTypes = {
  children: PropTypes.node.isRequired,
  isRequired: PropTypes.bool,
};

ValidationStatus.propTypes = {
  isValid: PropTypes.bool.isRequired,
  warnings: PropTypes.array,
  requiredFields: PropTypes.object,
  mode: PropTypes.string,
  showValidationErrors: PropTypes.bool,
};

ManualConfigurationForm.propTypes = {
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
  validation: PropTypes.object.isRequired,
  showValidationErrors: PropTypes.bool,
  setShowValidationErrors: PropTypes.func,
  isReadOnly: PropTypes.bool,
};

RulesConfiguration.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    validityStart: PropTypes.string,
    validityEnd: PropTypes.string,
    evaluationInterval: PropTypes.shape({
      duration: PropTypes.string
    }),
    royaltyBase: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      oracleAddress: PropTypes.string.isRequired,
      propertyName: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      intellectualProperty: PropTypes.string.isRequired
    })),
    royaltyRate: PropTypes.shape({
      type: PropTypes.oneOf(['lumpsum', 'proportional', 'custom']),
      lumpsumValue: PropTypes.string,
      proportionalValue: PropTypes.string,
      proportionalRB: PropTypes.string,
      customFunc: PropTypes.string,
      customInputs: PropTypes.array,
      stepStructure: PropTypes.shape({
        xAxis: PropTypes.string,
        steps: PropTypes.array,
        infiniteValue: PropTypes.string
      }),
      min: PropTypes.string,
      max: PropTypes.string
    })
  })).isRequired,
  setRules: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
};

AIConfigurationForm.propTypes = {
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
  validation: PropTypes.object.isRequired,
  showValidationErrors: PropTypes.bool,
  setShowValidationErrors: PropTypes.func,
  isReadOnly: PropTypes.bool,
};

StepConfiguration.propTypes = {
  mode: PropTypes.string.isRequired,
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  showValidationErrors: PropTypes.bool,
  setShowValidationErrors: PropTypes.func,
  isReadOnly: PropTypes.bool,
};

export default StepConfiguration;