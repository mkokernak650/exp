import { useEffect, useRef, useState } from 'react'
import Layout from '../Layout/Layout'
import { Button, Typography, Radio, Row, Col, Divider, Select, DatePicker, Modal, Input, Table, Popconfirm, Space } from 'antd'
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react'
import { Inertia } from '@inertiajs/inertia'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import toast from 'react-hot-toast'
import { exportReportEcommerce } from '@/Helpers/ExportReport'

const EcommerceReport = () => {
  const [loading, setLoading] = useState(false)
  const {
    campaigns,
    customers,
    broadCastMonths,
    broadCastWeeks,
    states,
    markets,
    acesMarketingId,
    savedReports,
  } = usePage().props
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
  const [savedReportLoading, setSavedReportLoading] = useState(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveReportName, setSaveReportName] = useState('')
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editingReportId, setEditingReportId] = useState(null)
  const loadRequestId = useRef(0)

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
    value: String(item.id),
  }))

  const customerOptions = customers.map((item) => ({
    label: item.customer_name,
    value: String(item.id),
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

  const setSelectionWiseData = (affiliates, couponCodes, dialedPhones) => {
    const activeAffiliates = Object.values(affiliates)
      ?.map((item) => ({
        label: item?.[1],
        value: item?.[0].toString(),
        email: item?.[2],
      }))
      .sort((a, b) => {
        const nameA = a.label.toLowerCase()
        const nameB = b.label.toLowerCase()

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
    if (values?.campaign_id?.length) {
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
      if (values?.affiliate_id?.includes(item.value)) {
        affiliateNames.push(item.label.replace(/\s?\([^)]*\)/g, ''))
      }
    })
    return affiliateNames
  }
  const getCustomerNames = () => {
    const customerNames = []
    if (values?.customer_id?.length) {
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

    fileName = `${values?.campaign_id ? `${getCampaignNames().toString()}` : ''}${
      !values?.year && values?.start_date ? ` - ${dateRange}` : ''
    }${values?.year ? ` - ${values.year.toString()}` : ''}`

    if (fileName == '') {
      fileName = 'Export CSV Report'
    }

    values.file_name = fileName
  } else {
    fileName = `${reportName}${
      reportType.type === 'customer'
        ? values?.customer_id
          ? `_For_(${getCustomerNames().toString()})`
          : ''
        : values?.affiliate_id?.length
          ? `_For_(${getAffiliateNames().toString()})`
          : ''
    }${values?.campaign_id ? `_For_(${getCampaignNames().toString()})` : ''}${
      !values?.year && values?.start_date
        ? `_For_(${dateFormat(values.start_date)}_To_${dateFormat(values?.end_date)})`
        : ''
    }${values?.year ? `_For_(${values.year.toString()})` : ''}`
    values.file_name = fileName
  }

  const handleSubmit = (overrideValues) => {
    const requestValues = overrideValues || values
    const savedReportId = overrideValues?.__savedReportId
    const reportPayload = requestValues?.__savedReportId
      ? (() => {
          const { __savedReportId, ...rest } = requestValues
          return rest
        })()
      : requestValues
    const submitFileName = overrideValues ? (overrideValues.file_name || 'Report') : fileName
    const submitAffiliatesEmail = overrideValues ? [] : affiliatesEmail
    const submitReportType = overrideValues ? (overrideValues.report_type || 'export-report') : ecommerceReportType.report_type
    const submitReportOn = overrideValues ? { reportOn: overrideValues.reportOn } : reportOn

    if (!reportPayload.reportFor || reportPayload.reportFor === '') {
      toast.error('Please select report for')
      return
    }

    if (!reportPayload.reportOn || reportPayload.reportOn === '') {
      toast.error('Please select report on')
      return
    }

    if (!reportPayload.orderType || reportPayload.orderType === '') {
      toast.error('Please select order type')
      return
    }

    if (reportPayload.reportOn === 'marketTarget' && !reportPayload.states?.length && !reportPayload.markets?.length) {
      toast.error('Please select state or market')
      return
    }

    if (reportPayload.reportOn === 'exportCSV' && reportPayload.reportFor != 'payPerOrder') {
      toast.error('Export CSV is only for pay per order')
      return
    }

    if (
      !reportPayload?.year &&
      ((reportPayload?.start_date && !reportPayload?.end_date) || (reportPayload?.end_date && !reportPayload?.start_date))
    ) {
      toast.error('Please select start date and end date both')
      return
    }

    const isSavedReport = !!overrideValues
    if (isSavedReport) {
      setSavedReportLoading(savedReportId || true)
    } else {
      setLoading(true)
    }

    axios
      .post(route('ecommerce.report.generate'), { ...reportPayload, affiliatesEmail: submitAffiliatesEmail })
      .then((r) => {
        if (r?.status === 204) {
          toast.error('No data found for the selected criteria')
        } else {
          if (submitReportType === 'export-report') {
            exportReportEcommerce(r.data, submitFileName, submitReportOn)
          } else {
            toast.success(r?.data?.message)
          }
        }
      })
      .catch((e) => {
        if (e.response?.status === 422) {
          toast.error(e.response?.data?.message)
          return
        }
        toast.error('Error while generating report')
      })
      .finally(() => {
        if (isSavedReport) {
          setSavedReportLoading(null)
        } else {
          setLoading(false)
        }
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
      ? axios.put(route('ecommerce.reports.update', editingReportId), payload)
      : axios.post(route('ecommerce.reports.save'), payload)

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
      .delete(route('ecommerce.reports.delete', id))
      .then(() => {
        toast.success('Report deleted')
        Inertia.reload({ only: ['savedReports'] })
      })
      .catch(() => {
        toast.error('Error deleting report')
      })
  }

  const handleLoadSavedReport = (filters) => {
    const currentRequestId = ++loadRequestId.current

    setReportFor({ reportFor: filters.reportFor || 'payPerOrder' })
    setOrderType({ orderType: filters.orderType || 'both' })
    setReportOn({ reportOn: filters.reportOn || 'detail' })
    setReportType({ type: filters.type || 'customer' })
    setEcommerceReportType({ report_type: filters.report_type || 'export-report' })
    setAffiliateFeeType({ affiliate_fee_type: filters.affiliate_fee_type || 'payout_per_order' })
    setCampaign(filters.campaign_id ? { campaign_id: filters.campaign_id } : [])
    setCustomer(filters.customer_id ? { customer_id: filters.customer_id } : [])
    setState(filters.states ? { states: filters.states } : [])
    setMarket(filters.markets ? { markets: filters.markets } : [])
    setYear(filters.year ? { year: filters.year } : [])
    setStartDate({ start_date: filters.start_date || '' })
    setEndDate({ end_date: filters.end_date || '' })
    setAffiliate(filters.affiliate_id ? { affiliate_id: filters.affiliate_id } : [])
    setCouponCode(filters.couponCodes ? { couponCodes: filters.couponCodes } : [])
    setDialed(filters.dialed ? { dialed: filters.dialed } : [])
    setMonth(filters.broad_cast_month ? { broad_cast_month: filters.broad_cast_month } : '')
    setWeek(filters.broad_cast_week ? { broad_cast_week: filters.broad_cast_week } : '')

    if (filters.campaign_id?.length || filters.customer_id?.length) {
      axios
        .post(route('ecommerce.report.selectionWiseData'), {
          campaign_ids: filters.campaign_id,
          customer_ids: filters.customer_id,
        })
        .then((res) => {
          if (currentRequestId !== loadRequestId.current) return
          if (res?.status == 200) {
            const activeAffiliates = Object.values(res.data.affiliates)
              ?.map((item) => ({
                label: item?.[1],
                value: item?.[0].toString(),
                email: item?.[2],
              }))
              .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
            const couponOptions = Object.values(res.data.couponCodes)?.map((item) => ({ label: item, value: item }))
            const dialedOptions = Object.values(res.data.dialedPhones)?.map((item) => ({ label: item, value: item }))
            setAffiliateList([...activeAffiliates])
            setCouponCodeList([...couponOptions])
            setDialedPhoneList([...dialedOptions])
          }
          setFormKey((prev) => prev + 1)
        })
        .catch(() => {
          if (currentRequestId !== loadRequestId.current) return
          setFormKey((prev) => prev + 1)
        })
    } else {
      setAffiliateList([])
      setCouponCodeList([])
      setDialedPhoneList([])
      setFormKey((prev) => prev + 1)
    }

    toast.success('Report filters loaded')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buildSavedReportFileName = (filters) => {
    const reportOnMap = { marketTarget: 'Market Report', summary: 'Summary Report', exportCSV: 'Export CSV Report' }
    const reportTypeMap = { 'export-report': 'Export', 'email-report': 'Email' }
    const reportName = reportOnMap[filters.reportOn] || 'Detail Report'
    const parts = [reportName, `Type_(${reportTypeMap[filters.report_type] || 'Export'})`]
    if (filters.campaign_id?.length) {
      const names = filters.campaign_id.map((id) => {
        const c = campaigns.find((c) => String(c.id) === String(id))
        return c ? c.campaign_name : id
      })
      parts.push(`For_(${names.join(',')})`)
    }
    if (filters.year?.length) {
      parts.push(`For_(${filters.year.join(',')})`)
    } else if (filters.start_date && filters.end_date) {
      parts.push(`For_(${filters.start_date}_To_${filters.end_date})`)
    }
    return parts.join('_')
  }

  const handleGenerateSavedReport = (record) => {
    const filters = record.filters || {}
    const savedReportFileName = buildSavedReportFileName(filters)
    handleSubmit({
      ...filters,
      report_type: filters.report_type || 'export-report',
      file_name: savedReportFileName,
      __savedReportId: record.id,
    })
  }

  const handleEditSavedReport = (record) => {
    handleLoadSavedReport(record.filters)
    setEditingReportId(record.id)
    setSaveReportName(record.name)
  }

  const reportOnLabels = {
    detail: 'Detail',
    marketTarget: 'Market Target',
    summary: 'Summary',
    exportCSV: 'Export CSV',
  }

  const savedReportColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Report Type',
      key: 'reportOn',
      width: 120,
      render: (_, record) => reportOnLabels[record.filters?.reportOn] || record.filters?.reportOn || '-',
    },
    {
      title: 'Order Type',
      key: 'orderType',
      width: 120,
      render: (_, record) => {
        const val = record.filters?.orderType
        if (val === 'both') return 'E-commerce & Phone'
        if (val === '1') return 'E-commerce'
        if (val === '2') return 'Phone'
        return val || '-'
      },
    },
    {
      title: 'Date Saved',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text) => dayjs(text).format('MMM D, YYYY h:mm A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleEditSavedReport(record)}>
            Edit
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleGenerateSavedReport(record)}
            disabled={savedReportLoading && savedReportLoading !== record.id}
            loading={savedReportLoading === record.id}
          >
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
      <Helmet title="Reports" />
      <div className="grid w-[500px] mx-auto mt-8 p-10 bg-white shadow rounded">
        <Typography.Title level={5} className="text-center !text-xl !mb-[35px]">
          Reports
        </Typography.Title>
        <form validate="true" className="generate-report" key={formKey}>
          <Row gutter={[0, 16]}>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                singleSelect
                name="reportFor"
                defaultValue={reportFor.reportFor}
                onChange={(val) => reportForHandleChange(val)}
                options={[
                  { label: 'Pay Per Order', value: 'payPerOrder' },
                  { label: 'Cash Buy', value: 'cashBuy' },
                ]}
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
                  { label: 'E-commerce & Phone', value: 'both' },
                  { label: 'E-commerce', value: '1' },
                  { label: 'Phone', value: '2' },
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
                  { label: 'Market Target', value: 'marketTarget' },
                  { label: 'Summary Report', value: 'summary' },
                  { label: 'Export CSV Report', value: 'exportCSV' },
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
                defaultValue={campaign?.campaign_id ? campaign.campaign_id.map((c) => { const opt = campaignOptions.find((o) => o.value === String(c)); return { label: opt?.label || c, value: String(c) } }) : ''}
                onChange={(val) => campaignHandleChange(val, 'campaign_id')}
                options={campaignOptions}
                className="!w-full"
                placeholder="Select Campaign"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="customer_id"
                defaultValue={customer?.customer_id ? customer.customer_id.map((c) => { const opt = customerOptions.find((o) => o.value === String(c)); return { label: opt?.label || c, value: String(c) } }) : ''}
                onChange={(val) => customerHandleChange(val, 'customer_id')}
                options={customerOptions}
                className="!w-full"
                placeholder="Select Customer"
              />
            </Col>
            <Col span={24} className="pb-[5px]">
              <MultiSelect
                name="affiliate_id"
                defaultValue={affiliate?.affiliate_id?.[0] || ''}
                onChange={(val) => affiliateHandleChange(val, 'affiliate_id')}
                options={affiliateOptions}
                className="!w-full"
                placeholder="Select Affiliates"
                singleSelect
              />
            </Col>
            {(orderType.orderType === 'both' || orderType.orderType == 1) && (
              <Col span={24} className="pb-[5px]">
                <MultiSelect
                  name="couponCodes"
                  defaultValue={couponCode?.couponCodes}
                  onChange={(val) => couponCodeHandleChange(val, 'couponCodes')}
                  options={couponCodeList}
                  className="!w-full"
                  placeholder="Select Coupon Codes"
                />
              </Col>
            )}
            {(orderType.orderType === 'both' || orderType.orderType == 2) && (
              <Col span={24} className="pb-[5px]">
                <MultiSelect
                  name="dialed"
                  defaultValue={dialed?.dialed}
                  onChange={(val) => dialedHandleChange(val, 'dialed')}
                  options={dialedPhoneList}
                  className="!w-full"
                  placeholder="Select Dialed Phone"
                />
              </Col>
            )}
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
                  <Select
                    onChange={monthHandleChange}
                    placeholder="Select Broadcast Month"
                    allowClear
                    className="w-full"
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
                      onChange={(date, dateString) =>
                        startDateHandleChange({ target: { name: 'start_date', value: dateString } })
                      }
                      className="w-full"
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
                      className="w-full"
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
        onCancel={() => { setSaveModalOpen(false); setSaveReportName(''); setEditingReportId(null) }}
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
            className="saved-reports-table"
            columns={savedReportColumns}
            dataSource={savedReports}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 850 }}
          />
        </div>
      )}
    </>
  )
}

EcommerceReport.layout = (page) => <Layout title="E-commerce Report">{page}</Layout>
export default EcommerceReport
