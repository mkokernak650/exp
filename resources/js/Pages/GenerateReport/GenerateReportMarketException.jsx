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
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

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
const GenerateReportMarketException = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const { markets, customers } = usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [customer, setCustomer] = useState();
  const [market, setMarket] = useState();
  const [startDate, setStartDate] = useState({ start_date: "" });
  const [endDate, setEndDate] = useState({ end_date: "" });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const marketHandleChange = (e) => {
    const { name, value } = e.target;
    setMarket({ [name]: value });
  };
  const customerHandleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ [name]: value });
  };

  const startDateHandleChange = (e) => {
    const { name, value } = e.target;
    setStartDate({ [name]: value });
  };
  const endDateHandleChange = (e) => {
    const { name, value } = e.target;
    setEndDate({ [name]: value });
  };
  const values = {
    ...customer,
    ...market,
    ...startDate,
    ...endDate,
  };
  console.log(values);

  const handleSubmit = () => {
    axios.post(route("market.exception.report.generator"), values).then((r) => {
      if (r.data.status == 500) {
        setOpen(true);
        setResponse(r.data.msg);
      }
      exportToCSV(r.data, "Market_Exception_Report");
    });
  };

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData.data, fileName);
    const secondData = apiData.data.length + 5;
    const call_summary = [];
    call_summary.push(["Summary of Calls", ""]);
    Object.keys(apiData.call_summary).forEach((cf) => {
      call_summary.push([cf, apiData.call_summary[cf]]);
    });
    const thirdData = apiData.data.length + call_summary.length + 6;
    const category = [];
    category.push(["Category", "Total Calls", "Total Revenue"]);
    Object.keys(apiData.tag_count).forEach((cat) => {
      category.push(Object.values(apiData.tag_count[cat]));
    });

    XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` });
    XLSX.utils.sheet_add_aoa(ws, category, { origin: `C${thirdData}` });
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
    setOpen(true);
    setResponse("Report Generated Successfully");
  };

  return (
    <>
      <Helmet title="Generate Report Market Exception" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Market Exception
        </Typography>
        <form validate="true" className="generate-report-target">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="customer_name"
                onChange={customerHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
                required={true}
              >
                <option value="">Select Customer</option>
                {customers.map((option, indx) => (
                  <option key={indx} value={option.customer_name}>
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
                onChange={marketHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                <option value="">Select Market</option>
                {markets.map((option, indx) => (
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
                onChange={startDateHandleChange}
                value={startDate.start_date}
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
                onChange={endDateHandleChange}
                value={endDate.end_date}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => handleSubmit()}
              >
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

GenerateReportMarketException.layout = (page) => (
  <Layout title="Generate Report Market Exception">{page}</Layout>
);
export default GenerateReportMarketException;
