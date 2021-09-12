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
const GenerateReportTarget = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const { affiliates, broadCastMonths, broadCastWeeks, targets } =
    usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [type, setType] = useState({ type: "billed" });
  const [customer, setCustomer] = useState();
  const [target, setTarget] = useState("");
  const [targetByCustomer, setTargetByCustomer] = useState([]);
  const [affiliate, setAffiliate] = useState();
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [startDate, setStartDate] = useState({ start_date: "" });
  const [endDate, setEndDate] = useState({ end_date: "" });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const typeHandleChange = (e) => {
    const { name, value } = e.target;
    setType({ [name]: value });
  };
  const affiliateHandleChange = (e) => {
    const { name, value } = e.target;
    setAffiliate({ [name]: value });
  };
  const customerHandleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ [name]: value });
    targets.filter((item) => {
      if (item.Customer === value) {
        setTargetByCustomer([item.Ringba_Targets_Name]);
      }
    });
  };
  const targetHandleChange = (e) => {
    const { name, value } = e.target;
    setTarget({ [name]: value });
  };
  const monthHandleChange = (e) => {
    const { name, value } = e.target;
    setMonth({ [name]: value });
    broadCastMonths.filter((item) => {
      if (item.broad_cast_month === value) {
        setStartDate({ ...startDate, start_date: item.start_date });
        setEndDate({ ...endDate, end_date: item.end_date });
      }
    });
  };
  const weekHandleChange = (e) => {
    const { name, value } = e.target;
    setWeek({ [name]: value });
    broadCastWeeks.filter((item) => {
      if (item.broad_cast_week === value) {
        setStartDate({ ...startDate, start_date: item.start_date });
        setEndDate({ ...endDate, end_date: item.end_date });
      }
    });
    if (value === "") {
      setStartDate({ ...startDate, start_date: "" });
      setEndDate({ ...endDate, end_date: "" });
    }
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
    ...type,
    ...affiliate,
    ...customer,
    ...target,
    ...month,
    ...week,
    ...startDate,
    ...endDate,
  };
  console.log(values);

  const handleSubmit = () => {
    axios.post(route("target.report.generator"), values).then((r) => {
      console.log(r.data);
      exportToCSV(r.data, "Target_Report");
    });
  };

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData.data, fileName);
    const secondData = apiData.data.length + 5;
    const call_summary = [];
    call_summary.push(["Target wise summary", ""]);
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
  console.log(targets)

  return (
    <>
      <Helmet title="Generate Report Target" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Target
        </Typography>
        <form validate="true" className="generate-report-target">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <RadioGroup
                aria-label="type"
                name="type"
                value={type.type}
                onChange={typeHandleChange}
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
                name="customer_name"
                onChange={customerHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                <option value="">Select Customer</option>
                {targets.map((option) => option.Customer).filter((item,i,arr)=>arr.indexOf(item)===i).map((test,key)=>(
                  <option key={key} value={test}>
                    {test}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="target_name"
                onChange={targetHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                <option value="">Select Target Name</option>
                {targetByCustomer.map((option, indx) => (
                  <option key={indx} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Grid>

            {/* <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="affiliate_id"
                onChange={affiliateHandleChange}
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
            </Grid> */}
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="broad_cast_month"
                onChange={monthHandleChange}
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
                onChange={weekHandleChange}
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

GenerateReportTarget.layout = (page) => (
  <Layout title="Generate Report Target">{page}</Layout>
);
export default GenerateReportTarget;
