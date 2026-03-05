import { useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { currentDate } from '@/Helpers/CurrentDate'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { ExportReportWithTag } from '@/Helpers/ExportReport'
import toast from 'react-hot-toast'

const GenerateReportTarget = () => {
  const [loading, setLoading] = useState(false)
  const { affiliates, broadCastMonths, broadCastWeeks, targets, campaigns, customers } =
    usePage().props
  const [type, setType] = useState({ type: 'billed' })
  const [customer, setCustomer] = useState()
  const [target, setTarget] = useState('')
  const [targetByCustomer, setTargetByCustomer] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [affiliate, setAffiliate] = useState()
  const [month, setMonth] = useState('')
  const [year, setYear] = useState([])
  const [week, setWeek] = useState('')
  const [startDate, setStartDate] = useState({ start_date: '' })
  const [endDate, setEndDate] = useState({ end_date: '' })
  const [campaign, setCampaign] = useState('')
  const [annotation, setAnnotation] = useState('')
  const [reportType, setReportType] = useState({ report_type: 'export-report' })
  const [customerEmails, setCustomerEmails] = useState([])

  const typeHandleChange = (e) => {
    const { name, value } = e.target
    setType({ [name]: value })
  }

  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const customerHandleChange = (value) => {
    value = value ?? ''
    setCustomer({ customer_name: value })
    if (value === '') {
      setTargetByCustomer([])
      setCustomer([])
    }
    targets.filter((item) => {
      if (item.Customer === value) {
        if (item.Ringba_Targets_Name !== null) {
          const targetNames = item.Ringba_Targets_Name.split(',')
          setTargetByCustomer(targetNames)
        }
      }
    })
    if (value === '') {
      setCustomerEmails([])
    }
    const customerData = customers.find((customer) => customer.customer_name === value)
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

  const targetHandleChange = (val) => {
    let targetNames = []
    if (val.includes(',')) {
      targetNames = val.split(',')
      setTarget({ ['target_name']: targetNames })
    } else {
      if (val !== '') {
        targetNames.push(val)
        setTarget({ ['target_name']: [val] })
      } else {
        setTarget([])
      }
    }
  }

  const affiliateHandleChange = (val, key) => {
    let affiliate_ids = []
    if (val.includes(',')) {
      affiliate_ids = val.split(',')
      setAffiliate({ ['affiliate_id']: affiliate_ids })
    } else {
      if (val !== '') {
        affiliate_ids.push(val)
        setAffiliate({ ['affiliate_id']: [val] })
      } else {
        setAffiliate([])
      }
    }
  }

  const monthHandleChange = (value) => {
    value = value ?? ''
    setMonth({ broad_cast_month: value })
    broadCastMonths.filter((item) => {
      if (item.broad_cast_month === value) {
        setStartDate({ ...startDate, start_date: item.start_date })
        setEndDate({ ...endDate, end_date: item.end_date })
      }
    })
    if (value === '') {
      setMonth([])
      setStartDate({ ...startDate, start_date: '' })
      setEndDate({ ...endDate, end_date: '' })
    }
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
    let years = []
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
    for (let i = 0; i < years.length; i++) {
      const filteredData = broadCastMonths.filter((item) => {
        if (new Date(item.start_date).getFullYear().toString() === years[i]) {
          return item
        }
      })
      setMonthByYear(filteredData)
    }
  }

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: year,
  }))

  const weekHandleChange = (value) => {
    value = value ?? ''
    setWeek({ broad_cast_week: value })
    broadCastWeeks.filter((item) => {
      if (item.broad_cast_week === value) {
        setStartDate({ ...startDate, start_date: item.start_date })
        setEndDate({ ...endDate, end_date: item.end_date })
      }
    })
    if (value === '') {
      setWeek([])
      setStartDate({ ...startDate, start_date: '' })
      setEndDate({ ...endDate, end_date: '' })
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

  const campaignHandleChange = (value) => {
    value = value ?? ''
    setCampaign({ campaign: value })
    if (value === '') {
      setCampaign([])
    }
  }

  const annotationHandleChange = (value) => {
    value = value ?? ''
    setAnnotation({ annotation: value })
    if (value === '') {
      setAnnotation([])
    }
  }

  const values = {
    ...type,
    ...affiliate,
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

  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam)
    let shortMonth = newDate.toLocaleString('en-us', { month: 'short' })
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, '0')
    let yyyy = format_date.getFullYear()
    format_date = dd + '-' + shortMonth + '-' + yyyy
    return format_date
  }

  const getCampaignNames = (id) => {
    const campaignNames = []
    if (values?.campaign) {
      const campaign = campaigns.find((campaign) => campaign.id == id)
      campaignNames.push(campaign ? campaign.campaign_name : '')
    }
    return campaignNames
  }
  const affiliateNames = []

  const getAffiliateNames = () => {
    if (values?.affiliate_id) {
      for (let i = 0; i < values.affiliate_id.length; i++) {
        const affiliate = affiliates.find(
          (affiliate) => affiliate.affiliate_id == values.affiliate_id[i]
        )
        affiliateNames.push(affiliate ? affiliate.affiliate_name : '')
      }
    }
    return affiliateNames
  }

  const affiliatesEmail = []
  if (values?.affiliate_id) {
    affiliates.filter((item) => {
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

  const fileName = `${values?.type}_Target${values?.customer_name ? `_(${values.customer_name})` : ''
    }${values?.affiliate_id ? `_(${getAffiliateNames().toString()})` : ''}${values?.campaign ? `_(${getCampaignNames(values.campaign).toString()})` : ''
    }${year?.year ? `_Years(${year.year.toString()})` : ''}${(values?.start_date && !year?.year)
      ? `_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
      : ''
    }`
  values.file_name = fileName

  const fileNameForEmailCriteria = `${values?.type}_Target_Report${values?.customer_name ? `_For_Customers(${values.customer_name})` : ''
    }${values?.annotation ? `_For_Annotations(${values.annotation})` : ''}${values?.campaign ? `_For_Campaigns(${getCampaignNames(values.campaign).toString()})` : ''
    }${values?.affiliate_id ? `_For_Affiliates(${getAffiliateNames().toString()})` : ''}${values?.target_name ? `_For_Targets(${values.target_name.toString()})` : ''
    }${year?.year ? `_For_Years(${year.year.toString()})` : ''}${values?.start_date
      ? `_For_Date_Range(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
      : ''
    }_Created@${currentDate()}`
  values.fileNameForEmailCriteria = fileNameForEmailCriteria

  const handleSubmit = () => {
    setLoading(true)
    axios
      .post(route('target.report.generator'), values)
      .then((res) => {
        console.log(res)
        setLoading(false)
        if (res.status === 204) {
          toast.error('No data found for the selected criteria')
        }
        if (res.status == 200) {
          if (reportType.report_type === 'export-report') {
            ExportReportWithTag(res.data, fileName)
          } else {
            toast.success('Email send successfully')
          }
        }
      })
      .catch((err) => {
        setLoading(false)
        if (err.response?.status === 422) {
          toast.error(err.response?.data?.msg)
          return
        }
        toast.error('Error while generating report')
      })
  }

  return (
    <>
      <Helmet title="Generate Report Customer" />
      <div className="grid w-[500px] mx-auto mt-8 p-10 bg-white shadow rounded">
        <Typography.Title level={5} className="text-center mb-[35px]">
          Generate Report Customer
        </Typography.Title>
        <form validate="true" className="generate-report">
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Radio.Group
                name="type"
                value={type.type}
                onChange={typeHandleChange}
              >
                <Radio value="general">General</Radio>
                <Radio value="billed">Billed</Radio>
              </Radio.Group>
            </Col>

            <Col span={24}>
              <Radio.Group
                name="report_type"
                value={reportType.report_type}
                onChange={reportTypeHandleChange}
              >
                <Radio value="export-report">Export Report</Radio>
                <Radio value="email-report">Email Report</Radio>
              </Radio.Group>
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
              <MultiSelect
                name="target_name"
                onChange={(val) => targetHandleChange(val)}
                options={targetOptions}
                className="w-full"
                placeholder="Select Targets"
              />
            </Col>

            <Col span={24}>
              <Select
                onChange={annotationHandleChange}
                placeholder="Select Annotation"
                allowClear
                className="w-full"
              >
                <Select.Option value="yes">Yes</Select.Option>
                <Select.Option value="no">No</Select.Option>
              </Select>
            </Col>
            <Col span={24}>
              <MultiSelect
                name="affiliate_id"
                onChange={(val) => affiliateHandleChange(val, 'affiliate_id')}
                options={affiliateOptions}
                className="w-full"
                placeholder="Select Affiliates"
              />
            </Col>
            <Col span={24}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, 'year')}
                options={yearOptions}
                className="w-full"
                placeholder="Select Years"
              />
            </Col>
            <Col span={24}>
              <Select
                onChange={monthHandleChange}
                placeholder="Select Broadcast Month"
                allowClear
                className="w-full"
              >
                {monthByYear.map((option, indx) => (
                  <Select.Option key={indx} value={option.broad_cast_month}>
                    {option.broad_cast_month}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <Select
                onChange={weekHandleChange}
                placeholder="Select Broadcast Week"
                allowClear
                className="w-full"
              >
                {broadCastWeeks.map((option, indx) => (
                  <Select.Option key={indx} value={option.broad_cast_week}>
                    {option.broad_cast_week}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24}>
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <DatePicker
                  value={startDate.start_date ? dayjs(startDate.start_date) : null}
                  onChange={(date, dateString) => startDateHandleChange({ target: { name: 'start_date', value: dateString } })}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={24}>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <DatePicker
                  value={endDate.end_date ? dayjs(endDate.end_date) : null}
                  onChange={(date, dateString) => endDateHandleChange({ target: { name: 'end_date', value: dateString } })}
                  className="w-full"
                />
              </div>
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

GenerateReportTarget.layout = (page) => <Layout title="Generate Report Target">{page}</Layout>
export default GenerateReportTarget
