import { React, useEffect, useState } from "react";
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
import toast from "react-hot-toast";

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

const AffiliateCreate = () => {
  const defaultState = {
    revenue: "",
    order_type: "",
    coupon_code: "",
    dialed: "",
    campaign_id: "",
    customer_id: "",
    affiliate_id: "",
    affiliate_fee: "",
    consumerExp_fee: "",
  };
  const classes = useStyles();
  const [values, setValues] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const { affiliates, campaigns, customers } = usePage().props;

  useEffect(() => {
    setValues((oldValue) => ({ ...oldValue, consumerExp_fee: (oldValue.revenue - oldValue.affiliate_fee) }));
  }, [values.revenue, values.affiliate_fee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(value)
    setValues((oldValues) => ({ ...oldValues, [name]: value }));
  };

  const headers = {
    headers: { Accept: "application/json" },
  };
  console.log(values)

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("ecommerce-affiliates.store"), values, headers)
      .then((res) => {
        setLoading(false);
        setValues(defaultState);
        toast.success(res.data.msg);
      })
      .catch((err) => {
        let errors = "";
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + "\n";
          });
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg;
        }
        setLoading(false);
        toast.error(errors);
      });
  };

  return (
    <>
      <Helmet title="Create Coupon Code" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Create Coupon Code
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
                value={values?.order_type}
                id="order_type"
                select
                name="order_type"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Order Type</option>
                <option value="1">E-commerce</option>
                <option value="2">Phone</option>
              </TextField>
            </Grid>

            {values?.order_type &&
              (values.order_type == 1 ? (
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
              ) : (
                <Grid item xs={12}>
                  <TextField
                    value={values?.dialed}
                    id="dialed"
                    label="Dialed Phone"
                    type="text"
                    name="dialed"
                    placeholder="123123123"
                    onChange={handleChange}
                    className={classes.textField}
                    fullWidth
                    required={true}
                  />
                </Grid>
              ))}

            <Grid item xs={12}>
              <TextField
                value={values?.revenue}
                id="revenue"
                label="Payout Per Order"
                type="text"
                name="revenue"
                placeholder="Exp: 100"
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
                label="Affiliate Fee"
                type="text"
                name="affiliate_fee"
                placeholder="Exp: 100"
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                required={true}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                value={values?.consumerExp_fee}
                id="consumerExp_fee"
                label="ConsumerEXP Fee"
                type="text"
                name="consumerExp_fee"
                className={classes.textField}
                fullWidth
                aria-readonly="true"
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    thickness={3}
                    size="1.5rem"
                  />
                ) : (
                  "Save"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

AffiliateCreate.layout = (page) => (
  <Layout title="E-commerce Affiliate Create">{page}</Layout>
);
export default AffiliateCreate;
