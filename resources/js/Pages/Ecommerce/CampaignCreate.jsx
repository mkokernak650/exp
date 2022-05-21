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
import axios from "axios";
import { Helmet } from "react-helmet";
import SnackBar from "../../Shared/SnackBar";
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

const CampaignCreate = () => {
  const defaultState = {
    campaign_name: "",
  };
  const classes = useStyles();
  const [values, setValues] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [responseType, setResponseType] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({ ...oldValues, [name]: value }));
  };

  const headers = {
    headers: { Accept: "application/json" },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("ecommerce-campaigns.store"), values, headers)
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
      <Helmet title="Create Campaign" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Create Campaign
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                value={values?.campaign_name}
                id="campaign_name"
                label="Campaign Name"
                type="text"
                name="campaign_name"
                placeholder=""
                onChange={handleChange}
                className={classes.textField}
                fullWidth
                required={true}
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

      <SnackBar
        open={open}
        setOpen={setOpen}
        severity={responseType}
        response={response}
      />
    </>
  );
};

CampaignCreate.layout = (page) => (
  <Layout title="E-commerce Campaign Create">{page}</Layout>
);
export default CampaignCreate;
