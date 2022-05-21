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
import axios from "axios";
import { Helmet } from "react-helmet";
import { currentDate } from "../../Helpers/CurrentDate";

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
  MuiGridItem: {
    padding: "4px",
    marginBottom: "15px",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const AddBroadcastMonth = () => {
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
      .post(route("broadcast.month.store"), values)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setResponse(res.data.msg);
          setOpen(true);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet title="Add Broadcast Month" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add Broadcast Month
        </Typography>
        <form validate='true' onSubmit={handleSubmit} className="add-target">
          <Grid container spacing={4}>
            <Grid item xs={12} className={classes.MuiGridItem}>
              <TextField
                fullWidth
                label="Broadcast Month"
                margin="normal"
                name="broad_cast_month"
                onChange={handleChange}
                type="text"
                variant="outlined"
                required={true}

              />
            </Grid>
            <Grid item xs={12} className={classes.MuiGridItem}>
              <TextField
                id="date"
                label="Start Date"
                type="date"
                name="start_date"
                onChange={handleChange}
                defaultValue={currentDate}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required={true}

              />
            </Grid>

            <Grid item xs={12} className={classes.MuiGridItem}>
              <TextField
                id="date"
                label="End Date"
                type="date"
                name="end_date"
                onChange={handleChange}
                defaultValue={currentDate}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required={true}

              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : "Submit"}
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

AddBroadcastMonth.layout = (page) => (
  <Layout title="Add Broadcast Month">{page}</Layout>
);
export default AddBroadcastMonth;
