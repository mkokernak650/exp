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
  RadioGroup
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


const GenerateReportDestination = () => {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const { broadCastMonths, broadCastWeeks, targets, campaigns, customers } = usePage().props
  const [customer, setCustomer] = useState()
  const [year, setYear] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [month, setMonth] = useState("")
  const [campaign, setCampaign] = useState("")
  const [reportType, setReportType] = useState({ report_type: 'export-report' })
  const [customerEmails, setCustomerEmails] = useState([])


  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }
  const customerHandleChange = (e) => {
    const { name, value } = e.target
    setCustomer({ [name]: value })
    if (value === "") {
      setCustomerEmails([])
    }
    const customerData = customers.find(customer => customer.customer_name === value)
    if (customerData !== undefined && customerData.email) {
      const array = [customerData.email]
      setCustomerEmails(array)
    }
  }

  const broadCastMonthOptions = monthByYear.map((item) => ({
    label: item.broad_cast_month,
    value: item.broad_cast_month + ',',
  }))

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




  const campaignHandleChange = (e) => {
    const { name, value } = e.target
    setCampaign({ [name]: value })
  }

  const values = {
    ...customer,
    ...campaign,
    ...year,
    ...month,
    ...reportType,
  }

  if (customerEmails.length) {
    values.emails = customerEmails
  }

  let campaignName = []
  if (values.campaign_id) {
    campaignName = campaigns.filter(item => item.id == values.campaign_id)
  }
  const fileName = `Destination_Report${values?.customer_name ? `_For_Customers(${values.customer_name})` : ""}${campaignName.length > 0 ? `_For_Campaigns(${campaignName[0]?.campaign_name})` : ""}${values?.broad_cast_month ? `_For_BroadCastMonths(${values.broad_cast_month.toString()})` : ""}_Created@${currentDate()}`
  values.file_name = fileName




  const handleSubmit = () => {
    setLoading(true)
    axios.post(route("destination.report.generator"), values).then((r) => {
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
      <Helmet title="Destination Report" />
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          Generate Report Destination
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
                {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : "Generate"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

GenerateReportDestination.layout = (page) => (
  <Layout title="Generate Report Destination">{page}</Layout>
)
export default GenerateReportDestination



















































