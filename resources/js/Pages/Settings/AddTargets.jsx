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
import MultiSelect from "react-multiple-select-dropdown-lite";
import "react-multiple-select-dropdown-lite/dist/index.css";

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
  // MuiGridItem: {
  //   padding: "8px!important",
  // },

}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const AddTargets = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
  const { allCustomers, allTargetNames } = usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const options = allTargetNames.map((item) => ({
    label: item.target_name,
    value: item.target_name,
  }));

  const [target, setTarget] = useState();
  const targetHandleChange = (val, key) => {
    setTarget({ [key]: val });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const finalData = {
    ...target,
    ...values,
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(route("add.target"), finalData)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setResponse(res.data.msg);
          setOpen(true);
          e.target.reset();
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet title="Add Target" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Add Target
        </Typography>
        <form validate="true" onSubmit={handleSubmit} className="add-target">
          <Grid container spacing={4}>
            <Grid item xs={12} classes={classes.MuiGridItem}>
              <TextField
                id="standard-select-currency-native"
                select
                name="Customer"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Customer</option>
                {allCustomers.map((option, indx) => (
                  <option key={indx} value={option.customer_name}>
                    {option.customer_name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} classes={classes.MuiGridItem}>
              <MultiSelect
                name="Ringba_Targets_Name"
                onChange={(val) =>
                  targetHandleChange(val, "Ringba_Targets_Name")
                }
                options={options}
                placeholder="Select Targets"
                style={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={12} classes={classes.MuiGridItem}>
              <TextField
                fullWidth
                label="Description"
                name="Description"
                onChange={handleChange}
                type="text"
                variant="outlined"
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

AddTargets.layout = (page) => <Layout title="Add Targets">{page}</Layout>;
export default AddTargets;
