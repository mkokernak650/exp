import { React, useState } from 'react'
import Layout from '../Layout/Layout'
import {
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  FormControlLabel,
  RadioGroup,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { currentDate } from '@/Helpers/CurrentDate'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { ExportReportWithoutTag } from '@/Helpers/ExportReport'
import toast from 'react-hot-toast'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '500px',
    margin: 'auto',
    marginTop: '2rem',
    padding: '40px',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  title: {
    textAlign: 'center',
    marginBottom: '35px',
  },
}))

const GenerateReportDestination = () => {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const { broadCastMonths, broadCastWeeks, targets, campaigns, customers } = usePage().props
  const [customer, setCustomer] = useState()
  const [year, setYear] = useState([])
  const [month, setMonth] = useState([])
  const [week, setWeek] = useState([])
  const [campaign, setCampaign] = useState('')
  const [reportType, setReportType] = useState({ report_type: 'export-report' })
  const [customerEmails, setCustomerEmails] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [weekByMonth, setWeekByMonth] = useState(broadCastWeeks)

  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const customerHandleChange = (e) => {
    const { name, value } = e.target
    setCustomer({ [name]: value })
    if (value === '') {
      setCustomerEmails([])
    }
    const customerData = customers.find((customer) => customer.customer_name === value)
    if (customerData !== undefined && customerData.email) {
      const array = [customerData.email]
      setCustomerEmails(array)
    }
  }

  const optionsGenerate = (data, type) => {
    return data.map((item) => ({
      label: item[type],
      value: item[type],
    }))
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

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: year,
  }))

  const yearHandleChange = (val) => {
    let years = []
    const monthArray = []

    if (val.includes(',')) {
      years = val.split(',')
      setYear({ ['year']: years })
    } else {
      if (val !== '') {
        years.push(val)
        setYear({ ['year']: [val] })
      } else {
        setYear([])
      }
    }

    if (val !== '') {
      for (let i = 0; i < years.length; i++) {
        broadCastMonths.forEach((month) => {
          if (new Date(month.start_date).getFullYear().toString() === years[i]) {
            monthArray.push({ broad_cast_month: month.broad_cast_month })
          }
        })
      }
      setMonthByYear(monthArray)
    } else {
      setMonthByYear(broadCastMonths)
    }
  }

  const monthHandleChange = (val) => {
    let months = []
    if (val.includes(',')) {
      months = val.split(',')
      setMonth({ ['broad_cast_month']: months })
    } else {
      if (val !== '') {
        months.push(val)
        setMonth({ ['broad_cast_month']: [val] })
      } else {
        setMonth([])
      }
    }
    // if (val !== '') {
    //   const weekArray = []
    //   for (let i = 0; i < months.length; i++) {
    //     const weekStartDate = findWeekStartDateBySelectedMonth(months[i])
    //     broadCastWeeks.forEach((week) => {
    //       if (
    //         new Date(week.start_date).getFullYear().toString() ===
    //         new Date(weekStartDate).getFullYear().toString()
    //       ) {
    //         const startDateMonthName = new Date(week.start_date).toLocaleString('default', {
    //           month: 'short',
    //         })
    //         const endDateMonthName = new Date(week.end_date).toLocaleString('default', {
    //           month: 'short',
    //         })

    //         if (
    //           months[i].indexOf(startDateMonthName)>0||
    //           months[i].indexOf(endDateMonthName)>0
    //         ) {
    //           weekArray.push({ broad_cast_week: week.broad_cast_week })
    //         }
    //       }
    //     })
    //   }
    //   setWeekByMonth(weekArray)
    // } else {
    //   setWeekByMonth(broadCastWeeks)
    // }
  }

  const findWeekStartDateBySelectedMonth = (param) => {
    for (let i = 0; i < broadCastMonths.length; i++) {
      if (broadCastMonths[i].broad_cast_month === param) {
        return broadCastMonths[i].start_date
      }
    }
  }

  const weekHandleChange = (val) => {
    if (val.includes(',')) {
      const name = val.split(',')
      setWeek({ ['broad_cast_week']: name })
    } else {
      if (val !== '') {
        setWeek({ ['broad_cast_week']: [val] })
      } else {
        setWeek([])
      }
    }
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
    ...week,
    ...reportType,
  }

  if (customerEmails.length) {
    values.emails = customerEmails
  }

  let campaignName = []
  if (values.campaign_id) {
    campaignName = campaigns.filter((item) => item.id == values.campaign_id)
  }

  const fileName = `Destination_Report${values?.customer_name ? `_(${values.customer_name})` : ''
    }${campaignName.length > 0 ? `_(${campaignName[0]?.campaign_name})` : ''}${values?.broad_cast_month ? `_(${values.broad_cast_month.toString()})` : ''
    }`
  values.file_name = fileName

  const fileNameForEmailCriteria = `Destination_Report${values?.customer_name ? `_For_Customers(${values.customer_name})` : ''
    }${campaignName.length > 0 ? `_For_Campaigns(${campaignName[0]?.campaign_name})` : ''}${values?.broad_cast_month ? `_For_BroadCastMonths(${values.broad_cast_month.toString()})` : ''
    }_Created@${currentDate()}`
  values.fileNameForEmailCriteria = fileNameForEmailCriteria

  const handleSubmit = () => {
    setLoading(true)
    axios
      .post(route('destination.report.generator'), values)
      .then((res) => {
        setLoading(false)
        if (res?.status == 204) {
          toast.error('No data found for the selected criteria')
        }
        if (res?.status == 200) {
          if (reportType.report_type === 'export-report') {
            ExportReportWithoutTag(res?.data, fileName)
          } else {
            toast.success('Email send successfully')
          }
        }
      })
      .catch((e) => {
        console.log(e)
        setLoading(false)
        if (e.response?.status === 422) {
          toast.error(e.response?.data?.message)
          return
        }
        toast.error('Error while generating report')
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
                name="year"
                onChange={(val) => yearHandleChange(val)}
                options={yearOptions}
                style={{ width: '100%' }}
                placeholder="Select Years"
              />
            </Grid>
            <Grid item xs={12}>
              <MultiSelect
                name="broad_cast_month"
                onChange={(val) => monthHandleChange(val)}
                options={optionsGenerate(monthByYear, 'broad_cast_month')}
                style={{ width: '100%' }}
                placeholder="Select Broadcast Month"
              />
            </Grid>{' '}
            <Grid item xs={12}>
              <MultiSelect
                name="broad_cast_week"
                onChange={(val) => weekHandleChange(val)}
                options={optionsGenerate(weekByMonth, 'broad_cast_week')}
                style={{ width: '100%' }}
                placeholder="Select Broadcast Week"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={(e) => handleSubmit()}>
                {loading ? (
                  <CircularProgress color="inherit" thickness={3} size="1.5rem" />
                ) : (
                  'Generate'
                )}
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
