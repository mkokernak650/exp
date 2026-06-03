import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Button, Col, DatePicker, Row, Select, Spin, Table, Tabs, Typography } from 'antd'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react'
import Layout from '../Layout/Layout'

const { Title } = Typography
const { RangePicker } = DatePicker

const RECORD_KIND_OPTIONS = [
  { value: '', label: 'Sales + Returns' },
  { value: 'SALE', label: 'Sales only' },
  { value: 'RETURN', label: 'Returns only' },
]

const ORDER_TYPE_LABEL = { 1: 'E-commerce', 2: 'Phone', 3: 'Phone & E-commerce' }

const numberCell = (val) =>
  val === null || val === undefined || val === ''
    ? ''
    : Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const HomeShoppingReport = () => {
  const { campaigns, customers, affiliates, states, markets, stations } = usePage().props

  const [filters, setFilters] = useState({
    customer_id: [],
    campaign_id: [],
    stations: [],
    record_kind: '',
    dateRange: null,
  })
  const [activeTab, setActiveTab] = useState('detail')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})

  const stationOptions = useMemo(
    () => (stations || []).map((s) => ({ value: s, label: s })),
    [stations]
  )

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }))

  const handleGenerate = () => {
    setLoading(true)
    const payload = {
      reportOn: activeTab,
      customer_id: filters.customer_id,
      campaign_id: filters.campaign_id,
      stations: filters.stations,
      record_kind: filters.record_kind || undefined,
      start_date: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      end_date: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
    }
    axios
      .post(route('ecommerce.report.homeShopping.generate'), payload)
      .then((res) => {
        setData(res.data.data || [])
        setSummary(res.data.summary || {})
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to generate report')
        setLoading(false)
      })
  }

  const detailColumns = [
    { title: 'Dialed (800#)', dataIndex: 'Dialed', key: 'Dialed' },
    {
      title: 'Order Type',
      dataIndex: 'Order Type',
      key: 'Order Type',
      render: (v) => ORDER_TYPE_LABEL[v] || v,
    },
    { title: 'Promo Code', dataIndex: 'Promo Code', key: 'Promo Code' },
    { title: 'Tracking URL', dataIndex: 'Tracking URL', key: 'Tracking URL' },
    { title: 'Order Date', dataIndex: 'Order Date', key: 'Order Date' },
    { title: 'Order Time', dataIndex: 'Order Time', key: 'Order Time' },
    { title: 'Order Number', dataIndex: 'Order Number', key: 'Order Number' },
    { title: 'Telephone', dataIndex: 'Telephone', key: 'Telephone' },
    { title: 'Ship City', dataIndex: 'Ship City', key: 'Ship City' },
    { title: 'Ship State', dataIndex: 'Ship State', key: 'Ship State' },
    { title: 'Zip', dataIndex: 'Zip', key: 'Zip' },
    { title: 'Order Description', dataIndex: 'Order Description', key: 'Order Description' },
    { title: 'Total Sales', dataIndex: 'Total Sales', key: 'Total Sales', render: numberCell },
    { title: 'Commission', dataIndex: 'Commission', key: 'Commission', render: numberCell },
    { title: 'Net Sales', dataIndex: 'Net Sales', key: 'Net Sales', render: numberCell },
    {
      title: 'Kind',
      dataIndex: 'Record Kind',
      key: 'Record Kind',
      render: (v) => (v === 'RETURN' ? <span className="text-red-600">RETURN</span> : v),
    },
    { title: 'Station', dataIndex: 'Station', key: 'Station' },
    { title: 'Market', dataIndex: 'Market', key: 'Market' },
  ]

  const householdColumns = [
    { title: 'Customer', dataIndex: 'customer_id', key: 'customer_id' },
    { title: 'Campaign', dataIndex: 'campaign_id', key: 'campaign_id' },
    { title: 'Channel ID', dataIndex: 'channel_id', key: 'channel_id' },
    { title: 'Phone (ANI)', dataIndex: 'ani', key: 'ani' },
    { title: 'Ship Zip', dataIndex: 'shipping_zip', key: 'shipping_zip' },
    { title: 'Ship City', dataIndex: 'shipping_city', key: 'shipping_city' },
    { title: 'Ship State', dataIndex: 'shipping_state', key: 'shipping_state' },
    { title: 'Gross Sales', dataIndex: 'gross_sales', key: 'gross_sales', render: numberCell },
    { title: 'Returns', dataIndex: 'returns_amount', key: 'returns_amount', render: numberCell },
    { title: 'Net Sales', dataIndex: 'net_sales', key: 'net_sales', render: numberCell },
    { title: 'Vendor Fee', dataIndex: 'net_vendor_fee', key: 'net_vendor_fee', render: numberCell },
    {
      title: 'ConsumerEXP Fee',
      dataIndex: 'net_consumerexp_fee',
      key: 'net_consumerexp_fee',
      render: numberCell,
    },
    {
      title: 'Net Revenue',
      dataIndex: 'net_revenue_to_vendor',
      key: 'net_revenue_to_vendor',
      render: numberCell,
    },
  ]

  const vendorColumns = [
    { title: 'Market', dataIndex: 'market', key: 'market' },
    { title: 'Station', dataIndex: 'station', key: 'station' },
    { title: 'Gross Sales', dataIndex: 'gross_sales', key: 'gross_sales', render: numberCell },
    { title: 'Returns', dataIndex: 'returns_amount', key: 'returns_amount', render: numberCell },
    { title: 'Net Sales', dataIndex: 'net_sales', key: 'net_sales', render: numberCell },
    { title: 'Vendor Fee', dataIndex: 'net_vendor_fee', key: 'net_vendor_fee', render: numberCell },
    {
      title: 'ConsumerEXP Fee',
      dataIndex: 'net_consumerexp_fee',
      key: 'net_consumerexp_fee',
      render: numberCell,
    },
    { title: 'Sales #', dataIndex: 'sale_count', key: 'sale_count' },
    { title: 'Returns #', dataIndex: 'return_count', key: 'return_count' },
  ]

  const columnsByTab = {
    detail: detailColumns,
    householdSummary: householdColumns,
    vendorReport: vendorColumns,
  }

  return (
    <>
      <Helmet title="Home Shopping Report" />
      <div className="p-6">
        <Title level={4}>Home Shopping Sales &amp; Returns Report</Title>

        <Row gutter={[16, 16]} className="mb-4">
          <Col span={6}>
            <label>Customer</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="All customers"
              options={(customers || []).map((c) => ({
                value: c.id,
                label: c.customer_name,
              }))}
              value={filters.customer_id}
              onChange={(v) => setF('customer_id', v)}
            />
          </Col>
          <Col span={6}>
            <label>Campaign</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="All campaigns"
              options={(campaigns || []).map((c) => ({
                value: c.id,
                label: c.campaign_name,
              }))}
              value={filters.campaign_id}
              onChange={(v) => setF('campaign_id', v)}
            />
          </Col>
          <Col span={6}>
            <label>Station</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="All stations"
              options={stationOptions}
              value={filters.stations}
              onChange={(v) => setF('stations', v)}
            />
          </Col>
          <Col span={6}>
            <label>Record Kind</label>
            <Select
              className="w-full"
              options={RECORD_KIND_OPTIONS}
              value={filters.record_kind}
              onChange={(v) => setF('record_kind', v)}
            />
          </Col>
          <Col span={12}>
            <label>Date Range (receive-date)</label>
            <RangePicker
              className="w-full"
              value={filters.dateRange}
              onChange={(v) => setF('dateRange', v)}
            />
          </Col>
          <Col span={12} className="flex items-end">
            <Button type="primary" onClick={handleGenerate} loading={loading}>
              Generate Report
            </Button>
          </Col>
        </Row>

        {summary && Object.keys(summary).length > 0 && (
          <Row gutter={[16, 8]} className="mb-4 bg-gray-50 p-4 rounded">
            {Object.entries(summary).map(([k, v]) => (
              <Col span={6} key={k}>
                <div className="text-xs text-gray-500">{k}</div>
                <div className="text-lg font-semibold">{numberCell(v)}</div>
              </Col>
            ))}
          </Row>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            { key: 'detail', label: 'Detail' },
            { key: 'householdSummary', label: 'Household Summary' },
            { key: 'vendorReport', label: 'Vendor / Station / Market' },
          ]}
        />

        <Spin spinning={loading}>
          <Table
            rowKey={(_, i) => i}
            dataSource={data}
            columns={columnsByTab[activeTab]}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 25 }}
            size="small"
          />
        </Spin>
      </div>
    </>
  )
}

HomeShoppingReport.layout = (page) => <Layout title="Home Shopping Report">{page}</Layout>
export default HomeShoppingReport
