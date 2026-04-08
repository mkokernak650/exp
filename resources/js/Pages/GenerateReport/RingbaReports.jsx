import { useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col, Divider, DatePicker, Modal, Input, Table, Popconfirm, Space } from 'antd'
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react'
import { Inertia } from '@inertiajs/inertia'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import toast from 'react-hot-toast'
import { exportRingbaReports } from '@/Helpers/ExportReport'

const RingbaReports = () => {
  const [loading, setLoading] = useState(false)
  const { campaigns, customers, broadCastMonths, broadCastWeeks, states, markets, savedReports } = usePage().props
  const [affiliateList, setAffiliateList] = useState([])
  const [selectedAffiliate, setSelectedAffiliate] = useState('')
  const [affiliatesEmail, setAffiliatesEmail] = useState([])
  const [year, setYear] = useState([])
  const [startDate, setStartDate] = useState({ start_date: '' })
  const [endDate, setEndDate] = useState({ end_date: '' })
  const [state, setState] = useState([])
  const [market, setMarket] = useState([])
  const [campaign, setCampaign] = useState([])
  const [orderType, setOrderType] = useState({ orderType: 'billed' })
  const [customer, setCustomer] = useState([])
  const [reportType, setReportType] = useState({ type: 'customer' })
  const [reportFor, setReportFor] = useState({ reportFor: 'payPerOrder' })
  const [reportOn, setReportOn] = useState({ reportOn: 'detail' })
  const [ecommerceReportType, setEcommerceReportType] = useState({
    report_type: 'export-report',
  })
  const [dialedOptions, setDialedOptions] = useState([])
  const [selectedDialed, setSelectedDialed] = useState('')
  const [selectedBroadcastMonth, setSelectedBroadcastMonth] = useState('')
  const [selectedBroadcastWeek, setSelectedBroadcastWeek] = useState('')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveReportName, setSaveReportName] = useState('')
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editingReportId, setEditingReportId] = useState(null)

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
    value: item.campaign_name,
  }))

  const customerOptions = customers.map((item) => ({
    label: item.customer_name,
    value: item.customer_name,
  }))

  const yearOptions = yearsArray.map((year) => ({
    label: year,
    value: String(year),
  }))

  const stateOptions = states.map((item) => ({
    label: item.state,
    value: item.state + ',',
  }))

  const marketOptions = markets.map((item) => ({
    label: item.market,
    value: item.market + ',',
  }))

  const broadCastMonthsOptions = broadCastMonths.map((item) => ({
    label: item.broad_cast_month,
    value: item.broad_cast_month,
  }))

  const broadCastWeeksOptions = broadCastWeeks.map((item) => ({
    label: item.broad_cast_week,
    value: item.broad_cast_week,
  }))

  const getCampaignNames = () => {
    const campaignNames = []
    if (values?.campaign_id.length) {
      for (let i = 0; i < values.campaign_id.length; i++) {
        const campaign = campaigns.find(
          (campaign) => campaign.campaign_name == values.campaign_id[i]
        )
        campaignNames.push(campaign ? campaign.campaign_name : '')
      }
    }
    return campaignNames
  }

  const getAffiliateNames = () => {
    if (values.selectedAffiliate == 'allAffiliates') {
      return 'All Affiliates'
    } else {
      let affiliateName
      affiliateList.forEach((item) => {
        if (values.selectedAffiliate == item.value) {
          affiliateName = item.label.replace(/\s?\([^)]*\)/g, '')
        }
      })
      return affiliateName
    }
  }

  const getCustomerNames = () => {
    const customerNames = []
    if (values?.customer_id.length) {
      for (let i = 0; i < values.customer_id.length; i++) {
        const customer = customers.find(
          (customer) => customer.customer_name == values.customer_id[i]
        )
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
    setSelectedAffiliate('')
    setAffiliatesEmail([])
    setSelectedDialed('')
    if (val) {
      const campaign_ids = val.split(',')
      setCampaign({ [key]: campaign_ids })
      getAffiliatesAndDialedByCampaigns(val)
    } else {
      setCampaign()
      setAffiliateList([])
      setDialedOptions([])
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

  const affiliateHandleChange = (value) => {
    const emails = []

    if (value == 'allAffiliates') {
      affiliateList.map((item) => emails.push(item.email))
    } else {
      affiliateList.map((item) => {
        if (item.value == value) {
          emails.push(item.email)
        }
      })
    }

    setSelectedAffiliate(value)
    setAffiliatesEmail([...emails])
  }

  const handleDialedPhoneChange = (value) => {
    setSelectedDialed(value)
  }

  const monthHandleChange = (value) => {
    setSelectedBroadcastMonth(value)
    if (value) {
      broadCastMonths.filter((item) => {
        if (item.broad_cast_month === value) {
          setStartDate({ ...startDate, start_date: item.start_date })
          setEndDate({ ...endDate, end_date: item.end_date })
        }
      })
    } else {
      setStartDate({ start_date: '' })
      setEndDate({ end_date: '' })
    }
  }

  const weekHandleChange = (value) => {
    setSelectedBroadcastWeek(value)
    if (value) {
      broadCastWeeks.filter((item) => {
        if (item.broad_cast_week === value) {
          setStartDate({ ...startDate, start_date: item.start_date })
          setEndDate({ ...endDate, end_date: item.end_date })
        }
      })
    } else {
      setStartDate({ start_date: '' })
      setEndDate({ end_date: '' })
    }
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

  const reportForHandleChange = (val) => {
    setReportFor({ reportFor: val })
  }

  const reportOnHandleChange = (val) => {
    setReportOn({ reportOn: val })
  }

  const orderTypeHandleChange = (val) => {
    setOrderType({ orderType: val })
  }

  const values = {
    ...orderType,
    ...campaign,
    ...customer,
    ...state,
    ...market,
    selectedAffiliate,
    selectedDialed,
    selectedBroadcastMonth,
    selectedBroadcastWeek,
    ...year,
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
        if (item.customer_name == values.customer_id[i]) {
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

  if (reportOn.reportOn === 'summary') {
    reportName = 'Summary_Report'
  } else if (reportOn.reportOn === 'exceptions') {
    reportName = 'Exceptions_Report'
  } else if (reportOn.reportOn === 'callLength') {
    reportName = 'Call_Length_Report'
  } else if (reportOn.reportOn === 'homesPerCall') {
    reportName = 'Homes_Per_Call'
  } else {
    reportName = 'Detail_Report'
  }

  const reportOrderType = orderType.orderType === 'billed' ? 'Billed' : 'General'
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

    fileName = `${values?.campaign_id ? `${getCampaignNames().toString()}` : ''}${
      !values?.year && values?.start_date ? ` - ${dateRange}` : ''
    }${values?.year ? ` - ${values.year.toString()}` : ''}`

    if (fileName == '') {
      fileName = 'Export CSV Report'
    }

    values.file_name = fileName
  } else {
    fileName = `${reportName}_${reportOrderType}${
      reportType.type === 'customer'
        ? values?.customer_id
          ? `_(${getCustomerNames().toString()})`
          : ''
        : values?.selectedAffiliate
          ? `_(${getAffiliateNames()})`
          : ''
    }${values?.campaign_id ? `_(${getCampaignNames().toString()})` : ''}${
      !values?.year && values?.start_date
        ? `_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
        : ''
    }${values?.year ? `_(${values.year.toString()})` : ''}`
    values.file_name = fileName
  }

  const getAffiliatesAndDialedByCampaigns = (selectedCampaigns) => {
    axios
      .post(route('ringba.reports.get.affiliates.dialed'), { selectedCampaigns })
      .then((response) => {
        if (response.data) {
          setAffiliateList(response.data.affiliatesOptions)
          setDialedOptions(response.data.dialedOptions)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleSubmit = (overrideValues) => {
    const submitValues = overrideValues || values
    const submitFileName = overrideValues ? (overrideValues.file_name || 'Report') : fileName
    const submitAffiliatesEmail = overrideValues ? [] : affiliatesEmail
    const submitReportType = overrideValues ? (overrideValues.report_type || 'export-report') : ecommerceReportType.report_type

    if (!submitValues.reportFor || submitValues.reportFor === '') {
      toast.error('Please select report for')
      return
    }

    if (!submitValues.reportOn || submitValues.reportOn === '') {
      toast.error('Please select report on')
      return
    }

    if (!submitValues.orderType || submitValues.orderType === '') {
      toast.error('Please select order type')
      return
    }

    if (submitValues.reportOn === 'homesPerCall' && !submitValues.states?.length && !submitValues.markets?.length) {
      toast.error('Please select state or market')
      return
    }

    if (submitValues.reportOn === 'exportCSV' && submitValues.reportFor != 'payPerOrder') {
      toast.error('Export CSV is only for pay per order')
      return
    }

    if (
      !submitValues?.year &&
      ((submitValues?.start_date && !submitValues?.end_date) || (submitValues?.end_date && !submitValues?.start_date))
    ) {
      toast.error('Please select start date and end date both')
      return
    }

    setLoading(true)
    axios
      .post(route('ringba.reports.generate'), { ...submitValues, affiliatesEmail: submitAffiliatesEmail })
      .then((r) => {
        setLoading(false)
        if (r?.status === 204) {
          toast.error('No data found for the selected criteria')
        } else {
          if (submitReportType === 'export-report') {
            exportRingbaReports(r.data, submitFileName)
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

  const handleSaveReport = () => {
    if (!saveReportName.trim()) {
      toast.error('Please enter a report name')
      return
    }
    setSaving(true)

    const payload = { name: saveReportName.trim(), filters: values }
    const request = editingReportId
      ? axios.put(route('ringba.reports.update', editingReportId), payload)
      : axios.post(route('ringba.reports.save'), payload)

    request
      .then(() => {
        toast.success(editingReportId ? 'Report updated successfully' : 'Report saved successfully')
        setSaveModalOpen(false)
        setSaveReportName('')
        setEditingReportId(null)
        Inertia.reload({ only: ['savedReports'] })
      })
      .catch(() => {
        toast.error(editingReportId ? 'Error updating report' : 'Error saving report')
      })
      .finally(() => setSaving(false))
  }

  const handleDeleteSavedReport = (id) => {
    axios
      .delete(route('ringba.reports.delete', id))
      .then(() => {
        toast.success('Report deleted')
        Inertia.reload({ only: ['savedReports'] })
      })
      .catch(() => {
        toast.error('Error deleting report')
      })
  }

  const handleLoadSavedReport = (filters) => {
    setReportFor({ reportFor: filters.reportFor || 'payPerOrder' })
    setOrderType({ orderType: filters.orderType || 'billed' })
    setReportOn({ reportOn: filters.reportOn || 'detail' })
    setReportType({ type: filters.type || 'customer' })
    setEcommerceReportType({ report_type: filters.report_type || 'export-report' })
    setCampaign(filters.campaign_id ? { campaign_id: filters.campaign_id } : [])
    setCustomer(filters.customer_id ? { customer_id: filters.customer_id } : [])
    setState(filters.states ? { states: filters.states } : [])
    setMarket(filters.markets ? { markets: filters.markets } : [])
    setYear(filters.year ? { year: filters.year } : [])
    setStartDate({ start_date: filters.start_date || '' })
    setEndDate({ end_date: filters.end_date || '' })
    setSelectedAffiliate(filters.selectedAffiliate || '')
    setSelectedDialed(filters.selectedDialed || '')
    setSelectedBroadcastMonth(filters.selectedBroadcastMonth || '')
    setSelectedBroadcastWeek(filters.selectedBroadcastWeek || '')

    if (filters.campaign_id?.length) {
      axios
        .post(route('ringba.reports.get.affiliates.dialed'), { selectedCampaigns: filters.campaign_id.join(',') })
        .then((response) => {
          if (response.data) {
            setAffiliateList(response.data.affiliatesOptions)
            setDialedOptions(response.data.dialedOptions)
          }
          setFormKey((prev) => prev + 1)
        })
        .catch(() => {
          setFormKey((prev) => prev + 1)
        })
    } else {
      setAffiliateList([])
      setDialedOptions([])
      setFormKey((prev) => prev + 1)
    }

    toast.success('Report filters loaded')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGenerateSavedReport = (filters) => {
    handleSubmit(filters)
  }

  const handleEditSavedReport = (record) => {
    handleLoadSavedReport(record.filters)
    setEditingReportId(record.id)
    setSaveReportName(record.name)
  }

  const reportOnLabels = {
    detail: 'Detail',
    summary: 'Summary',
    exceptions: 'Exceptions',
    callLength: 'Call Length',
    homesPerCall: 'Homes Per Call',
  }

  const savedReportColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Report Type',
      key: 'reportOn',
      width: 140,
      render: (_, record) => reportOnLabels[record.filters?.reportOn] || record.filters?.reportOn || '-',
    },
    {
      title: 'Order Type',
      key: 'orderType',
      width: 100,
      render: (_, record) => {
        const val = record.filters?.orderType
        return val ? val.charAt(0).toUpperCase() + val.slice(1) : '-'
      },
    },
    {
      title: 'Date Saved',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text) => dayjs(text).format('MMM D, YYYY h:mm A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleEditSavedReport(record)}>
            Edit
          </Button>
          <Button size="small" type="primary" onClick={() => handleGenerateSavedReport(record.filters)} disabled={loading} loading={loading}>
            Generate
          </Button>
          <Popconfirm title="Delete this saved report?" onConfirm={() => handleDeleteSavedReport(record.id)} okText="Yes" cancelText="No">
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Helmet title="Ringba Reports" />
      <div className="grid w-[500px] mx-auto mt-8 p-10 bg-white shadow rounded">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Ringba Reports
        </Typography.Title>
        <form validate="true" className="generate-report" key={formKey}>
          <Row gutter={[0, 16]}>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                singleSelect
                name="reportFor"
                defaultValue={reportFor.reportFor}
                onChange={(val) => reportForHandleChange(val)}
                options={[{ label: 'Pay Per Order', value: 'payPerOrder' }]}
                className="!w-full"
                placeholder="Select Report For"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                singleSelect
                name="order_type"
                defaultValue={orderType.orderType}
                onChange={(val) => orderTypeHandleChange(val)}
                options={[
                  { label: 'Billed', value: 'billed' },
                  { label: 'General', value: 'general' },
                ]}
                className="!w-full"
                placeholder="Select Order Type"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                singleSelect
                name="reportOn"
                defaultValue={reportOn.reportOn}
                onChange={(val) => reportOnHandleChange(val)}
                options={[
                  { label: 'Detail Report', value: 'detail' },
                  { label: 'Summary Report', value: 'summary' },
                  { label: 'Exceptions Report', value: 'exceptions' },
                  { label: 'Call Length Report', value: 'callLength' },
                  { label: 'Homes Per Call Report', value: 'homesPerCall' },
                ]}
                className="!w-full"
                placeholder="Select Report On"
              />
            </Col>
            <Col span={24} className="pt-0">
              <Divider className="my-2 bg-[#0000001f]" />
            </Col>
            {market.length < 1 && (
              <Col span={24} className="pb-[5px]">
                <MultiSelect
                  name="states"
                  defaultValue={state?.states ? state.states.map((s) => ({ label: s === 'allStates' ? 'All States' : s, value: s + ',' })) : ''}
                  onChange={(val) => stateHandleChange(val, 'states')}
                  options={[{ label: 'All States', value: 'allStates,' }].concat(stateOptions)}
                  className="!w-full"
                  placeholder="Select States"
                />
              </Col>
            )}
            {state.length < 1 && (
              <Col span={24} className="pb-[5px]">
                <MultiSelect
                  name="markets"
                  defaultValue={market?.markets ? market.markets.map((m) => ({ label: m === 'allMarkets' ? 'All Markets' : m, value: m + ',' })) : ''}
                  onChange={(val) => marketHandleChange(val, 'markets')}
                  options={[{ label: 'All Markets', value: 'allMarkets,' }].concat(marketOptions)}
                  className="!w-full"
                  placeholder="Select Markets"
                />
              </Col>
            )}
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="campaign_id"
                defaultValue={campaign?.campaign_id ? campaign.campaign_id.map((c) => ({ label: c, value: c })) : ''}
                onChange={(val) => campaignHandleChange(val, 'campaign_id')}
                options={campaignOptions}
                className="!w-full"
                placeholder="Select Campaign"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="customer_id"
                defaultValue={customer?.customer_id ? customer.customer_id.map((c) => ({ label: c, value: c })) : ''}
                onChange={(val) => customerHandleChange(val, 'customer_id')}
                options={customerOptions}
                className="!w-full"
                placeholder="Select Customer"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="affiliate_id"
                onChange={(value) => affiliateHandleChange(value)}
                defaultValue={selectedAffiliate}
                options={affiliateOptions}
                className="!w-full"
                placeholder="Select Affiliates"
                singleSelect
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="dialedPhone"
                onChange={(value) => handleDialedPhoneChange(value)}
                defaultValue={selectedDialed}
                options={dialedOptions}
                className="!w-full"
                placeholder="Select Dialed Phone"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="year"
                defaultValue={year?.year ? year.year.map((y) => ({ label: y, value: String(y) })) : ''}
                onChange={(val) => yearHandleChange(val, 'year')}
                options={yearOptions}
                className="!w-full"
                placeholder="Select Years"
              />
            </Col>
            {((Array.isArray(year) && year.length < 1) || !year) && (
              <>
                <Col span={24}>
                  <MultiSelect
                    placeholder="Select Broadcast Month"
                    className="!w-full"
                    defaultValue={selectedBroadcastMonth}
                    options={broadCastMonthsOptions}
                    onChange={(value) => monthHandleChange(value)}
                    singleSelect
                  />
                </Col>
                <Col span={24}>
                  <MultiSelect
                    placeholder="Select Broadcast Week"
                    className="!w-full"
                    defaultValue={selectedBroadcastWeek}
                    options={broadCastWeeksOptions}
                    onChange={(value) => weekHandleChange(value)}
                    singleSelect
                  />
                </Col>
                <Col span={24}>
                  <div>
                    <label className="block text-sm mb-1">Start Date</label>
                    <DatePicker
                      value={startDate.start_date ? dayjs(startDate.start_date) : null}
                      onChange={(date, dateString) =>
                        startDateHandleChange({ target: { name: 'start_date', value: dateString } })
                      }
                      className="!w-full"
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <DatePicker
                      value={endDate.end_date ? dayjs(endDate.end_date) : null}
                      onChange={(date, dateString) =>
                        endDateHandleChange({ target: { name: 'end_date', value: dateString } })
                      }
                      className="!w-full"
                    />
                  </div>
                </Col>
              </>
            )}
            <Col span={24} className="my-4">
              <Col span={24}>
                <Radio.Group
                  name="type"
                  value={reportType.type}
                  onChange={reportTypeHandleChange}
                  className="mb-4"
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
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  loading={loading}
                >
                  Generate
                </Button>
                <Button onClick={() => setSaveModalOpen(true)}>
                  {editingReportId ? 'Update Report' : 'Save Report'}
                </Button>
                {editingReportId && (
                  <Button onClick={() => { setEditingReportId(null); setSaveReportName('') }}>
                    Cancel Edit
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </form>
      </div>

      <Modal
        title={editingReportId ? 'Update Report' : 'Save Report'}
        open={saveModalOpen}
        onOk={handleSaveReport}
        onCancel={() => { setSaveModalOpen(false); setSaveReportName('') }}
        confirmLoading={saving}
        okText={editingReportId ? 'Update' : 'Save'}
      >
        <div className="py-2">
          <label className="block text-sm mb-1">Report Name</label>
          <Input
            placeholder="e.g. Weekly Customer Report"
            value={saveReportName}
            onChange={(e) => setSaveReportName(e.target.value)}
            onPressEnter={handleSaveReport}
          />
        </div>
      </Modal>

      {savedReports?.length > 0 && (
        <div className="w-[900px] mx-auto mt-8 p-10 bg-white shadow rounded">
          <Typography.Title level={5} className="!mb-4">
            Saved Reports
          </Typography.Title>
          <Table
            columns={savedReportColumns}
            dataSource={savedReports}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />
        </div>
      )}
    </>
  )
}

RingbaReports.layout = (page) => <Layout title="Ringba Reports">{page}</Layout>
export default RingbaReports
