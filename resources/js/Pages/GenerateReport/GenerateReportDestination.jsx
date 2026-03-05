import { useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col, Select } from 'antd'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { currentDate } from '@/Helpers/CurrentDate'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { ExportReportWithoutTag } from '@/Helpers/ExportReport'
import toast from 'react-hot-toast'

const GenerateReportDestination = () => {
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

  const customerHandleChange = (value) => {
    value = value ?? ''
    setCustomer({ customer_name: value })
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

  const campaignHandleChange = (value) => {
    value = value ?? ''
    setCampaign({ campaign_id: value })
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

  const fileName = `Summary_Report${values?.customer_name ? `_(${values.customer_name})` : ''
    }${campaignName.length > 0 ? `_(${campaignName[0]?.campaign_name})` : ''}${values?.broad_cast_month ? `_(${values.broad_cast_month.toString()})` : ''
    }`
  values.file_name = fileName

  const fileNameForEmailCriteria = `Summary_Report${values?.customer_name ? `_For_Customers(${values.customer_name})` : ''
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
      <Helmet title="Summary Report" />
      <div className="grid w-[500px] mx-auto mt-8 p-10 bg-white shadow rounded">
        <Typography.Title level={5} className="text-center mb-[35px]">
          Generate Report Summary
        </Typography.Title>
        <form validate="true" className="generate-report">
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Radio.Group
                name="report_type"
                value={reportType.report_type}
                onChange={reportTypeHandleChange}
              >
                <Radio value="export-report">Export Report</Radio>
                <Radio value="email-report">Email Report (Customer)</Radio>
              </Radio.Group>
            </Col>
            <Col span={24}>
              <Select
                onChange={campaignHandleChange}
                placeholder="Select Campaign"
                allowClear
                className="w-full"
              >
                {campaigns.map((campaign, key) => (
                  <Select.Option key={key} value={campaign.id}>
                    {campaign.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={24}>
              <Select
                onChange={customerHandleChange}
                placeholder="Select Customer"
                allowClear
                className="w-full"
              >
                {targets
                  .map((option) => option.Customer)
                  .filter((item, i, arr) => arr.indexOf(item) === i)
                  .map((test, key) => (
                    <Select.Option key={key} value={test}>
                      {test}
                    </Select.Option>
                  ))}
              </Select>
            </Col>
            <Col span={24}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val)}
                options={yearOptions}
                className="w-full"
                placeholder="Select Years"
              />
            </Col>
            <Col span={24}>
              <MultiSelect
                name="broad_cast_month"
                onChange={(val) => monthHandleChange(val)}
                options={optionsGenerate(monthByYear, 'broad_cast_month')}
                className="w-full"
                placeholder="Select Broadcast Month"
              />
            </Col>{' '}
            <Col span={24}>
              <MultiSelect
                name="broad_cast_week"
                onChange={(val) => weekHandleChange(val)}
                options={optionsGenerate(weekByMonth, 'broad_cast_week')}
                className="w-full"
                placeholder="Select Broadcast Week"
              />
            </Col>
            <Col span={24}>
              <Button type="primary" onClick={(e) => handleSubmit()} loading={loading}>
                Generate
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  )
}

GenerateReportDestination.layout = (page) => (
  <Layout title="Generate Report Summary">{page}</Layout>
)
export default GenerateReportDestination
