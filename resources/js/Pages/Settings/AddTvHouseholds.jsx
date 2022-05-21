import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Helmet } from "react-helmet";
import axios from "axios";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    width: "500px",
    margin: "auto",
    marginTop: "2rem",
    padding: "40px",
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  title: {
    textAlign: "center",
    marginBottom: "35px",
  },
  snackbar: {
    maxWidth: "500px",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const AddCustomer = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("store.tv.households"), values)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          setResponse(res.data.msg);
          setOpen(true);
          e.target.reset()
        }
      })
      .catch((err) => { });
  };

  return (
    <>
      <Helmet title="Add TV Households" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add TV Households
        </Typography>
        <form validate='true' onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Market"
                margin="normal"
                name="market"
                onChange={handleChange}
                type="text"
                variant="outlined"
                required={true}

              />
              <TextField
                fullWidth
                label="State"
                margin="normal"
                name="state"
                onChange={handleChange}
                type="text"
                variant="outlined"

              />
              <TextField
                fullWidth
                label="TV Households"
                margin="normal"
                name="tv_households"
                onChange={handleChange}
                type="text"
                variant="outlined"
              />

            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? (
                  <CircularProgress
                    color="secondary"
                    thickness={3}
                    size="2rem"
                  />
                ) : (
                  "Submit"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          className={classes.snackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="success">{response}</Alert>
        </Snackbar>
      </>
    </>
  );
};

AddCustomer.layout = (page) => <Layout title="Add Customer">{page}</Layout>;
export default AddCustomer;
