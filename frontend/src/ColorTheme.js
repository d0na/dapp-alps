import { createMuiTheme } from '@material-ui/core/styles';



const theme = createMuiTheme({
  palette: {
    primary: {
      // blue-ish Hex from IFM guidelines
      main: '#7DA1C4',
    },
    secondary: {
      main: '#51cbce',
    },
  },
});

export default theme;