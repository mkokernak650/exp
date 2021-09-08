import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Radio,
  FormControlLabel,
  RadioGroup,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { usePage } from "@inertiajs/inertia-react";
import axios from "axios";
import { Helmet } from "react-helmet";

// import DateFnsUtils from "@date-io/date-fns";
// import {
//   MuiPickersUtilsProvider,
//   KeyboardTimePicker,
//   KeyboardDatePicker,
// } from "@material-ui/pickers";

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
const GenerateReportAffiliate = () => {
  const classes = useStyles();
  const [values, setValues] = useState({
    type:"billed",
    start_date:""
  });
  const [loading, setLoading] = useState(false);
  const { affiliates, broadCastMonths, broadCastWeeks } = usePage().props;
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
  // const [selectedDate, setSelectedDate] = useState(
  //   new Date("2014-08-18T21:11:54")
  // );

  // const handleDateChange = (date) => {
  //   setSelectedDate(date);
  // };
  console.log(values)

  // let today = new Date();
  // let dd = String(today.getDate()).padStart(2, "0");
  // let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  // let yyyy = today.getFullYear();

  // today = mm + "/" + dd + "/" + yyyy;
  // setValues({start_date:today})

  return (
    <>
      <Helmet title="Generate Report Affiliate" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Affiliate
        </Typography>
        <form
          validate="true"
          onSubmit={handleSubmit}
          className="generate-report-affiliate"
        >
          <Grid container spacing={4}>
            {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid item xs={12}>
                <KeyboardDatePicker
                  margin="normal"
                  id="date-picker-dialog"
                  label="Date picker dialog"
                  format="MM/dd/yyyy"
                  // value={selectedDate}
                  // onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  fullWidth
                  name="start_date"
                  onChange={handleChange}
                />
              </Grid>
            </MuiPickersUtilsProvider> */}
            <Grid item xs={12}>
              <RadioGroup
                aria-label="type"
                name="type"
                value={values.type}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="general"
                  control={<Radio color="primary" />}
                  label="General"
                />
                <FormControlLabel
                  value="billed"
                  control={<Radio color="primary" />}
                  label="Billed"
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
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
                  <option key={indx} value={option.affiliate_id}>
                    {option.affiliate_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="broad_cast_month"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Broadcast Month</option>
                {broadCastMonths.map((option, indx) => (
                  <option key={indx} value={option.broad_cast_month}>
                    {option.broad_cast_month}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="broad_cast_week"
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Broadcast Week</option>
                {broadCastWeeks.map((option, indx) => (
                  <option key={indx} value={option.broad_cast_week}>
                    {option.broad_cast_week}
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
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="date"
                label="End Date"
                type="date"
                name="end_date"
                onChange={handleChange}
                defaultValue="2021-01-06"
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
                {loading ? <CircularProgress color="secondary" /> : "Generate"}
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

GenerateReportAffiliate.layout = (page) => (
  <Layout title="Market Exception">{page}</Layout>
);
export default GenerateReportAffiliate;
