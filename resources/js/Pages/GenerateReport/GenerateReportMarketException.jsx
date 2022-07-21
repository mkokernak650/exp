import { React, useState } from "react"
import Layout from "../Layout/Layout"
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import { usePage } from "@inertiajs/inertia-react"
import axios from "axios"
import { Helmet } from "react-helmet"
import { currentDate } from "../../Helpers/CurrentDate"
import MultiSelect from "react-multiple-select-dropdown-lite"
import "react-multiple-select-dropdown-lite/dist/index.css"
import { ExportReportWithoutTag } from "../../Helpers/ExportReport"
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


const GenerateReportMarketException = () => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const { affiliates, broadCastMonths, targets, markets, campaigns, customers } =
    usePage().props
  const [customer, setCustomer] = useState()
  const [target, setTarget] = useState("")
  const [targetByCustomer, setTargetByCustomer] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [affiliate, setAffiliate] = useState()
  const [month, setMonth] = useState("")
  const [year, setYear] = useState([])
  const [campaign, setCampaign] = useState("")
  const [annotation, setAnnotation] = useState("")
  const [market, setMarket] = useState()
  const [reportType, setReportType] = useState({ report_type: 'export-report' })
  const [customerEmails, setCustomerEmails] = useState([])


  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const marketHandleChange = (val, key) => {
    if (val) {
      val = val.substring(0, val.length - 1)
      const marketsName = val.split(",,")
      setMarket({ [key]: marketsName })
    } else {
      setMarket([])
    }
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
  const targetOptions = targetByCustomer.map((item) => ({
    label: item,
    value: item,
  }))

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
    value: item.affiliate_id,
  }))

  const annotationOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ]

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ',',
  }))

  const broadCastMonthOptions = monthByYear.map((item) => ({
    label: item.broad_cast_month,
    value: item.broad_cast_month + ',',
  }))

  const targetHandleChange = (val, key) => {
    const targetNames = val.split(",")
    setTarget({ [key]: targetNames })
  }

  const affiliateHandleChange = (val, key) => {
    const affiliate_ids = val.split(",")
    setAffiliate({ [key]: affiliate_ids })
  }


  const monthHandleChange = (val, key) => {
    val = val.substring(0, val.length - 1)
    const monthsName = val.split(",,")
    setMonth({ [key]: monthsName })
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


  const campaignHandleChange = (e) => {
    const { name, value } = e.target
    setCampaign({ [name]: value })
  }

  const annotationHandleChange = (val, key) => {
    const annotationsName = val.split(",")
    setAnnotation({ [key]: annotationsName })
  }

  const values = {
    ...market,
    ...affiliate,
    ...customer,
    ...target,
    ...month,
    ...year,
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


  const fileName = `MarketException_Report${values?.market ? `_For_Markets(${values.market})` : ""}${values?.customer_name ? `_For_Customers(${values.customer_name})` : ""}${values?.annotation ? `_For_Annotations(${values.annotation})` : ""}${values?.campaign ? `_For_Campaigns(${getCampaignNames(values.campaign).toString()})` : ""}${values?.affiliate_id ? `_For_Affiliates(${getAffiliateNames().toString()})` : ""}${values?.target_name ? `_For_Targets(${values.target_name.toString()})` : ""}${year?.year ? `_For_Years(${year.year.toString()})` : ""}${values?.start_date ? `_For_(${values.start_date.toString()}_To_${dateFormat(values?.end_date)})` : ""}_Created@${currentDate()}`
  values.file_name = fileName
  const handleSubmit = () => {
    setLoading(true)
    axios.post(route("market.exception.report.generator"), values).then((r) => {
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
            <Grid item xs={12}>

              <MultiSelect
                name="market"
                onChange={(val) => marketHandleChange(val, "market")}
                options={[
                  { label: "All Markets", value: "allMarkets," },
                ].concat(marketOptions)}
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
                {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : "Generate"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

GenerateReportMarketException.layout = (page) => (
  <Layout title="Generate Report Market Exception">{page}</Layout>
)
export default GenerateReportMarketException


















































