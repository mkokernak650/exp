import { React, useState } from "react"
import Layout from "../Layout/Layout"
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  Checkbox,
  Divider,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import { usePage } from "@inertiajs/inertia-react"
import axios from "axios"
import { Helmet } from "react-helmet"
import { currentDate } from "../../Helpers/CurrentDate"
import MultiSelect from "react-multiple-select-dropdown-lite"
import "react-multiple-select-dropdown-lite/dist/index.css"
import toast from "react-hot-toast"
import { exportReportEcommerce } from "../../Helpers/ExportReport"

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
  }
}))

const EcommerceReport = () => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const {
    campaigns,
    customers,
    affiliates,
    broadCastMonths,
    broadCastWeeks,
    couponCodes,
    dialedPhones,
    states,
    markets,
  } = usePage().props
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [affiliate, setAffiliate] = useState()
  const [month, setMonth] = useState("")
  const [year, setYear] = useState([])
  const [week, setWeek] = useState("")
  const [startDate, setStartDate] = useState({ start_date: "" })
  const [endDate, setEndDate] = useState({ end_date: "" })
  const [couponCode, setCouponCode] = useState([])
  const [dialed, setDialed] = useState([])
  const [state, setState] = useState([])
  const [market, setMarket] = useState([])
  const [campaign, setCampaign] = useState([])
  const [orderType, setOrderType] = useState({ orderType: "both" })
  const [customer, setCustomer] = useState([])
  const [reportType, setReportType] = useState({ type: "customer" })
  const [reportFor, setReportFor] = useState({ reportFor: "sales" })
  const [isDetailed, setIsDetailed] = useState({ detailed: true })
  const [ecommerceReportType, setEcommerceReportType] = useState({ report_type: 'export-report' })

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

  const campaignOptions = campaigns.map((item) => ({
    label: item.campaign_name,
    value: item.id,
  }))

  const customerOptions = customers.map((item) => ({
    label: item.customer_name,
    value: item.id,
  }))

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.id,
  }))

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: year,
  }))

  const stateOptions = states.map((item) => ({
    label: item.state,
    value: item.state + ",",
  }))

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ",",
  }))

  const couponCodeOptions = Object.values(couponCodes).map((item) => ({
    label: item,
    value: item,
  }))

  const dialedOptions = Object.values(dialedPhones).map((item) => ({
    label: item,
    value: item,
  }))

  const getCampaignNames = () => {
    const campaignNames = []
    if (values?.campaign_id.length) {
      for (let i = 0; i < values.campaign_id.length; i++) {
        const campaign = campaigns.find(
          (campaign) => campaign.id == values.campaign_id[i]
        )
        campaignNames.push(campaign ? campaign.campaign_name : "")
      }
    }
    return campaignNames
  }
  const getAffiliateNames = () => {
    const affiliateNames = []
    if (values?.affiliate_id.length) {
      for (let i = 0; i < values.affiliate_id.length; i++) {
        const affiliate = affiliates.find(
          (affiliate) => affiliate.id == values.affiliate_id[i]
        )
        affiliateNames.push(affiliate ? affiliate.affiliate_name : "")
      }
    }
    return affiliateNames
  }
  const getCustomerNames = () => {
    const customerNames = []
    if (values?.customer_id.length) {
      for (let i = 0; i < values.customer_id.length; i++) {
        const customer = customers.find(
          (customer) => customer.id == values.customer_id[i]
        )
        customerNames.push(customer ? customer.customer_name : "")
      }
    }
    return customerNames
  }
  const ecommerceReportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setEcommerceReportType({ [name]: value })
  }
  const campaignHandleChange = (val, key) => {
    if (val) {
      const campaign_ids = val.split(",")
      setCampaign({ [key]: campaign_ids })
    } else {
      setCampaign()
    }
  }

  const customerHandleChange = (val, key) => {
    if (val) {
      const customer_ids = val.split(",")
      setCustomer({ [key]: customer_ids })
    } else {
      setCustomer()
    }
  }

  const affiliateHandleChange = (val, key) => {
    if (val) {
      const affiliate_ids = val.split(",")
      setAffiliate({ [key]: affiliate_ids })
    } else {
      setAffiliate()
    }
  }

  const monthHandleChange = (e) => {
    const { name, value } = e.target
    setMonth({ [name]: value })
    broadCastMonths.filter((item) => {
      if (item.broad_cast_month === value) {
        setStartDate({ ...startDate, start_date: item.start_date })
        setEndDate({ ...endDate, end_date: item.end_date })
      }
    })
  }

  const yearHandleChange = (val, key) => {
    if (val) {
      const years = val.split(",")
      setYear({ [key]: years })
    } else {
      delete setYear()
    }
  }

  const stateHandleChange = (val, key) => {
    if (val) {
      val = val.substring(0, val.length - 1)
      const statesValue = val.split(",,")
      setState({ [key]: statesValue })
    } else {
      setState([])
    }
  }

  const marketHandleChange = (val, key) => {
    if (val) {
      val = val.substring(0, val.length - 1)
      const marketsValue = val.split(",,")
      setMarket({ [key]: marketsValue })
    } else {
      setMarket([])
    }
  }

  const couponCodeHandleChange = (val, key) => {
    if (val) {
      const couponCodesValue = val.split(",")
      setCouponCode({ [key]: couponCodesValue })
    } else {
      setCouponCode([])
    }
  }

  const dialedHandleChange = (val, key) => {
    if (val) {
      const dialedValue = val.split(",")
      setDialed({ [key]: dialedValue })
    } else {
      setDialed([])
    }
  }

  const weekHandleChange = (e) => {
    const { name, value } = e.target
    setWeek({ [name]: value })
    broadCastWeeks.filter((item) => {
      if (item.broad_cast_week === value) {
        setStartDate({ ...startDate, start_date: item.start_date })
        setEndDate({ ...endDate, end_date: item.end_date })
      }
    })
    if (value === "") {
      setStartDate({ ...startDate, start_date: "" })
      setEndDate({ ...endDate, end_date: "" })
    }
  }

  const startDateHandleChange = (e) => {
    const { name, value } = e.target
    setStartDate({ [name]: value })
  }

  const endDateHandleChange = (e) => {
    const { name, value } = e.target
    setEndDate({ [name]: value })
  }

  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const reportForHandleChange = (e) => {
    const { name, value } = e.target
    setReportFor({ [name]: value })
  }

  const detailedHandleChange = (e) => {
    const { name, checked } = e.target
    setIsDetailed({ [name]: checked })
  }

  const orderTypeHandleChange = (val) => {
    setOrderType({ orderType: val })

    if (val == 1) {
      setDialed([])
    } else if (val == 2) {
      setCouponCode([])
    }
  }

  const values = {
    ...orderType,
    ...campaign,
    ...customer,
    ...state,
    ...market,
    ...affiliate,
    ...couponCode,
    ...dialed,
    ...year,
    ...month,
    ...week,
    ...startDate,
    ...endDate,
    ...reportType,
    ...reportFor,
    ...isDetailed,
    ...reportType,
    ...ecommerceReportType
  }

  let affiliatesEmail = []
  if (values?.affiliate_id) {
    affiliates.filter((item) => {
      let i = 0
      for (i; i < values.affiliate_id.length; i++) {
        if (item.id == values.affiliate_id[i]) {
          if (item.email) {
            affiliatesEmail.push(item.email)
          }
        }
      }
    })
  }
  let customerEmails = []
  if (values?.customer_id) {
    customers.filter((item) => {
      let i = 0
      for (i; i < values.customer_id.length; i++) {
        if (item.id == values.customer_id[i]) {
          if (item.email) {
            customerEmails.push(item.email)
          }
        }
      }
    })
  }
  const mergeEmail = [...customerEmails, ...affiliatesEmail]
  if (mergeEmail.length) {
    values.emails = mergeEmail
  }


  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam)
    let shortMonth = newDate.toLocaleString("en-us", { month: "short" })
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, "0")
    let yyyy = format_date.getFullYear()
    format_date = dd + "-" + shortMonth + "-" + yyyy
    return format_date
  }
  console.log('values', values)

  const fileName = `E-Commerce_${reportFor.reportFor === "sales" ? "Sales" : "Market_Target"
    }_Report${values.customer_id ? `_For_Customers(${getCustomerNames().toString()})` : ""
    }${values?.states ? `_For_States(${values.states.toString()})` : ""}${values?.markets ? `_For_Markets(${values.markets.toString()})` : ""
    }${values?.campaign_id
      ? `_For_Campaigns(${getCampaignNames().toString()})`
      : ""
    }${values?.affiliate_id
      ? `_For_Affiliates(${getAffiliateNames().toString()})`
      : ""
    }${year?.year ? `_For_Years(${year.year.toString()})` : ""}${values?.start_date
      ? `_For_(${values.start_date.toString()}_To_${dateFormat(
        values?.end_date
      )})`
      : ""
    }_Created@${currentDate()}`
  values.file_name = fileName

  const handleSubmit = () => {
    if (orderType.orderType === "") {
      toast.error("Please select order type")
      return
    }
    if (
      reportFor.reportFor === "marketTarget" &&
      state.length < 1 &&
      market.length < 1
    ) {
      toast.error("Please select state or market")
      return
    }
    setLoading(true)
    axios
      .post(route("ecommerce.report.generate"), values)
      .then((r) => {
        setLoading(false)
        if (r?.status === 204) {
          setLoading(false)
          toast.error("No data found for the selected criteria")
        } else {
          setLoading(false)
          if (ecommerceReportType.report_type === "export-report") {
            exportReportEcommerce(r.data, fileName, reportFor)
          } else {
            toast.success("Email send successfully")
          }
        }

      })
      .catch((e) => {
        setLoading(false)
        toast.error("Error while generating report")
      })
  }



  return (
    <>
      <Helmet title="E-Commerce - Phone Report" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          E-Commerce - Phone Report
        </Typography>
        <form validate="true" className="generate-report">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <h4 style={{ margin: 0 }}>Report For</h4>
              <RadioGroup
                aria-label="reportFor"
                name="reportFor"
                value={reportFor.reportFor}
                onChange={reportForHandleChange}
              >
                <FormControlLabel
                  value="sales"
                  control={<Radio color="primary" />}
                  label="Sales"
                />
                <FormControlLabel
                  value="marketTarget"
                  control={<Radio color="primary" />}
                  label="Market Target"
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12}>
              <RadioGroup
                aria-label="report-type"
                name="report_type"
                value={ecommerceReportType.report_type}
                onChange={ecommerceReportTypeHandleChange}
              >
                <FormControlLabel
                  value="export-report"
                  control={<Radio color="primary" />}
                  label="Export Report"
                />
                <FormControlLabel
                  value="email-report"
                  control={<Radio color="primary" />}
                  label="Email Report"
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Divider />
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 5 }}>
              <MultiSelect
                singleSelect
                name="order_type"
                defaultValue={orderType.orderType}
                onChange={(val) => orderTypeHandleChange(val)}
                options={[
                  { label: "E-commerce & Phone", value: "both" },
                  { label: "E-commerce", value: "1" },
                  { label: "Phone", value: "2" },
                ]}
                style={{ width: "100%" }}
                placeholder="Select Order Type"
              />
            </Grid>
            {market.length < 1 && (
              <Grid item xs={12} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="states"
                  onChange={(val) => stateHandleChange(val, "states")}
                  options={[
                    { label: "All States", value: "allStates," },
                  ].concat(stateOptions)}
                  style={{ width: "100%" }}
                  placeholder="Select States"
                />
              </Grid>
            )}
            {state.length < 1 && (
              <Grid item xs={12} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="markets"
                  onChange={(val) => marketHandleChange(val, "markets")}
                  options={[
                    { label: "All Markets", value: "allMarkets," },
                  ].concat(marketOptions)}
                  style={{ width: "100%" }}
                  placeholder="Select Markets"
                />
              </Grid>
            )}
            <Grid item xs={12} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="campaign_id"
                onChange={(val) => campaignHandleChange(val, "campaign_id")}
                options={campaignOptions}
                style={{ width: "100%" }}
                placeholder="Select Campaign"
              />
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="customer_id"
                onChange={(val) => customerHandleChange(val, "customer_id")}
                options={customerOptions}
                style={{ width: "100%" }}
                placeholder="Select Customer"
              />
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="affiliate_id"
                onChange={(val) => affiliateHandleChange(val, "affiliate_id")}
                options={affiliateOptions}
                style={{ width: "100%" }}
                placeholder="Select Affiliates"
              />
            </Grid>
            {(orderType.orderType === "both" || orderType.orderType == 1) && (
              <Grid item xs={12} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="couponCodes"
                  onChange={(val) => couponCodeHandleChange(val, "couponCodes")}
                  options={couponCodeOptions}
                  style={{ width: "100%" }}
                  placeholder="Select Coupon Codes"
                />
              </Grid>
            )}
            {(orderType.orderType === "both" || orderType.orderType == 2) && (
              <Grid item xs={12} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="dialed"
                  onChange={(val) => dialedHandleChange(val, "dialed")}
                  options={dialedOptions}
                  style={{ width: "100%" }}
                  placeholder="Select Dialed Phone"
                />
              </Grid>
            )}

            <Grid item xs={12} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, "year")}
                options={yearOptions}
                style={{ width: "100%" }}
                placeholder="Select Years"
              />
            </Grid>
            {((Array.isArray(year) && year.length < 1) || !year) && (
              <>
                <Grid item xs={12}>
                  <TextField
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
              </>
            )}

            {reportFor.reportFor === "sales" && (
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <RadioGroup
                    aria-label="type"
                    name="type"
                    value={reportType.type}
                    onChange={reportTypeHandleChange}
                  >
                    <FormControlLabel
                      value="customer"
                      control={<Radio color="primary" />}
                      label="For Customer"
                    />
                    <FormControlLabel
                      value="affiliate"
                      control={<Radio color="primary" />}
                      label="For Affiliate"
                    />
                  </RadioGroup>
                </Grid>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="detailed"
                        onChange={detailedHandleChange}
                        checked={isDetailed.detailed}
                        color="primary"
                      />
                    }
                    label="Detailed Report"
                  />
                </FormGroup>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => handleSubmit()}
                disabled={loading}
              >
                Generate &nbsp;
                {loading && (
                  <CircularProgress
                    color="inherit"
                    thickness={3}
                    size="1.5rem"
                  />
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

EcommerceReport.layout = (page) => (
  <Layout title="E-commerce Report">{page}</Layout>
)
export default EcommerceReport
