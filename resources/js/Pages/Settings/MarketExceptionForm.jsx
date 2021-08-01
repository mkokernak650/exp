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
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    width: "500px",
    margin: "auto",
    marginTop: "5rem",
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
const MarketExceptionForm = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const { allCustomers, allMarkets, success } = usePage().props;
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
    console.log(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("add-market-exception"), values)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setResponse(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => {});
  };

  return (
    <>
      <Helmet title="Market Exception Form" />

      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add Market Exception
        </Typography>
        <form validate onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="customer"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required="true"
              >
                <option value="">Select Customer</option>
                {allCustomers.map((option, indx) => (
                  <option key={indx} value={option.customer_ID}>
                    {option.customer_name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="market"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required="true"
              >
                <option value="">Select Market</option>
                {allMarkets.map((option, indx) => (
                  <option key={indx} value={option.market}>
                    {option.market}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="date"
                label="Start Date"
                type="date"
                name="start_date"
                onChange={handleChange}
                defaultValue="2021-01-06"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required="true"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? <CircularProgress color="secondary" /> : "Submit"}
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

MarketExceptionForm.layout = (page) => (
  <Layout title="Market Exception">{page}</Layout>
);
export default MarketExceptionForm;
