import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar
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
const GenerateReportMarketException = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const { broadCastMonths, broadCastWeeks, targets, campaigns } = usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [customer, setCustomer] = useState();
  const [year, setYear] = useState([]);
  const [monthByYear, setMonthByYear] = useState(broadCastMonths);
  const [month, setMonth] = useState("");
  const [campaign, setCampaign] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const customerHandleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ [name]: value });
  };

  const broadCastMonthOptions = monthByYear.map((item) => ({
    label: item.broad_cast_month,
    value: item.broad_cast_month + ',',
  }));

  const monthHandleChange = (val, key) => {
    val = val.substring(0, val.length - 1);
    const monthsName = val.split(",,");
    setMonth({ [key]: monthsName });
  };

  let yearsArray = []
  for (let i = 0; i < 5; i++) {
    let years = new Date().getFullYear()
    let months = new Date().getMonth()
    let day = new Date().getDate()
    let date = new Date(years + i, months, day).getFullYear()
    if (!yearsArray.includes(new Date(years - 1, months, day).getFullYear())) {
      yearsArray.push(new Date(years - 1, months, day).getFullYear())
    }
    yearsArray.push(date)
  }

  const yearHandleChange = (val, key) => {
    const years = val.split(",")
    setYear({ [key]: years })
    for (let i = 0; i < years.length; i++) {
      const filteredData = broadCastMonths.filter(item => {
        if (new Date(item.start_date).getFullYear().toString() === years[i]) {
          return item
        }
      })
      setMonthByYear(filteredData)
    }
  };

  const yearOptions = yearsArray.map(year => ({
    label: year,
    value: year
  }))


  const campaignHandleChange = (e) => {
    const { name, value } = e.target;
    setCampaign({ [name]: value });
  };

  const values = {
    ...customer,
    ...campaign,
    ...year,
    ...month,
  };
  let campaignName = []
  if (values.campaign_id) {
    campaignName = campaigns.filter(item => item.id == values.campaign_id)
  }
  const fileName = `Destination_Report${values.customer_name ? `_For_(${values.customer_name})` : ""}${campaignName.length > 0 ? `_For_(${campaignName[0].campaign_name})` : ""}${values.broad_cast_month ? `_For_(${values.broad_cast_month.toString()})` : ""}_Created@${currentDate()}`;


  const handleSubmit = () => {
    axios.post(route("destination.report.generator"), values).then((r) => {
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
    const secondData = apiData.data.length + 4;
    const call_summary = [];

    Object.keys(apiData.call_summary).forEach((cf) => {
      call_summary.push([cf, apiData.call_summary[cf]]);
    });

    XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` });
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
    setOpen(true);
    setResponse("Report Generated Successfully");
  };

  return (
    <>
      <Helmet title="Destination Report" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Destination
        </Typography>
        <form validate="true" className="generate-report">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id="standard-select-currency-native"
                select
                name="campaign_id"
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
              <MultiSelect
                name="broad_cast_month"
                onChange={(val) => monthHandleChange(val, "broad_cast_month")}
                options={broadCastMonthOptions}
                style={{ width: "100%" }}
                placeholder="Select Broadcast Month"
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
  <Layout title="Generate Report Destination">{page}</Layout>
);
export default GenerateReportMarketException;



















































