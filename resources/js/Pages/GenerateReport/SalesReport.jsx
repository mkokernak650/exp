import { React, useState } from "react";
import Layout from "../Layout/Layout";
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
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
import SnackBar from "../../Shared/SnackBar";

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

const SalesReport = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { affiliates, broadCastMonths, broadCastWeeks } = usePage().props;
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState();
  const [monthByYear, setMonthByYear] = useState(broadCastMonths);
  const [affiliate, setAffiliate] = useState();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState([]);
  const [week, setWeek] = useState("");
  const [startDate, setStartDate] = useState({ start_date: "" });
  const [endDate, setEndDate] = useState({ end_date: "" });
  const [couponCode, setCouponCode] = useState("");

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.id,
  }));

  const affiliateHandleChange = (val, key) => {
    if (val) {
      const affiliate_ids = val.split(",");
      setAffiliate({ [key]: affiliate_ids });
    } else {
      setAffiliate();
    }
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

  let yearsArray = [];
  for (let i = 0; i < 5; i++) {
    let years = new Date().getFullYear();
    let months = new Date().getMonth();
    let day = new Date().getDate();
    let date = new Date(years + i, months, day).getFullYear();
    if (!yearsArray.includes(new Date(years - 1, months, day).getFullYear())) {
      yearsArray.push(new Date(years - 1, months, day).getFullYear());
    }
    yearsArray.push(date);
  }

  const yearHandleChange = (val, key) => {
    if (val) {
      const years = val.split(",");
      setYear({ [key]: years });
      for (let i = 0; i < years.length; i++) {
        const filteredData = broadCastMonths.filter((item) => {
          if (new Date(item.start_date).getFullYear().toString() === years[i]) {
            return item;
          }
        });
        setMonthByYear(filteredData);
      }
    } else {
      delete setYear();
    }
  };

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: year,
  }));

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

  const couponCodeHandleChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setCouponCode();
    } else {
      setCouponCode({ [name]: value });
    }
  };

  const values = {
    ...affiliate,
    ...couponCode,
    ...year,
    ...month,
    ...week,
    ...startDate,
    ...endDate,
  };

  let affiliatesName = [];
  if (values?.affiliate_id) {
    affiliates.filter((item) => {
      let i = 0;
      for (i; i < values.affiliate_id.length; i++) {
        if (item.affiliate_id === values.affiliate_id[i]) {
          affiliatesName.push(item.affiliate_name);
        }
      }
    });
  }

  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam);
    let shortMonth = newDate.toLocaleString("en-us", { month: "short" });
    let format_date = newDate;
    let dd = String(format_date.getDate()).padStart(2, "0");
    let yyyy = format_date.getFullYear();
    format_date = dd + "-" + shortMonth + "-" + yyyy;
    return format_date;
  };

  let fileName = "";
  if (year?.year && !month) {
    fileName = `${values?.type}_Report${
      affiliatesName.length > 0 ? `_For_(${affiliatesName.toString()})` : ""
    }_For_(${year.year.toString()})_Created@${currentDate()}`;
  } else if (year?.year && month) {
    fileName = `${values?.type}_Report${
      affiliatesName.length > 0 ? `_For_(${affiliatesName.toString()})` : ""
    }_For_(${year.year.toString()})_From_${dateFormat(
      values?.start_date
    )}_To_${dateFormat(values?.end_date)}_Created@${currentDate()}`;
  } else {
    fileName = `${values?.type}_Report${
      affiliatesName.length > 0 ? `_For_(${affiliatesName.toString()})` : ""
    }_From_${dateFormat(values?.start_date)}_To_${dateFormat(
      values?.end_date
    )}_Created@${currentDate()}`;
  }

  const handleSubmit = () => {
    axios.post(route("ecommerce.sales.report.generate"), values).then((r) => {
      if (r.data.status == 500) {
        setOpen(true);
        setResponse(r.data.msg);
      }
      // console.log(r.data);
      exportToCSV(r.data, fileName);
    });
  };

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(apiData.data, fileName);
    // ws['A2'].v = "https://docs.sheetjs.com/#hyperlinks";
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
      <Helmet title="E-commerce Sales Report" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          E-commerce Sales Report
        </Typography>
        <form validate="true" className="generate-report">
          <Grid container spacing={4}>
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
                id="coupon_code"
                name="coupon_code"
                type="text"
                onChange={couponCodeHandleChange}
                fullWidth
                placeholder="Coupon Code"
              />
            </Grid>
            <Grid item xs={12}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, "year")}
                options={yearOptions}
                style={{ width: "100%" }}
                placeholder="Select Years"
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
              >
                <option value="">Select Broadcast Month</option>
                {monthByYear.map((option, indx) => (
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
      <SnackBar open={open} setOpen={setOpen} response={response} />
    </>
  );
};

SalesReport.layout = (page) => (
  <Layout title="E-commerce Sales Report">{page}</Layout>
);
export default SalesReport;
