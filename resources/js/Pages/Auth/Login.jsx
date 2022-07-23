import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  makeStyles,
} from "@material-ui/core";
import backgroundImage from "../../../images/background_image_compress.jpg";
import { useForm } from "@inertiajs/inertia-react";

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
  const classes = useStyles();
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
});

  const onHandleChange = (event) => {
    setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
};

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route("login.attempt"));
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
                onChange={onHandleChange}
                type="email"
                value={data.email}
                variant="outlined"
                required={true}
              />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                name="password"
                onChange={onHandleChange}
                type="password"
                value={data.password}
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
