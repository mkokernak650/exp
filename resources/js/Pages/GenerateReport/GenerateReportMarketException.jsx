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
  const { affiliates, broadCastMonths, targets, markets, campaigns } =
    usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [customer, setCustomer] = useState();
  const [target, setTarget] = useState("");
  const [targetByCustomer, setTargetByCustomer] = useState([]);
  const [monthByYear, setMonthByYear] = useState(broadCastMonths);
  const [affiliate, setAffiliate] = useState();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState([]);
  const [campaign, setCampaign] = useState("");
  const [annotation, setAnnotation] = useState("");
  const [market, setMarket] = useState();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const marketHandleChange = (val, key) => {
    val = val.substring(0, val.length - 1);
    const marketsName = val.split(",,");
    setMarket({ [key]: marketsName });
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

  const annotationOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ]

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ',',
  }));

  const broadCastMonthOptions = monthByYear.map((item) => ({
    label: item.broad_cast_month,
    value: item.broad_cast_month + ',',
  }));

  const targetHandleChange = (val, key) => {
    const targetNames = val.split(",");
    setTarget({ [key]: targetNames });
  };

  const affiliateHandleChange = (val, key) => {
    const affiliate_ids = val.split(",");
    setAffiliate({ [key]: affiliate_ids });
  };


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

  const annotationHandleChange = (val, key) => {
    const annotationsName = val.split(",");
    setAnnotation({ [key]: annotationsName });
  };

  const values = {
    ...market,
    ...affiliate,
    ...customer,
    ...target,
    ...month,
    ...year,
    ...campaign,
    ...annotation,
  };


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
    Object.keys(apiData.tag_count).forEach((cat) => {
      category.push(Object.values(apiData.tag_count[cat]));
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
      <Helmet title="Market Exception" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Market Exception
        </Typography>
        <form validate="true" className="generate-report">
          <Grid container spacing={4}>
            <Grid item xs={12}>

              <MultiSelect
                name="market"
                onChange={(val) => marketHandleChange(val, "market")}
                options={marketOptions}
                style={{ width: "100%" }}
                placeholder="Select Market"
              />
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

              <MultiSelect
                name="annotation"
                onChange={(val) => annotationHandleChange(val, "annotation")}
                options={annotationOptions}
                style={{ width: "100%" }}
                placeholder="Select Annotation"
              />
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
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, 'year')}
                options={yearOptions}
                style={{ width: "100%" }}
                placeholder="Select Years"
              />
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
                {loading ? <CircularProgress color="inherit" thickness="3" size="1.5rem" /> : "Generate"}
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


















































