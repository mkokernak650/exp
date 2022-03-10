import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";
import SnackBar from "../../Shared/SnackBar";

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

const AffiliateCreate = () => {
  const defaultState = {
    affiliate_id: "",
    coupon_code: "",
    percentage: "",
  };
  const classes = useStyles();
  const [values, setValues] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const { affiliates, campaigns, customers } = usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [responseType, setResponseType] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const headers = {
    headers: {
      Accept: "application/json",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("ecommerce-affiliates.store"), values, headers)
      .then((res) => {
        setLoading(false);
        setResponse(res.data.msg);
        setResponseType("success");
        setOpen(true);
        setValues(defaultState);
      })
      .catch((err) => {
        let errors = "";
        setLoading(false);
        Object.values(err.response.data?.errors).map((error) => {
          errors += error[0] + "\n";
        });
        setResponse(errors);
        setResponseType("error");
        setOpen(true);
      });
  };

  return (
    <>
      <Helmet title="Add E-commerce Affiliate" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add E-commerce Affiliate
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                value={values?.campaign_id}
                id="campaign_id"
                select
                name="campaign_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={false}
              >
                <option value="">Select Campaign</option>
                {campaigns.map((option, indx) => (
                  <option key={indx + `-1`} value={option.id}>
                    {option.campaign_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                value={values?.customer_id}
                id="customer_id"
                select
                name="customer_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Customer</option>
                {customers.map((option, indx) => (
                  <option key={indx + `-2`} value={option.id}>
                    {option.customer_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                value={values?.affiliate_id}
                id="affiliate_id"
                select
                name="affiliate_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Affiliate</option>
                {affiliates.map((option, indx) => (
                  <option key={indx + `-3`} value={option.id}>
                    {option.affiliate_name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                value={values?.coupon_code}
                id="coupon_code"
                label="Coupon Code"
                type="text"
                name="coupon_code"
                placeholder="Exp: #CX12345"
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                required={true}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                value={values?.affiliate_fee}
                id="affiliate_fee"
                label="Affiliate Fee %"
                type="text"
                name="affiliate_fee"
                placeholder="Exp: 0.5"
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                required={true}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                value={values?.percentage}
                id="percentage"
                label="Percentage %"
                type="text"
                name="percentage"
                placeholder="Exp: 0.5"
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? <CircularProgress color="secondary" /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <SnackBar
        open={open}
        setOpen={setOpen}
        severity={responseType}
        response={response}
      />
    </>
  );
};

AffiliateCreate.layout = (page) => (
  <Layout title="E-commerce Affiliate Create">{page}</Layout>
);
export default AffiliateCreate;
