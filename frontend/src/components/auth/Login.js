import { makeStyles, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { setUserSession } from "../../utils/Common";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";

import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

import Typography from "@material-ui/core/Typography";
import { ThemeProvider } from "@material-ui/styles";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Row, Col, Card } from "reactstrap";
import themecol from "ColorTheme";

import logoAlps from "assets/logos/ALPSlogo.png";
import logoca from "assets/logos/ca-logo.png";
import logoifm from "assets/logos/ifm-logo.png";
import logopitch from "assets/logos/pitchin-logo.svg";
import licensee1 from "assets/backgrounds/licensee-1.jpg";
import licensor1 from "assets/backgrounds/licensor-1.jpg";

import BlockchainConfigDialog from "./BlockchainConfigDialog.js";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage: logoAlps,
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "#A9C47F",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Login(props) {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  //   const password = useFormInput('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenState, setScreenState] = useState(0);

  // handle button click of login form
  const handleLogin = () => {
    setError(null);
    setUserSession(username);
    props.history.push("/");
  };
  const handleTabChange = (event, newValue) => {
    setScreenState(newValue);
  };

  return (
    <ThemeProvider theme={themecol}>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />

        <Grid item xs={false} sm={4} md={7} className={classes.image}>
          <div className="hover08 img-background">
            <figure>
              <img
                className="img-background"
                src={screenState ? licensor1 : licensee1}
              />
            </figure>
          </div>
        </Grid>

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Box mb={9}>
              <Grid item>
                <Tabs
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                  value={screenState}
                  onChange={handleTabChange}
                >
                  <Tab label="Licensee" value={0} />
                  <Tab
                    label="Licensor"
                    value={1}
                    // onClick={() => {
                    //   console.log(screenState);
                    //   setScreenState(1);
                    // }}
                  />
                  {/* <Tab label="Financial" /> */}
                </Tabs>
              </Grid>
            </Box>

            <Avatar className={classes.avatar}>
              <img src={logoAlps} />
            </Avatar>
            <Typography component="h1" variant="h5"></Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="access-key"
                label="Access Key"
                name="Access Key"
                autoComplete="Key"
                autoFocus
                onChange={(e) => {
                  e.preventDefault();
                  setUsername(e.target.value);
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleLogin}
              >
                Connect
              </Button>
              <Box display="flex" justifyContent="center">
                <BlockchainConfigDialog />
              </Box>

              <Box mt={18} px={10}>
                <div className="logo">
                  <Row>
                    <Col>
                      <div className="img-logo">
                        <img src={logoca} alt="react-logo" align="bottom" />
                      </div>
                    </Col>
                    <Col>
                      <div className="img-logo">
                        <img src={logoifm} alt="react-logo" />
                      </div>
                    </Col>
                    <Col>
                      <div>
                        <img src={logopitch} alt="react-logo" />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Box>
              <Box mt={2}>{/* <Copyright /> */}</Box>
            </form>
          </div>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

const useFormInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  return {
    value,
    onChange: handleChange,
  };
};

export default Login;
