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
import { currentDate } from "../../Helpers/CurrentDate";
import MultiSelect from "react-multiple-select-dropdown-lite";
import "react-multiple-select-dropdown-lite/dist/index.css";

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
  }
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const GenerateReportAffiliate = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const { affiliates, broadCastMonths, broadCastWeeks, targets, campaigns } =
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
  const [campaign, setCampaign] = useState("");
  const [annotation, setAnnotation] = useState("");


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
  const customerHandleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ [name]: value });
    targets.filter((item) => {
      if (item.Customer === value) {
        const targetNames = item.Ringba_Targets_Name.split(",");
        setTargetByCustomer(targetNames);
      }
    });
  };
  const targetOptions = targetByCustomer.map((item) => ({
    label: item,
    value: item,
  }));

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.affiliate_id,
  }));

  const targetHandleChange = (val, key) => {
    const targetNames = val.split(",");
    setTarget({ [key]: targetNames });
  };
  const affiliateHandleChange = (val, key) => {
    const affiliate_ids = val.split(",");
    setAffiliate({ [key]: affiliate_ids });
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
  const options = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.affiliate_id,
  }));

  const startDateHandleChange = (e) => {
    const { name, value } = e.target;
    setStartDate({ [name]: value });
  };
  const endDateHandleChange = (e) => {
    const { name, value } = e.target;
    setEndDate({ [name]: value });
  };
  const campaignHandleChange = (e) => {
    const { name, value } = e.target;
    setCampaign({ [name]: value });
  };
  const annotationHandleChange = (e) => {
    const { name, value } = e.target;
    setAnnotation({ [name]: value });
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
    ...campaign,
    ...annotation,
  };

  let affiliatesName = [];
  if (values?.affiliate_id) {
    affiliates.filter(item => {
      let i = 0
      for (i; i < values.affiliate_id.length; i++) {
        if (item.affiliate_id === values.affiliate_id[i]) {
          affiliatesName.push(item.affiliate_name)
        }
      }
    })
  }
  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam)
    let shortMonth = newDate.toLocaleString('en-us', { month: 'short' });
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, "0");
    let yyyy = format_date.getFullYear();
    format_date = dd + "-" + shortMonth + "-" + yyyy;
    return format_date;
  }

  const fileName = `${values.type}_Report_For_(${affiliatesName.toString()})_From_${dateFormat(values.start_date)
    }_To_${dateFormat(values.end_date)}_Created@${currentDate()}`;

  const handleSubmit = () => {
    axios.post(route("affiliate.report.generator"), values).then((r) => {
      if (r.data.status == 500) {
        setOpen(true);
        setResponse(r.data.msg);
      }
      exportToCSV(r.data, fileName);
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
      <Helmet title="Generate Report Affiliate" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Affiliate
        </Typography>
        <form validate="true" className="generate-report-affiliate">
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
                {targets
                  .map((option) => option.Customer)
                  .filter((item, i, arr) => arr.indexOf(item) === i)
                  .map((test, key) => (
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
                name="campaign"
                onChange={campaignHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                <option value="">Select Campaign</option>
                {campaigns.map((campaign, key) => (
                  <option key={key} value={campaign.id}>
                    {campaign.campaign_name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <MultiSelect
                name="target_name"
                onChange={(val) => targetHandleChange(val, "target_name")}
                options={targetOptions}
                style={{ width: "100%" }}
                placeholder="Select Targets"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="annotation"
                onChange={annotationHandleChange}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                <option value="">Select Annotation</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <MultiSelect
                name="affiliate_id"
                onChange={(val) => affiliateHandleChange(val, "affiliate_id")}
                options={affiliateOptions}
                style={{ width: "100%" }}
                placeholder="Select Affiliates"
              />
            </Grid>
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
              // required={true}
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
              // required={true}
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
              // required={true}
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
              // required={true}
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

GenerateReportAffiliate.layout = (page) => (
  <Layout title="Generate Report Affiliate">{page}</Layout>
);
export default GenerateReportAffiliate;
