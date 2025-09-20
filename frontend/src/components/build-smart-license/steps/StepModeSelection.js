import React from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";

const StepModeSelection = ({ mode, setMode, handleNext }) => {
  const classes = useBuildSmartLicenseStyles();

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Choose Creation Mode</CardTitle>
        <p className="card-category">
          Select how you want to create your smart license
        </p>
      </CardHeader>
      <CardBody>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Creation Mode</FormLabel>
          <RadioGroup
            aria-label="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label="Manual Configuration"
            />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              style={{ marginLeft: 32, marginBottom: 16 }}
            >
              Use a structured form to manually configure all license parameters
            </Typography>
            
            <FormControlLabel
              value="ai"
              control={<Radio />}
              label="AI-Assisted Creation"
            />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              style={{ marginLeft: 32, marginBottom: 20 }}
            >
              Upload a document or provide text for AI to analyze and generate the license
            </Typography>
          </RadioGroup>
        </FormControl>

        {/* Verify Proposal Section */}
        <FormControl component="fieldset" className={classes.formControl} style={{ marginTop: '30px' }}>
          <FormLabel component="legend">Verify Proposal</FormLabel>
          <RadioGroup
            aria-label="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel
              value="upload"
              control={<Radio />}
              label="Upload Existing Files"
            />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              style={{ marginLeft: 32 }}
            >
              Upload existing JSON and Solidity files to review and proceed with deployment
            </Typography>
          </RadioGroup>
        </FormControl>
        
        <Row>
          <Col md="12" className="text-right">
            <Button
              color="primary"
              onClick={handleNext}
              disabled={!mode}
            >
              Next
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

StepModeSelection.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default StepModeSelection;