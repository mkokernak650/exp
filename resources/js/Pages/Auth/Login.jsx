import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  makeStyles,
} from "@material-ui/core";
import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import backgroundImage from "../../../images/background_image_compress.jpg";
import { usePage } from "@inertiajs/inertia-react";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "600px",
    height: "350px",
    marginTop: "150px",
    padding: "30px",
    borderRadius: "40px 146px 40px 146px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  loginForm: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
  },
  submitBtn: {
    backgroundColor: "#3b3e61",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#232b61",
    },
  },
  box1: {
    height: "100px",
    background: "#ffcc00",
    width: "100px",
    position: "absolute",
    borderRadius: "100%",
    right: "-50px",
  },
  box2: {
    height: "100px",
    background: "#f3327f",
    width: "100px",
    position: "absolute",
    borderRadius: "100%",
    left: "-50px",
  },
  errorMessage: {
    color: "#f71328",
  },
}));

const Login = () => {
  const { errors } = usePage().props;
  const classes = useStyles();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    const key = e.target.name;
    const value = e.target.value;

    setValues((oldValues) => ({
      ...oldValues,
      [key]: value,
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("login.attempt"), values);
  };

  return (
    <div className={classes.loginForm}>
      <Paper className={classes.paper}>
        <div className={classes.box1}></div>
        <div className={classes.box2}></div>
        <Box
          sx={{
            backgroundColor: "background.default",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
          }}
        >
          <Container maxWidth="sm">
            <form validate="true" onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography color="textPrimary" variant="h4" align="center">
                  Sign in
                </Typography>
              </Box>
              {errors.email && (
                <div className={classes.errorMessage}>{errors.email}</div>
              )}
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                name="email"
                onChange={handleChange}
                type="email"
                value={values.email}
                variant="outlined"
                required={true}
              />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                name="password"
                onChange={handleChange}
                type="password"
                value={values.password}
                variant="outlined"
                required={true}
              />
              {errors.password && (
                <div className={classes.errorMessage}>{errors.password}</div>
              )}

              <Box sx={{ py: 2 }}>
                <Button
                  color="primary"
                  size="large"
                  type="submit"
                  variant="contained"
                  className={classes.submitBtn}
                >
                  Sign in
                </Button>
              </Box>
            </form>
          </Container>
        </Box>
      </Paper>
    </div>
  );
};

export default Login;
