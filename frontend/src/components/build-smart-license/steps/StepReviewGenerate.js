import React from "react";
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
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";

const StepReviewGenerate = ({ 
  generatedJson, 
  generateJson, 
  handleBack, 
  handleNext,
  onCreateLicense 
}) => {
  const classes = useBuildSmartLicenseStyles();

  const handleCreateLicense = () => {
    if (onCreateLicense) {
      onCreateLicense(generatedJson);
    } else {
      // Default behavior - show success alert
      alert('Smart License created successfully!');
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Review & Generate Smart License</CardTitle>
        <p className="card-category">
          Review the generated smart license JSON configuration
        </p>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md="12">
            <FormGroup>
              <Label for="generatedJson">Generated Smart License JSON</Label>
              <textarea
                id="generatedJson"
                rows="30"
                value={generatedJson}
                readOnly
                className={classes.jsonDisplay}
                style={{
                  width: '100%',
                  minHeight: '600px',
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
          <Col md="3">
            <Button
              color="info"
              onClick={generateJson}
              block
            >
              Regenerate JSON
            </Button>
          </Col>
          <Col md="3">
            <Button
              color="secondary"
              onClick={handleDownloadJson}
              block
              disabled={!generatedJson}
            >
              Download JSON
            </Button>
          </Col>
          <Col md="3">
            <Button
              color="warning"
              onClick={handleCopyToClipboard}
              block
              disabled={!generatedJson}
            >
              Copy to Clipboard
            </Button>
          </Col>
          <Col md="3">
            <Button
              color="success"
              onClick={handleCreateLicense}
              block
              disabled={!generatedJson}
            >
              Create License
            </Button>
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
  generateJson: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  onCreateLicense: PropTypes.func, // Optional custom handler
};

export default StepReviewGenerate;