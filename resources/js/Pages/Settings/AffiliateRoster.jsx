import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Badge, Button, Input, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { usePage } from '@inertiajs/inertia-react'
import Layout from '../Layout/Layout'

const { Title } = Typography

const STATUS_COLORS = {
  draft: 'default',
  pending: 'gold',
  sent: 'blue',
  accepted: 'green',
  declined: 'red',
  void: 'orange',
  canceled: 'volcano',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.keys(STATUS_COLORS).map((s) => ({ value: s, label: s })),
]

const money = (v) =>
  v === null || v === undefined
    ? ''
    : '$' +
      Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const AffiliateRoster = () => {
  const { affiliate, rows } = usePage().props
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hideZeroActivity, setHideZeroActivity] = useState(false)

  const filtered = useMemo(() => {
    return (rows || []).filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (hideZeroActivity && !r.has_activity) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !(r.io_no || '').toLowerCase().includes(q) &&
          !(r.customer || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [rows, search, statusFilter, hideZeroActivity])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.gross += r.gross_sales || 0
        acc.returns += r.returns_amount || 0
        acc.net += r.net_sales || 0
        acc.sales += r.sale_count || 0
        acc.ret += r.return_count || 0
        return acc
      },
      { gross: 0, returns: 0, net: 0, sales: 0, ret: 0 }
    )
  }, [filtered])

  const columns = [
    {
      title: 'IO',
      dataIndex: 'io_no',
      key: 'io_no',
      sorter: (a, b) => a.io_id - b.io_id,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>,
    },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Accepted', dataIndex: 'accepted_at', key: 'accepted_at' },
    {
      title: 'Cancel @',
      dataIndex: 'canceled_at',
      key: 'canceled_at',
      render: (v) =>
        v ? (
          <Tooltip title="Cancellation effective date">
            <span className="text-red-600">{v}</span>
          </Tooltip>
        ) : (
          ''
        ),
    },
    { title: 'Gross Sales', dataIndex: 'gross_sales', key: 'gross_sales', render: money, align: 'right' },
    {
      title: 'Returns',
      dataIndex: 'returns_amount',
      key: 'returns_amount',
      render: money,
      align: 'right',
    },
    { title: 'Net Sales', dataIndex: 'net_sales', key: 'net_sales', render: money, align: 'right' },
    { title: 'Sales #', dataIndex: 'sale_count', key: 'sale_count', align: 'right' },
    { title: 'Returns #', dataIndex: 'return_count', key: 'return_count', align: 'right' },
    {
      title: 'Activity',
      dataIndex: 'has_activity',
      key: 'has_activity',
      render: (v) =>
        v ? (
          <Badge status="success" text="active" />
        ) : (
          <Tooltip title="No sales or returns in this IO window — possible technical outage">
            <Badge status="default" text="zero" />
          </Tooltip>
        ),
    },
  ]

  return (
    <>
      <Helmet title={`Roster — ${affiliate?.affiliate_name || 'Affiliate'}`} />
      <div className="p-6">
        <Title level={4} className="!mb-1">
          {affiliate?.affiliate_name}
          {affiliate?.market ? ` — ${affiliate.market}` : ''} — IO Roster
        </Title>
        <div className="text-sm text-gray-500 mb-4">
          Every IO this affiliate is on (direct, pivot, or corp), with sales scoped to each IO
          window. Zero-activity rows shown by default to surface possible technical outages.
        </div>

        <Space className="mb-3 flex-wrap" size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search IO / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            style={{ width: 180 }}
          />
          <Button onClick={() => setHideZeroActivity((v) => !v)}>
            {hideZeroActivity ? 'Show all rows' : 'Hide zero-activity rows'}
          </Button>
        </Space>

        <div className="grid grid-cols-5 gap-3 mb-4 bg-gray-50 p-3 rounded text-sm">
          <div>
            <div className="text-xs text-gray-500">Gross Sales</div>
            <div className="font-semibold">{money(totals.gross)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Returns</div>
            <div className="font-semibold">{money(totals.returns)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Net Sales</div>
            <div className="font-semibold">{money(totals.net)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Sales</div>
            <div className="font-semibold">{totals.sales}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Returns #</div>
            <div className="font-semibold">{totals.ret}</div>
          </div>
        </div>

        <Table
          rowKey="key"
          size="small"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 25 }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  )
}

AffiliateRoster.layout = (page) => <Layout title="Affiliate Roster">{page}</Layout>
export default AffiliateRoster
