import { useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col, Divider, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import toast from 'react-hot-toast'
import { exportReportEcommerce } from '@/Helpers/ExportReport'

const EcommerceReport = () => {
  const [loading, setLoading] = useState(false)
  const { campaigns, customers, broadCastMonths, broadCastWeeks, states, markets, acesMarketingId } = usePage().props
  const [affiliateList, setAffiliateList] = useState([])
  const [couponCodeList, setCouponCodeList] = useState([])
  const [dialedPhoneList, setDialedPhoneList] = useState([])
  const [affiliate, setAffiliate] = useState()
  const [affiliatesEmail, setAffiliatesEmail] = useState([])
  const [month, setMonth] = useState('')
  const [year, setYear] = useState([])
  const [week, setWeek] = useState('')
  const [startDate, setStartDate] = useState({ start_date: '' })
  const [endDate, setEndDate] = useState({ end_date: '' })
  const [couponCode, setCouponCode] = useState([])
  const [dialed, setDialed] = useState([])
  const [state, setState] = useState([])
  const [market, setMarket] = useState([])
  const [campaign, setCampaign] = useState([])
  const [orderType, setOrderType] = useState({ orderType: 'both' })
  const [customer, setCustomer] = useState([])
  const [reportType, setReportType] = useState({ type: 'customer' })
  const [reportFor, setReportFor] = useState({ reportFor: 'payPerOrder' })
  const [reportOn, setReportOn] = useState({ reportOn: 'detail' })
  const [affiliateFeeType, setAffiliateFeeType] = useState({
    affiliate_fee_type: 'payout_per_order',
  })
  const [ecommerceReportType, setEcommerceReportType] = useState({
    report_type: 'export-report',
  })

  let yearsArray = []
  for (let i = 0; i < 5; i++) {
    let years = new Date().getFullYear()
    let months = new Date().getMonth()
    let day = new Date().getDate()
    let date = new Date(years + i, months, day).getFullYear()
    if (!yearsArray.includes(new Date(years - 2, months, day).getFullYear())) {
      yearsArray.push(new Date(years - 2, months, day).getFullYear())
    }
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

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: year,
  }))

  const stateOptions = states.map((item) => ({
    label: item.state,
    value: item.state + ',',
  }))

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ',',
  }))

  const setSelectionWiseData = (affiliates, couponCodes, dialedPhones) => {
    const activeAffiliates = Object.values(affiliates)?.map((item) => ({
      label: item?.[1],
      value: item?.[0].toString(),
      email: item?.[2],
    })).sort((a, b) => {
      const nameA = a.label.toLowerCase();
      const nameB = b.label.toLowerCase();

      if (nameA < nameB) {
        return -1
      } else if (nameA > nameB) {
        return 1
      } else {
        return 0
      }
    })

    const couponOptions = Object.values(couponCodes)?.map((item) => ({
      label: item,
      value: item,
    }))
    const dialedOptions = Object.values(dialedPhones)?.map((item) => ({
      label: item,
      value: item,
    }))

    setAffiliateList([...activeAffiliates])
    setCouponCodeList([...couponOptions])
    setDialedPhoneList([...dialedOptions])

    let filteredAffiliates = []
    if (affiliate?.affiliate_id.includes('allAffiliates')) {
      filteredAffiliates = 'allAffiliates'
    } else {
      filteredAffiliates = activeAffiliates
        .filter((item) => {
          return affiliate?.affiliate_id?.includes(item.value)
        })
        .map((item) => item.value)
        .join(',')
    }
    affiliateHandleChange(filteredAffiliates, 'affiliate_id', activeAffiliates)

    setCouponCode({
      couponCodes: couponOptions
        .filter((item) => {
          return values?.couponCodes?.includes(item.value)
        })
        .map((item) => item.value),
    })

    setDialed({
      dialed: dialedOptions
        .filter((item) => {
          return values?.dialed?.includes(item.value)
        })
        .map((item) => item.value),
    })
  }

  const getCampaignNames = () => {
    const campaignNames = []
    if (values?.campaign_id.length) {
      for (let i = 0; i < values.campaign_id.length; i++) {
        const campaign = campaigns.find((campaign) => campaign.id == values.campaign_id[i])
        campaignNames.push(campaign ? campaign.campaign_name : '')
      }
    }
    return campaignNames
  }
  const getAffiliateNames = () => {
    const affiliateNames = []
    Object.values(affiliateList).map((item) => {
      if (values.affiliate_id.includes(item.value)) {
        affiliateNames.push(item.label.replace(/\s?\([^)]*\)/g, ""))
      }
    })
    return affiliateNames
  }
  const getCustomerNames = () => {
    const customerNames = []
    if (values?.customer_id.length) {
      for (let i = 0; i < values.customer_id.length; i++) {
        const customer = customers.find((customer) => customer.id == values.customer_id[i])
        customerNames.push(customer ? customer.customer_name : '')
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
      const campaign_ids = val.split(',')
      setCampaign({ [key]: campaign_ids })
    } else {
      setCampaign()
    }
  }
  const customerHandleChange = (val, key) => {
    if (val) {
      const customer_ids = val.split(',')
      setCustomer({ [key]: customer_ids })
    } else {
      setCustomer()
    }
  }

  let affiliateOptions = []
  affiliateOptions = [{ label: 'All Affiliates', value: 'allAffiliates' }, ...affiliateList]

  useEffect(() => {
    if (
      typeof campaign?.campaign_id === 'undefined' &&
      typeof customer?.customer_id === 'undefined'
    ) {
      setSelectionWiseData([], [], [])
      setAffiliate({ affiliate_id: [] })
      setCouponCode({ couponCodes: [] })
      setDialed({ dialed: [] })
      return
    }

    axios
      .post(route('ecommerce.report.selectionWiseData'), {
        campaign_ids: campaign?.campaign_id,
        customer_ids: customer?.customer_id,
      })
      .then((res) => {
        if (res?.status == 200) {
          setSelectionWiseData(res.data.affiliates, res.data.couponCodes, res.data.dialedPhones)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [campaign?.campaign_id, customer?.customer_id])

  const affiliateHandleChange = (val, key, activeAffiliates = false) => {
    let affiliate_ids = val ? val.split(',') : []
    if (affiliate_ids.includes('allAffiliates')) {
      affiliate_ids = ['allAffiliates']
    }

    const activeAffiliatesList = activeAffiliates || affiliateList

    const emails = []
    Object.values(activeAffiliatesList).map((item) => {
      if (affiliate_ids.includes('allAffiliates') || affiliate_ids.includes(item.value)) {
        emails.push(item.email)
      }
    })

    setAffiliatesEmail([...emails])
    setAffiliate({ [key]: affiliate_ids })
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
  }

  const yearHandleChange = (val, key) => {
    if (val) {
      const years = val.split(',')
      setYear({ [key]: years })
    } else {
      delete setYear()
    }
  }

  const stateHandleChange = (val, key) => {
    if (val) {
      val = val.substring(0, val.length - 1)
      const statesValue = val.split(',,')
      setState({ [key]: statesValue })
    } else {
      setState([])
    }
  }

  const marketHandleChange = (val, key) => {
    if (val) {
      val = val.substring(0, val.length - 1)
      const marketsValue = val.split(',,')
      setMarket({ [key]: marketsValue })
    } else {
      setMarket([])
    }
  }

  const couponCodeHandleChange = (val, key) => {
    if (val) {
      const couponCodesValue = val.split(',')
      setCouponCode({ [key]: couponCodesValue })
    } else {
      setCouponCode([])
    }
  }

  const dialedHandleChange = (val, key) => {
    if (val) {
      const dialedValue = val.split(',')
      setDialed({ [key]: dialedValue })
    } else {
      setDialed([])
    }
  }

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

  const reportTypeHandleChange = (e) => {
    const { name, value } = e.target
    setReportType({ [name]: value })
  }

  const affiliateFeeTypeHandleChange = (e) => {
    const { name, value } = e.target
    setAffiliateFeeType({ [name]: value })
  }

  const reportForHandleChange = (val) => {
    setReportFor({ reportFor: val })
  }

  const reportOnHandleChange = (val) => {
    setReportOn({ reportOn: val })
  }

  const orderTypeHandleChange = (val) => {
    setOrderType({ orderType: val })
    if (val !== '2' && affiliate?.affiliate_id?.[0] === '25') {
      setAffiliate([])
    }
    if (val == 1) {
      setDialed([])
    } else if (val == 2) {
      setCouponCode([])
    }
  }

  const values = {
    ...orderType,
    ...affiliateFeeType,
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
    ...reportOn,
    ...ecommerceReportType,
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
  const mergeEmail = [...customerEmails]
  if (mergeEmail.length) {
    values.emails = mergeEmail
  }

  const dateFormat = (dataParam) => {
    let newDate = new Date(dataParam + 'T00:00:00')
    let shortMonth = newDate.toLocaleString('en-us', { month: 'short' })
    let format_date = newDate
    let dd = String(format_date.getDate()).padStart(2, '0')
    let yyyy = format_date.getFullYear()
    format_date = dd + '-' + shortMonth + '-' + yyyy
    return format_date
  }

  let reportName

  if (reportOn.reportOn === 'marketTarget') {
    reportName = 'Market Report'
  } else if (reportOn.reportOn === 'summary') {
    reportName = 'Summary Report'
  } else if (reportOn.reportOn === 'exportCSV') {
    reportName = 'Export CSV Report'
  } else {
    reportName = 'Detail Report'
  }

  let fileName

  if (reportOn.reportOn === 'exportCSV') {
    let dateRange

    if (!values?.year && values?.start_date) {
      if (values.start_date === values?.end_date) {
        dateRange = dateFormat(values.start_date)
      } else {
        dateRange = `${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)}`
      }
    }

    fileName = `${values?.campaign_id ? `${getCampaignNames().toString()}` : ''}${(!values?.year && values?.start_date)
      ? ` - ${dateRange}`
      : ''
      }${values?.year ? ` - ${values.year.toString()}` : ''}`

    if (fileName == '') {
      fileName = 'Export CSV Report'
    }

    values.file_name = fileName
  } else {
    fileName = `${reportName}${reportType.type === 'customer'
      ? values?.customer_id
        ? `_For_(${getCustomerNames().toString()})`
        : ''
      : values?.affiliate_id.length
        ? `_For_(${getAffiliateNames().toString()})`
        : ''
      }${values?.campaign_id ? `_For_(${getCampaignNames().toString()})` : ''}${(!values?.year && values?.start_date)
        ? `_For_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
        : ''
      }${values?.year ? `_For_(${values.year.toString()})` : ''}`
    values.file_name = fileName
  }

  const handleSubmit = () => {
    if (reportFor.reportFor === '') {
      toast.error('Please select report for')
      return
    }

    if (reportOn.reportOn === '') {
      toast.error('Please select report on')
      return
    }

    if (orderType.orderType === '') {
      toast.error('Please select order type')
      return
    }

    if (reportOn.reportOn === 'marketTarget' && state.length < 1 && market.length < 1) {
      toast.error('Please select state or market')
      return
    }

    if (reportOn.reportOn === 'exportCSV' && reportFor.reportFor != 'payPerOrder') {
      toast.error('Export CSV is only for pay per order')
      return
    }

    if (!values?.year && (values?.start_date && !values?.end_date)) {
      toast.error('Please select start date and end date both')
      return
    }

    setLoading(true)
    axios
      .post(route('ecommerce.report.generate'), { ...values, affiliatesEmail })
      .then((r) => {
        setLoading(false)
        if (r?.status === 204) {
          setLoading(false)
          toast.error('No data found for the selected criteria')
        } else {
          setLoading(false)
          if (ecommerceReportType.report_type === 'export-report') {
            exportReportEcommerce(r.data, fileName, reportOn)
          } else {
            toast.success(r?.data?.message)
          }
        }
      })
      .catch((e) => {
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
      <Helmet title="Reports" />
      <div style={{ display: 'grid', width: 500, margin: 'auto', marginTop: '2rem', padding: 40 }} className="bg-white shadow rounded">
        <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: 35 }}>
          Reports
        </Typography.Title>
        <form validate="true" className="generate-report">
          <Row gutter={[0, 16]}>
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                singleSelect
                name="reportFor"
                defaultValue={reportFor.reportFor}
                onChange={(val) => reportForHandleChange(val)}
                options={[
                  { label: 'Pay Per Order', value: 'payPerOrder' },
                  { label: 'Cash Buy', value: 'cashBuy' },
                ]}
                style={{ width: '100%' }}
                placeholder="Select Report For"
              />
            </Col>
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                singleSelect
                name="order_type"
                defaultValue={orderType.orderType}
                onChange={(val) => orderTypeHandleChange(val)}
                options={[
                  { label: 'E-commerce & Phone', value: 'both' },
                  { label: 'E-commerce', value: '1' },
                  { label: 'Phone', value: '2' },
                ]}
                style={{ width: '100%' }}
                placeholder="Select Order Type"
              />
            </Col>
            <Col span={24} style={{ paddingBottom: 5, marginBottom: 15 }}>
              <MultiSelect
                singleSelect
                name="reportOn"
                defaultValue={reportOn.reportOn}
                onChange={(val) => reportOnHandleChange(val)}
                options={[
                  { label: 'Detail Report', value: 'detail' },
                  { label: 'Market Target', value: 'marketTarget' },
                  { label: 'Summary Report', value: 'summary' },
                  { label: 'Export CSV Report', value: 'exportCSV' },
                ]}
                style={{ width: '100%' }}
                placeholder="Select Report On"
              />
            </Col>
            <Col span={24} style={{ paddingTop: 0, marginBottom: -10 }}>
              <Divider />
            </Col>
            {market.length < 1 && (
              <Col span={24} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="states"
                  onChange={(val) => stateHandleChange(val, 'states')}
                  options={[{ label: 'All States', value: 'allStates,' }].concat(stateOptions)}
                  style={{ width: '100%' }}
                  placeholder="Select States"
                />
              </Col>
            )}
            {state.length < 1 && (
              <Col span={24} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="markets"
                  onChange={(val) => marketHandleChange(val, 'markets')}
                  options={[{ label: 'All Markets', value: 'allMarkets,' }].concat(marketOptions)}
                  style={{ width: '100%' }}
                  placeholder="Select Markets"
                />
              </Col>
            )}
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="campaign_id"
                onChange={(val) => campaignHandleChange(val, 'campaign_id')}
                options={campaignOptions}
                style={{ width: '100%' }}
                placeholder="Select Campaign"
              />
            </Col>
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="customer_id"
                onChange={(val) => customerHandleChange(val, 'customer_id')}
                options={customerOptions}
                style={{ width: '100%' }}
                placeholder="Select Customer"
              />
            </Col>
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="affiliate_id"
                onChange={(val) => affiliateHandleChange(val, 'affiliate_id')}
                options={affiliateOptions}
                style={{ width: '100%' }}
                placeholder="Select Affiliates"
                singleSelect
              />
            </Col>
            {(orderType.orderType === 'both' || orderType.orderType == 1) && (
              <Col span={24} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="couponCodes"
                  defaultValue={couponCode?.couponCodes}
                  onChange={(val) => couponCodeHandleChange(val, 'couponCodes')}
                  options={couponCodeList}
                  style={{ width: '100%' }}
                  placeholder="Select Coupon Codes"
                />
              </Col>
            )}
            {(orderType.orderType === 'both' || orderType.orderType == 2) && (
              <Col span={24} style={{ paddingBottom: 5 }}>
                <MultiSelect
                  name="dialed"
                  defaultValue={dialed?.dialed}
                  onChange={(val) => dialedHandleChange(val, 'dialed')}
                  options={dialedPhoneList}
                  style={{ width: '100%' }}
                  placeholder="Select Dialed Phone"
                />
              </Col>
            )}
            <Col span={24} style={{ paddingBottom: 5 }}>
              <MultiSelect
                name="year"
                onChange={(val) => yearHandleChange(val, 'year')}
                options={yearOptions}
                style={{ width: '100%' }}
                placeholder="Select Years"
              />
            </Col>
            {((Array.isArray(year) && year.length < 1) || !year) && (
              <>
                <Col span={24}>
                  <Select
                    onChange={monthHandleChange}
                    placeholder="Select Broadcast Month"
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {broadCastMonths.map((option, indx) => (
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
                    style={{ width: '100%' }}
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
                      style={{ width: '100%' }}
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <DatePicker
                      value={endDate.end_date ? dayjs(endDate.end_date) : null}
                      onChange={(date, dateString) => endDateHandleChange({ target: { name: 'end_date', value: dateString } })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Col>
              </>
            )}
            <Col span={24}>
              <Col span={24}>
                <Radio.Group
                  name="type"
                  value={reportType.type}
                  onChange={reportTypeHandleChange}
                >
                  <Radio value="customer">For Customer</Radio>
                  <Radio value="affiliate">For Affiliate</Radio>
                </Radio.Group>
              </Col>
              <Radio.Group
                name="report_type"
                value={ecommerceReportType.report_type}
                onChange={ecommerceReportTypeHandleChange}
              >
                <Radio value="export-report">Export Report</Radio>
                <Radio value="email-report">Email Report</Radio>
              </Radio.Group>
            </Col>
            <Col span={24}>
              <Button
                type="primary"
                onClick={(e) => handleSubmit()}
                disabled={loading}
                loading={loading}
              >
                Generate
              </Button>
            </Col>
          </Row>
        </form>
      </div>
    </>
  )
}

EcommerceReport.layout = (page) => <Layout title="E-commerce Report">{page}</Layout>
export default EcommerceReport
