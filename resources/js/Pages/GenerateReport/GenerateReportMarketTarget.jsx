import { React, useState } from "react"
import Layout from "../Layout/Layout"
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import { usePage } from "@inertiajs/inertia-react"
import axios from "axios"
import { Helmet } from "react-helmet"
import { currentDate } from "../../Helpers/CurrentDate"
import { ExportReportWithoutTag } from "../../Helpers/ExportReport"
import MultiSelect from "react-multiple-select-dropdown-lite"
import "react-multiple-select-dropdown-lite/dist/index.css"
import toast from "react-hot-toast"

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


const GenerateReportMarketTarget = () => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const { affiliates, broadCastMonths, broadCastWeeks, markets, states, targets, campaigns, customers } =
    usePage().props
  const [customer, setCustomer] = useState()
  const [target, setTarget] = useState("")
  const [targetByCustomer, setTargetByCustomer] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [affiliate, setAffiliate] = useState()
  const [month, setMonth] = useState("")
  const [year, setYear] = useState([])
  const [week, setWeek] = useState("")
  const [startDate, setStartDate] = useState({ start_date: "" })
  const [endDate, setEndDate] = useState({ end_date: "" })
  const [campaign, setCampaign] = useState("")
  const [annotation, setAnnotation] = useState("")
  const [market, setMarket] = useState()
  const [state, setState] = useState()
  const [selectAllmarkets, setSelectAllmarkets] = useState(false)
  const [selectAllStates, setSelectAllStates] = useState(false)
  const [disableStateCheckbox, setDisableStateCheckbox] = useState(false)
  const [disableMarketCheckbox, setDisableMarketCheckbox] = useState(false)
  const [reportType, setReportType] = useState({ report_type: 'export-report' })
  const [customerEmails, setCustomerEmails] = useState([])



  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const customerHandleChange = (e) => {
    const { name, value } = e.target
    setCustomer({ [name]: value })
    targets.filter((item) => {
      if (item.Customer === value) {
        const targetNames = item.Ringba_Targets_Name.split(",")
        setTargetByCustomer(targetNames)
      }
    })
    if (value === "") {
      setCustomerEmails([])
    }
    const customerData = customers.find(customer => customer.customer_name === value)
    if (customerData !== undefined && customerData.email) {
      const array = [customerData.email]
      setCustomerEmails(array)
    }
  }

  const marketHandleChange = (val, key) => {
    val = val.substring(0, val.length - 1)
    const marketsName = val.split(",,")
    if (val) {
      setMarket({ [key]: marketsName })
      setDisableMarketCheckbox(true)
    } else {
      setMarket('')
      setDisableMarketCheckbox(false)
    }
  }
  const stateHandleChange = (val, key) => {
    val = val.substring(0, val.length - 1)
    const statesName = val.split(",,")
    if (val) {
      setState({ [key]: statesName })
      setDisableStateCheckbox(true)
    }
    else {
      setState('')
      setDisableStateCheckbox(false)

    }

  }

  const targetOptions = targetByCustomer.map((item) => ({
    label: item,
    value: item,
  }))

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ',',
  }))
  const stateOptions = states.map((item) => ({
    label: item.state,
    value: item.state + ',',
  }))

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.affiliate_id,
  }))



  const targetHandleChange = (val, key) => {
    const targetNames = val.split(",")
    setTarget({ [key]: targetNames })
  }

  const affiliateHandleChange = (val, key) => {
    const affiliate_ids = val.split(",")
    setAffiliate({ [key]: affiliate_ids })
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
  }




  const yearOptions = yearsArray.map(year => ({
    label: year,
    value: year
  }))

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
  const campaignHandleChange = (e) => {
    const { name, value } = e.target
    setCampaign({ [name]: value })
  }
  const annotationHandleChange = (e) => {
    const { name, value } = e.target
    setAnnotation({ [name]: value })
  }
  const values = {
    ...affiliate,
    ...market,
    ...state,
    ...customer,
    ...target,
    ...month,
    ...year,
    ...week,
    ...startDate,
    ...endDate,
    ...campaign,
    ...annotation,
    ...reportType,
  }

  const affiliatesEmail = []
  if (values?.affiliate_id) {
    affiliates.filter(item => {
      let i = 0
      for (i; i < values.affiliate_id.length; i++) {
        if (item.affiliate_id === values.affiliate_id[i]) {
          if (item.email) {
            affiliatesEmail.push(item.email)
          }
        }
      }
    })
  }


  const mergeEmail = [...customerEmails, ...affiliatesEmail]
  if (mergeEmail.length) {
    values.emails = mergeEmail
  }

  console.log('values', values)


  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam)
    let shortMonth = newDate.toLocaleString('en-us', { month: 'short' })
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, "0")
    let yyyy = format_date.getFullYear()
    format_date = dd + "-" + shortMonth + "-" + yyyy
    return format_date
  }



  const getCampaignNames = (id) => {
    const campaignNames = []
    if (values?.campaign) {
      const campaign = campaigns.find((campaign) => campaign.id == id)
      campaignNames.push(campaign ? campaign.campaign_name : "")
    }
    return campaignNames
  }
  const getAffiliateNames = () => {
    const affiliateNames = []
    if (values?.affiliate_id) {
      for (let i = 0; i < values.affiliate_id.length; i++) {
        const affiliate = affiliates.find((affiliate) => affiliate.affiliate_id == values.affiliate_id[i])
        affiliateNames.push(affiliate ? affiliate.affiliate_name : "")
      }
    }
    return affiliateNames
  }


  const fileName = `MarketTarget_Report${selectAllmarkets ? `_For_Markets(AllMarkets)` : ""}${(values?.market && !selectAllmarkets) ? `_For_Markets(${values.market})` : ""}${values.customer_name ? `_For_Customers(${values.customer_name})` : ""}${selectAllStates ? `_For_States(AllStates)` : ""}${(values?.state && !selectAllStates) ? `_For_States(${values.state})` : ""}${values?.annotation ? `_For_Annotations(${values.annotation})` : ""}${values?.campaign ? `_For_Campaigns(${getCampaignNames(values.campaign).toString()})` : ""}${values?.affiliate_id ? `_For_Affiliates(${getAffiliateNames().toString()})` : ""}${values?.target_name ? `_For_Targets(${values.target_name.toString()})` : ""}${year?.year ? `_For_Years(${year.year.toString()})` : ""}${values?.start_date ? `_For_(${values.start_date.toString()}_To_${dateFormat(values?.end_date)})` : ""}_Created@${currentDate()}`
  values.file_name = fileName

  const handleSubmit = () => {
    setLoading(true)
    if (market || state) {
      axios.post(route("market.target.report.generator"), values).then((r) => {
        if (r.data.status == 500) {
          setLoading(false)
          toast.error(r.data.msg)

        }
        setLoading(false)
        if (reportType.report_type === "export-report") {
          ExportReportWithoutTag(r.data, fileName)
        } else {
          toast.success("Email send successfully")
        }

      })
        .catch((e) => {
          setLoading(false)
          toast.error("Error while generating report")
        })
    }
    else {
      setLoading(false)
      toast.error("The market or the state must be the one to choose")
    }
  }

  const stateSelectAll = (e) => {
    setSelectAllStates(prevState => !prevState)
    if (e.target.checked) {
      let newData = []
      for (let i = 0; i < states.length; i++) {
        newData.push(states[i].state)
      }
      setState({ 'state': newData })
    } else {
      setState("")
    }
  }
  const marketSelectAll = (e) => {
    setSelectAllmarkets(prevState => !prevState)
    if (e.target.checked) {
      let newData = []
      for (let i = 0; i < markets.length; i++) {
        newData.push(markets[i].market)
      }
      setMarket({ 'market': newData })
    } else {
      setMarket("")
    }
  }



  return (
    <>
      <Helmet title="Generate Report Homes Per Call" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title} >
          Generate Report Homes Per Call
        </Typography>
        <form validate="true" className="generate-report">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <RadioGroup
                aria-label="report-type"
                name="report_type"
                value={reportType.report_type}
                onChange={reportTypeHandleChange}
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
            {!market &&
              <>
                {!disableStateCheckbox &&
                  <FormGroup>
                    <FormControlLabel control={<Checkbox onChange={stateSelectAll} checked={selectAllStates} color="primary" />} label="All States" />
                  </FormGroup>
                }
                {!selectAllStates &&
                  <Grid item xs={12}>
                    <MultiSelect
                      name="state"
                      onChange={(val) => stateHandleChange(val, "state")}
                      options={stateOptions}
                      style={{ width: "100%" }}
                      placeholder="Select State"
                    />
                  </Grid>
                }
              </>
            }
            {!state &&
              <>
                {!disableMarketCheckbox &&
                  <FormGroup>
                    <FormControlLabel control={<Checkbox onChange={marketSelectAll} checked={selectAllmarkets} color="primary" />} label="All Markets" />
                  </FormGroup>
                }
                {!selectAllmarkets &&
                  <Grid item xs={12}>
                    <MultiSelect
                      name="market"
                      onChange={(val) => marketHandleChange(val, "market")}
                      options={marketOptions}
                      style={{ width: "100%" }}
                      placeholder="Select Market"
                    />
                  </Grid>

                }
              </>
            }

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
                  .map((val, key) => (
                    <option key={key} value={val}>
                      {val}
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
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, 'year')}
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
              // required={true}
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
                {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : "Generate"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

    </>
  )
}

GenerateReportMarketTarget.layout = (page) => (
  <Layout title="Generate Report Affiliate">{page}</Layout>
)
export default GenerateReportMarketTarget
