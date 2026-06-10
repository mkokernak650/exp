import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Button, Checkbox, Col, DatePicker, Input, Modal, Row, Select, Space, Spin, Table, Tabs, Tag, Typography } from 'antd'
import { DeleteOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'

import { usePage } from '@inertiajs/inertia-react'
import Layout from '../Layout/Layout'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'

dayjs.extend(quarterOfYear)

const { Title } = Typography
const { RangePicker } = DatePicker

const RECORD_KIND_OPTIONS = [
  { value: '', label: 'Sales + Returns' },
  { value: 'SALE', label: 'Sales only' },
  { value: 'RETURN', label: 'Returns only' },
]

const ORDER_TYPE_LABEL = { 1: 'E-commerce', 2: 'Phone', 3: 'Phone & E-commerce', 4: 'Block' }

const numberCell = (val) =>
  val === null || val === undefined || val === ''
    ? ''
    : Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const HomeShoppingReport = () => {
  const {
    campaigns,
    customers,
    affiliates,
    states,
    markets,
    stations,
    allCorporations = [],
    columnsData = [],
    savedReports = [],
  } = usePage().props

  const [savedReportsState, setSavedReportsState] = useState(savedReports)
  const [selectedSavedId, setSelectedSavedId] = useState(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveForm, setSaveForm] = useState({
    name: '',
    recurrence_frequency: '',
    recipients: '',
  })

  const corporationOptions = (allCorporations || []).map((c) => ({
    value: `${c.type}:${c.id}`,
    label: `${c.name} (${c.type_label})`,
    type: c.type,
    id: c.id,
  }))

  const [filters, setFilters] = useState({
    customer_id: [],
    campaign_id: [],
    stations: [],
    states: [],
    markets: [],
    record_kind: '',
    order_type: [],
    dateRange: null,
    corporation: null,
    apply_to_all_affiliates: true,
  })
  const [activeTab, setActiveTab] = useState('detail')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})

  // Persisted column order/visibility for the Detail tab (saved in TableDetails per user).
  const detailOptionKey = 'home-shopping-detail-report'
  const DEFAULT_DETAIL_COLUMN_DEFS = [
    { key: 'Create Date', title: 'Create Date', style: { width: 140 }, visible: true },
    { key: 'Dialed', title: 'Dialed (800#)', style: { width: 130 }, visible: true },
    { key: 'Order Type', title: 'Order Type', style: { width: 120 }, visible: true },
    { key: 'Promo Code', title: 'Promo Code', style: { width: 130 }, visible: true },
    { key: 'Tracking URL', title: 'Tracking URL', style: { width: 200 }, visible: true },
    { key: 'Order Date', title: 'Order Date', style: { width: 120 }, visible: true },
    { key: 'Order Time', title: 'Order Time', style: { width: 110 }, visible: true },
    { key: 'Order Number', title: 'Order Number', style: { width: 140 }, visible: true },
    { key: 'Telephone', title: 'Telephone', style: { width: 140 }, visible: true },
    { key: 'Ship City', title: 'Ship City', style: { width: 140 }, visible: true },
    { key: 'Ship State', title: 'Ship State', style: { width: 110 }, visible: true },
    { key: 'Zip', title: 'Zip', style: { width: 100 }, visible: true },
    { key: 'Order Description', title: 'Order Description', style: { width: 220 }, visible: true },
    { key: 'Total Sales', title: 'Total Sales', style: { width: 130 }, visible: true },
    { key: 'Commission', title: 'Commission', style: { width: 130 }, visible: true },
    { key: 'Net Sales', title: 'Net Sales', style: { width: 130 }, visible: true },
    { key: 'Record Kind', title: 'Kind', style: { width: 110 }, visible: true },
    { key: 'Station', title: 'Station', style: { width: 130 }, visible: true },
    { key: 'Market', title: 'Market', style: { width: 160 }, visible: true },
  ]
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [detailColumnState, setDetailColumnState] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[detailOptionKey]
      ? JSON.parse(columnsData[0])?.[detailOptionKey]
      : DEFAULT_DETAIL_COLUMN_DEFS
  )
  const detailDnd = useReportTableColumns({
    columns: detailColumnState,
    setColumns: setDetailColumnState,
    columnDetails,
    setColumnDetails,
    optionKey: detailOptionKey,
  })

  const stationOptions = useMemo(
    () => (stations || []).map((s) => ({ value: s, label: s })),
    [stations]
  )

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }))

  const handleGenerate = () => {
    setLoading(true)
    const corp = filters.corporation
      ? corporationOptions.find((opt) => opt.value === filters.corporation)
      : null
    const payload = {
      reportOn: activeTab,
      customer_id: filters.customer_id,
      campaign_id: filters.campaign_id,
      stations: filters.stations,
      states: filters.states,
      markets: filters.markets,
      record_kind: filters.record_kind || undefined,
      order_type: filters.order_type?.length ? filters.order_type : undefined,
      start_date: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      end_date: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      corporation_type: corp?.type,
      corporation_id: corp?.id,
      apply_to_all_affiliates: corp ? filters.apply_to_all_affiliates : undefined,
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

  // Per-column render hooks keyed by column.key — used to rebuild the column array after DnD reorder.
  const DETAIL_RENDERS = {
    'Order Type': (v) => ORDER_TYPE_LABEL[v] || v,
    'Total Sales': numberCell,
    Commission: numberCell,
    'Net Sales': numberCell,
    'Record Kind': (v) => (v === 'RETURN' ? <span className="text-red-600">RETURN</span> : v),
  }
  const detailColumns = detailColumnState
    .filter((c) => c.visible !== false)
    .map((c) => ({
      title: c.title,
      dataIndex: c.key,
      key: c.key,
      width: c.style?.width,
      render: DETAIL_RENDERS[c.key],
    }))

  const householdColumns = [
    { title: 'Create Date', dataIndex: 'create_date', key: 'create_date' },
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
    { title: 'Create Date', dataIndex: 'create_date', key: 'create_date' },
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

  const buildFiltersPayload = () => ({
    customer_id: filters.customer_id,
    campaign_id: filters.campaign_id,
    stations: filters.stations,
    states: filters.states,
    markets: filters.markets,
    record_kind: filters.record_kind,
    corporation: filters.corporation,
    apply_to_all_affiliates: filters.apply_to_all_affiliates,
    activeTab,
    dateRange: filters.dateRange
      ? [filters.dateRange[0].format('YYYY-MM-DD'), filters.dateRange[1].format('YYYY-MM-DD')]
      : null,
  })

  const applySavedReport = (saved) => {
    const f = saved.filters || {}
    setFilters({
      customer_id: f.customer_id || [],
      campaign_id: f.campaign_id || [],
      stations: f.stations || [],
      states: f.states || [],
      markets: f.markets || [],
      record_kind: f.record_kind || '',
      corporation: f.corporation || null,
      apply_to_all_affiliates: f.apply_to_all_affiliates !== false,
      dateRange: Array.isArray(f.dateRange) ? [dayjs(f.dateRange[0]), dayjs(f.dateRange[1])] : null,
    })
    if (f.activeTab) setActiveTab(f.activeTab)
    setSelectedSavedId(saved.id)
  }

  const handleSaveClick = () => {
    setSaveForm({
      name: '',
      recurrence_frequency: '',
      recipients: '',
    })
    setSaveModalOpen(true)
  }

  const persistSave = () => {
    if (!saveForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    const recipients = saveForm.recipients
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
    const payload = {
      name: saveForm.name.trim(),
      filters: buildFiltersPayload(),
      recurrence_frequency: saveForm.recurrence_frequency || null,
      recipients: recipients.length ? recipients : null,
    }
    axios
      .post(route('ecommerce.report.homeShopping.save'), payload)
      .then(() => {
        toast.success('Saved.')
        setSaveModalOpen(false)
        // Refresh in-place by re-pushing — Inertia would be cleaner; quick fix:
        window.location.reload()
      })
      .catch(() => toast.error('Save failed.'))
  }

  const deleteSaved = (id) => {
    const target = savedReportsState.find((r) => r.id === id)
    Modal.confirm({
      title: 'Delete saved report?',
      content: target
        ? `"${target.name}" will be removed. This cannot be undone.`
        : 'This cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () =>
        axios
          .delete(route('ecommerce.report.homeShopping.delete', id))
          .then(() => {
            toast.success(
              target ? `Saved report "${target.name}" deleted.` : 'Saved report deleted.'
            )
            setSavedReportsState((prev) => prev.filter((r) => r.id !== id))
            if (selectedSavedId === id) setSelectedSavedId(null)
          })
          .catch(() => toast.error('Delete failed.')),
    })
  }

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast.error('Generate the report before exporting.')
      return
    }
    const cols = columnsByTab[activeTab]
    const rows = data.map((row) => {
      const out = {}
      cols.forEach((c) => {
        out[c.title] = row[c.dataIndex]
      })
      return out
    })
    const summaryRows = Object.entries(summary || {}).map(([k, v]) => [k, v])

    const ws = XLSX.utils.json_to_sheet(rows)
    if (summaryRows.length) {
      XLSX.utils.sheet_add_aoa(ws, [[], ['Summary', '']], { origin: -1 })
      XLSX.utils.sheet_add_aoa(ws, summaryRows, { origin: -1 })
    }
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    const tabLabel = { detail: 'Detail', householdSummary: 'Household', vendorReport: 'Vendor' }[activeTab]
    FileSaver.saveAs(blob, `home_shopping_${tabLabel}_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`)
    toast.success('Report exported.')
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
              onChange={(v) => {
                setFilters((p) => ({
                  ...p,
                  customer_id: v,
                  // Drop campaigns that no longer belong to any selected customer.
                  campaign_id: p.campaign_id.filter((cid) => {
                    const c = (campaigns || []).find((x) => x.id === cid)
                    return !c || v.length === 0 || v.includes(c.customer_id)
                  }),
                }))
              }}
            />
          </Col>
          <Col span={6}>
            <label>Campaign</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder={
                filters.customer_id.length
                  ? 'Campaigns for selected customers'
                  : 'All campaigns'
              }
              options={(campaigns || [])
                .filter((c) =>
                  filters.customer_id.length === 0
                    ? true
                    : filters.customer_id.includes(c.customer_id)
                )
                .map((c) => ({ value: c.id, label: c.campaign_name }))}
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
          <Col span={6}>
            <label>Order Type</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="All order types"
              options={Object.entries(ORDER_TYPE_LABEL).map(([value, label]) => ({
                value: Number(value),
                label,
              }))}
              value={filters.order_type}
              onChange={(v) => setF('order_type', v)}
            />
          </Col>
          <Col span={6}>
            <label>State</label>
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="All states"
              options={(states || []).map((s) => ({ value: s.state, label: s.state }))}
              value={filters.states}
              onChange={(v) => setF('states', v)}
            />
          </Col>
          <Col span={6}>
            <label>Market (TV DMA)</label>
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full"
              placeholder="All markets"
              options={(markets || []).map((m) => ({ value: m.market, label: m.market }))}
              value={filters.markets}
              onChange={(v) => setF('markets', v)}
            />
          </Col>
          <Col span={12}>
            <label>Corporation (broadcast group / MSO / network)</label>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full"
              placeholder="All corporations"
              options={corporationOptions}
              value={filters.corporation || undefined}
              onChange={(v) => setF('corporation', v || null)}
            />
          </Col>
          {filters.corporation && (
            <Col span={12} className="flex items-end">
              <Checkbox
                checked={filters.apply_to_all_affiliates}
                onChange={(e) => setF('apply_to_all_affiliates', e.target.checked)}
              >
                Apply to all affiliates of this corporation
              </Checkbox>
            </Col>
          )}
          <Col span={12}>
            <label>Date Range (receive-date)</label>
            <RangePicker
              className="w-full"
              value={filters.dateRange}
              onChange={(v) => setF('dateRange', v)}
              presets={[
                { label: 'Last Week', value: [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                { label: 'This Quarter', value: [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
                { label: 'Last Quarter', value: [dayjs().subtract(1, 'quarter').startOf('quarter'), dayjs().subtract(1, 'quarter').endOf('quarter')] },
                { label: 'This Year', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
                { label: 'Last Year', value: [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')] },
              ]}
            />
          </Col>
          <Col span={12} className="flex items-end gap-2">
            <Button type="primary" onClick={handleGenerate} loading={loading}>
              Generate Report
            </Button>
            <Button onClick={() => exportToExcel()} disabled={!data || data.length === 0}>
              Export to Excel
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveClick}>
              Save Report
            </Button>
          </Col>
        </Row>

        {savedReportsState.length > 0 && (
          <Row className="mb-4 bg-white border rounded p-3">
            <Col span={24}>
              <div className="text-sm text-gray-600 mb-2">Saved Reports</div>
              <Space wrap>
                {savedReportsState.map((r) => (
                  <Tag.CheckableTag
                    key={r.id}
                    checked={selectedSavedId === r.id}
                    onChange={() => applySavedReport(r)}
                    className="!px-3 !py-1 !border !border-gray-300"
                  >
                    {r.name}
                    {r.recurrence_frequency && (
                      <MailOutlined className="ml-1" title={`Auto-email ${r.recurrence_frequency}`} />
                    )}
                    <DeleteOutlined
                      className="ml-2 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSaved(r.id)
                      }}
                    />
                  </Tag.CheckableTag>
                ))}
              </Space>
            </Col>
          </Row>
        )}

        <Modal
          title="Save Report"
          open={saveModalOpen}
          onCancel={() => setSaveModalOpen(false)}
          onOk={persistSave}
          okText="Save"
        >
          <div className="mb-3">
            <label className="block text-sm mb-1">Report Name *</label>
            <Input
              value={saveForm.name}
              onChange={(e) => setSaveForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Brux weekly summary"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Auto-email Frequency (optional)</label>
            <Select
              className="w-full"
              allowClear
              value={saveForm.recurrence_frequency || undefined}
              onChange={(v) =>
                setSaveForm((p) => ({ ...p, recurrence_frequency: v || '' }))
              }
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              placeholder="No auto-email"
            />
          </div>
          {saveForm.recurrence_frequency && (
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Recipients (comma-separated emails)
              </label>
              <Input.TextArea
                rows={2}
                value={saveForm.recipients}
                onChange={(e) => setSaveForm((p) => ({ ...p, recipients: e.target.value }))}
                placeholder="someone@example.com, other@example.com"
              />
            </div>
          )}
        </Modal>

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
          {activeTab === 'detail' ? (
            <ReportTableDndShell
              dndContextProps={detailDnd.dndContextProps}
              sortableContextProps={detailDnd.sortableContextProps}
            >
              <Table
                rowKey={(_, i) => i}
                dataSource={data}
                columns={detailDnd.withResizableColumns(detailColumns)}
                components={{ header: { cell: detailDnd.DraggableResizableHeader } }}
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 25 }}
                size="small"
              />
            </ReportTableDndShell>
          ) : (
            <Table
              rowKey={(_, i) => i}
              dataSource={data}
              columns={columnsByTab[activeTab]}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 25 }}
              size="small"
            />
          )}
        </Spin>
      </div>
    </>
  )
}

HomeShoppingReport.layout = (page) => <Layout title="Home Shopping Report">{page}</Layout>
export default HomeShoppingReport
