import { useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col } from 'antd'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { currentDate } from '@/Helpers/CurrentDate'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { ExportReportWithoutTag } from '@/Helpers/ExportReport'
import toast from 'react-hot-toast'

const GenerateReportMarketException = () => {
  const [loading, setLoading] = useState(false)
  const { affiliates, broadCastMonths, targets, markets, campaigns, customers } = usePage().props
  const [customer, setCustomer] = useState()
  const [target, setTarget] = useState('')
  const [targetByCustomer, setTargetByCustomer] = useState([])
  const [monthByYear, setMonthByYear] = useState(broadCastMonths)
  const [affiliate, setAffiliate] = useState()
  const [month, setMonth] = useState('')
  const [year, setYear] = useState([])
  const [campaign, setCampaign] = useState('')
  const [annotation, setAnnotation] = useState('')
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
      const marketsName = val.split(',,')
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
        const targetNames = item.Ringba_Targets_Name.split(',')
        setTargetByCustomer(targetNames)
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

  const affiliateHandleChange = (val) => {
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

  const monthHandleChange = (val) => {
    val = val.substring(0, val.length - 1)
    let monthsName = []
    if (val.includes(',')) {
      monthsName = val.split(',,')
      setMonth({ ['broad_cast_month']: monthsName })
    } else {
      if (val !== '') {
        monthsName.push(val)
        setMonth({ ['broad_cast_month']: [val] })
      } else {
        setMonth([])
      }
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

  const yearHandleChange = (val) => {
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

  const campaignHandleChange = (e) => {
    const { name, value } = e.target
    setCampaign({ [name]: value })
    if (value === '') {
      setCampaign([])
    }
  }

  const annotationHandleChange = (val) => {
    let annotationsName = []
    if (val.includes(',')) {
      annotationsName = val.split(',')
      setAnnotation({ ['annotation']: annotationsName })
    } else {
      if (val !== '') {
        annotationsName.push(val)
        setAnnotation({ ['annotation']: [val] })
      } else {
        setAnnotation([])
      }
    }
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

  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam)
    let shortMonth = newDate.toLocaleString('en-us', { month: 'short' })
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, '0')
    let yyyy = format_date.getFullYear()
    format_date = dd + '-' + shortMonth + '-' + yyyy
    return format_date
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

  const getCampaignNames = (id) => {
    const campaignNames = []
    if (values?.campaign) {
      const campaign = campaigns.find((campaign) => campaign.id == id)
      campaignNames.push(campaign ? campaign.campaign_name : '')
    }
    return campaignNames
  }

  const getAffiliateNames = () => {
    const affiliateNames = []
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

  const fileName = `MarketException${values?.customer_name ? `_(${values.customer_name})` : ''}${values?.affiliate_id ? `_(${getAffiliateNames().toString()})` : ''
    }${values?.campaign ? `_(${getCampaignNames(values.campaign).toString()})` : ''}${values?.market ? `_(${values.market})` : ''
    }${year?.year ? `_(${year.year.toString()})` : ''
    }${(values?.start_date && !year?.year)
      ? `_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
      : ''
    }`
  values.file_name = fileName

  const fileNameForEmailCriteria = `MarketException_Report${values?.market ? `_For_Markets(${values.market})` : ''
    }${values?.customer_name ? `_For_Customers(${values.customer_name})` : ''}${values?.annotation ? `_For_Annotations(${values.annotation})` : ''
    }${values?.campaign ? `_For_Campaigns(${getCampaignNames(values.campaign).toString()})` : ''}${values?.affiliate_id ? `_For_Affiliates(${getAffiliateNames().toString()})` : ''
    }${values?.target_name ? `_For_Targets(${values.target_name.toString()})` : ''}${year?.year ? `_For_Years(${year.year.toString()})` : ''
    }${values?.start_date
      ? `_For_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
      : ''
    }_Created@${currentDate()}`
  values.fileNameForEmailCriteria = fileNameForEmailCriteria

  const handleSubmit = () => {
    setLoading(true)
    axios
      .post(route('market.exception.report.generator'), values)
      .then((res) => {
        setLoading(false)
        if (res.status === 204) {
          toast.error('No data found for the selected criteria')
        }
        if (res.status === 200) {
          if (reportType.report_type === 'export-report') {
            ExportReportWithoutTag(res.data, fileName)
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
      <Helmet title="Market Exception" />
      <div style={{ display: 'grid', width: 500, margin: 'auto', marginTop: '2rem', padding: 40 }} className="bg-white shadow rounded">
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: 35 }}>
          Generate Report Market Exception
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
                <Radio value="email-report">Email Report</Radio>
              </Radio.Group>
            </Col>
            <Col span={24}>
              <MultiSelect
                name="market"
                onChange={(val) => marketHandleChange(val, 'market')}
                options={[{ label: 'All Markets', value: 'allMarkets,' }].concat(marketOptions)}
                style={{ width: '100%' }}
                placeholder="Select Market"
              />
            </Col>
            <Col span={24}>
              <select
                name="customer_name"
                onChange={customerHandleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
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
              </select>
            </Col>
            <Col span={24}>
              <select
                name="campaign"
                onChange={campaignHandleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">Select Campaign</option>
                {campaigns.map((campaign, key) => (
                  <option key={key} value={campaign.id}>
                    {campaign.campaign_name}
                  </option>
                ))}
              </select>
            </Col>
            <Col span={24}>
              <MultiSelect
                name="target_name"
                onChange={(val) => targetHandleChange(val)}
                options={targetOptions}
                style={{ width: '100%' }}
                placeholder="Select Targets"
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                name="annotation"
                onChange={(val) => annotationHandleChange(val)}
                options={annotationOptions}
                style={{ width: '100%' }}
                placeholder="Select Annotation"
              />
            </Col>
            <Col span={24}>
              <MultiSelect
                name="affiliate_id"
                onChange={(val) => affiliateHandleChange(val)}
                options={affiliateOptions}
                style={{ width: '100%' }}
                placeholder="Select Affiliates"
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val)}
                options={yearOptions}
                style={{ width: '100%' }}
                placeholder="Select Years"
              />
            </Col>

            <Col span={24}>
              <MultiSelect
                name="broad_cast_month"
                onChange={(val) => monthHandleChange(val)}
                options={broadCastMonthOptions}
                style={{ width: '100%' }}
                placeholder="Select Broadcast Month"
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

GenerateReportMarketException.layout = (page) => (
  <Layout title="Generate Report Market Exception">{page}</Layout>
)
export default GenerateReportMarketException
