import { React, useState } from "react";
import Layout from "../Layout/Layout";
import { Inertia } from "@inertiajs/inertia";
import {
  CircularProgress,
  Typography,
  TextField,
  Button,
  makeStyles,
  Paper,
} from "@material-ui/core";
import { Helmet } from "react-helmet";
// import {
//   MuiPickersUtilsProvider,
//   KeyboardTimePicker,
//   KeyboardDatePicker,
// } from "@material-ui/pickers";
// import DateFnsUtils from "@date-io/date-fns";
const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
    width: 600,
    margin: "auto",
    flexDirection: "column",
    marginTop: 60,
    textAlign: "center",
    padding: "20px",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
    margin: "10px",
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
    margin: "10px",
  },

  title: {
    textAlign: "center",
    marginBottom: "35px",
  },
}));

const GetRingbaData = () => {
  const classes = useStyles();
  const [values, setValues] = useState();
  const [loading, setLoading] = useState(false);
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
    Inertia.post("temp-ringba-data", values, {
      onFinish: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <Helmet title="Get Ringba Data" />

      <Paper className={classes.container}>
        <Typography variant="h5" className={classes.title}>
          Fetch Ringba Data
        </Typography>
        <form validate='true' onSubmit={handleSubmit}>
          <TextField
            id="date"
            label="Start Date"
            type="date"
            name="startDate"
            onChange={handleChange}
            defaultValue="2021-06-01"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              margin="normal"
              id="date"
              label="Start Date"
              format="MM/dd/yyyy"
              onChange={handleDateChange}
              value={selectedDate}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              className={classes.textField}
              required
            />
          </MuiPickersUtilsProvider> */}
          <TextField
            id="date"
            label="End Date"
            type="date"
            name="endDate"
            defaultValue="2021-07-01"
            className={classes.textField}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            className={classes.button}
          >
            {loading ? (
              <CircularProgress color="secondary" />
            ) : (
              "Get Ringba Data"
            )}
          </Button>
        </form>
      </Paper>
    </div>
  );
};

GetRingbaData.layout = (page) => (
  <Layout title="Get Ringba Data">{page}</Layout>
);
export default GetRingbaData;
