import { React, useState } from "react";
import Layout from "../../Layout/Layout";
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
const CampaignSettingForm = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const { allCampaigns } = usePage().props;
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
      .post(route("campaign.setting.update"), values)
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
      <Helmet title="Set Duration" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Set Duration
        </Typography>
        <form validate="true" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id="campaign_id"
                select
                name="campaign_id"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Campaign</option>
                {allCampaigns.map((option, indx) => (
                  <option key={indx} value={option.id}>
                    {option.campaign_name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="Connection_Duration"
                label="Connection Duration (in Sec)"
                type="number"
                name="connection_duration"
                onChange={handleChange}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : "Update"}
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

CampaignSettingForm.layout = (page) => (
  <Layout title="Market Exception">{page}</Layout>
);
export default CampaignSettingForm;
