import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  Badge
} from 'reactstrap';
import { useBuildSmartLicenseStyles } from '../styles/buildSmartLicenseStyles';

const StepFileUpload = ({ 
  uploadedJson, 
  setUploadedJson, 
  uploadedSolidity, 
  setUploadedSolidity,
  handleNext,
  handleBack 
}) => {
  const classes = useBuildSmartLicenseStyles();
  const [jsonFile, setJsonFile] = useState(null);
  const [solidityFile, setSolidityFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [solidityText, setSolidityText] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'

  const handleJsonFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setUploadedJson(content);
        setJsonText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSolidityFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSolidityFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setUploadedSolidity(content);
        setSolidityText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleJsonTextChange = (e) => {
    const content = e.target.value;
    setJsonText(content);
    setUploadedJson(content);
  };

  const handleSolidityTextChange = (e) => {
    const content = e.target.value;
    setSolidityText(content);
    setUploadedSolidity(content);
  };

  const isReadyToProceed = uploadedJson && uploadedSolidity;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Upload Existing Files</CardTitle>
        <p className="card-category">
          Upload JSON and Solidity files to review and proceed with deployment
        </p>
      </CardHeader>
      <CardBody>
        {/* Upload Mode Selection */}
        <Row style={{ marginBottom: '20px' }}>
          <Col md="12">
            <FormGroup>
              <Label>Upload Method:</Label>
              <div>
                <Button
                  color={uploadMode === 'file' ? 'primary' : 'outline-primary'}
                  onClick={() => setUploadMode('file')}
                  style={{ marginRight: '10px' }}
                >
                  Upload Files
                </Button>
                <Button
                  color={uploadMode === 'text' ? 'primary' : 'outline-primary'}
                  onClick={() => setUploadMode('text')}
                >
                  Paste Text
                </Button>
              </div>
            </FormGroup>
          </Col>
        </Row>

        {uploadMode === 'file' ? (
          // File Upload Mode
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="jsonFile">JSON Configuration File</Label>
                <Input
                  type="file"
                  id="jsonFile"
                  accept=".json"
                  onChange={handleJsonFileUpload}
                />
                {jsonFile && (
                  <Alert color="success" style={{ marginTop: '10px' }}>
                    ✅ File uploaded: {jsonFile.name}
                  </Alert>
                )}
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="solidityFile">Solidity Contract File</Label>
                <Input
                  type="file"
                  id="solidityFile"
                  accept=".sol"
                  onChange={handleSolidityFileUpload}
                />
                {solidityFile && (
                  <Alert color="success" style={{ marginTop: '10px' }}>
                    ✅ File uploaded: {solidityFile.name}
                  </Alert>
                )}
              </FormGroup>
            </Col>
          </Row>
        ) : (
          // Text Input Mode
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="jsonText">JSON Configuration</Label>
                <Input
                  type="textarea"
                  id="jsonText"
                  rows="15"
                  value={jsonText}
                  onChange={handleJsonTextChange}
                  placeholder="Paste your JSON configuration here..."
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="solidityText">Solidity Contract</Label>
                <Input
                  type="textarea"
                  id="solidityText"
                  rows="15"
                  value={solidityText}
                  onChange={handleSolidityTextChange}
                  placeholder="Paste your Solidity contract here..."
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
              </FormGroup>
            </Col>
          </Row>
        )}

        {/* File Upload Status */}
        <Row style={{ marginTop: '20px' }}>
          <Col md="12">
            <Card style={{ 
              backgroundColor: isReadyToProceed ? '#d4edda' : '#fff3cd',
              borderColor: isReadyToProceed ? '#c3e6cb' : '#ffeaa7'
            }}>
              <CardHeader>
                <CardTitle tag="h5">
                  {isReadyToProceed ? '✅' : '⚠️'} File Upload Status
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Alert color={isReadyToProceed ? 'success' : 'warning'}>
                  <strong>
                    {isReadyToProceed 
                      ? 'Files uploaded successfully! Ready to proceed to review.'
                      : 'Upload Required - Please upload both JSON and Solidity files.'
                    }
                  </strong>
                </Alert>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                  <div>
                    <Badge color={uploadedJson ? 'success' : 'secondary'}>
                      {uploadedJson ? '✅' : '⏳'} JSON Configuration
                    </Badge>
                  </div>
                  <div>
                    <Badge color={uploadedSolidity ? 'success' : 'secondary'}>
                      {uploadedSolidity ? '✅' : '⏳'} Solidity Contract
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Navigation Buttons */}
        <Row>
          <Col md="12" className="text-right" style={{ marginTop: '20px' }}>
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
              disabled={!isReadyToProceed}
            >
              Next
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

StepFileUpload.propTypes = {
  uploadedJson: PropTypes.string.isRequired,
  setUploadedJson: PropTypes.func.isRequired,
  uploadedSolidity: PropTypes.string.isRequired,
  setUploadedSolidity: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default StepFileUpload;
