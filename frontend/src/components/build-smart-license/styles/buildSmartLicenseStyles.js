import { makeStyles } from "@material-ui/core/styles";

export const useBuildSmartLicenseStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  uploadButton: {
    margin: theme.spacing(1),
  },
  textField: {
    margin: theme.spacing(1),
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(3),
  },
  uploadArea: {
    border: '2px dashed #ccc',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px',
    borderRadius: '8px',
    '&:hover': {
      borderColor: '#999',
      backgroundColor: '#fafafa'
    }
  },
  jsonDisplay: {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    minHeight: '600px !important',
    height: 'auto !important',
    resize: 'vertical',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555'
    }
  }
}));