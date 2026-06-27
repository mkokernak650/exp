import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, InputNumber, Select, Table, TimePicker, Tooltip, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const TIME_ZONES = ['EST', 'CST', 'MST', 'PST', 'AKST', 'HST']

// TV industry buys in quarters (3-month non-cancellable). Each quarter covers
// 13 weeks of recurrence; start/end dates are the calendar quarter boundaries.
const QUARTER_DEFS = {
  Q1: { startMonth: 0, label: 'Q1 — Jan 1 to Mar 31' },
  Q2: { startMonth: 3, label: 'Q2 — Apr 1 to Jun 30' },
  Q3: { startMonth: 6, label: 'Q3 — Jul 1 to Sep 30' },
  Q4: { startMonth: 9, label: 'Q4 — Oct 1 to Dec 31' },
}
const QUARTER_WEEKS = 13

const currentYear = () => dayjs().year()
const yearOptions = () => {
  const y = currentYear()
  return [y, y + 1, y + 2, y + 3].map((v) => ({ value: v, label: String(v) }))
}

const dayName = (date) => (date ? dayjs(date).format('ddd') : '')

const CashBuyScheduleEditor = ({ spots, setSpots, affiliateOptions = [] }) => {
  const [draft, setDraft] = useState({
    spot_date: null,
    spot_time: null,
    affiliate_id: null,
    weeks_count: 1,
    time_zone: 'EST',
    amount: 0,
  })
  const [checking, setChecking] = useState(false)
  const [quarter, setQuarter] = useState(null)
  const [quarterYear, setQuarterYear] = useState(currentYear())

  const applyQuarter = () => {
    if (!quarter) {
      toast.error('Pick a quarter first.')
      return
    }
    const def = QUARTER_DEFS[quarter]
    const start = dayjs().year(quarterYear).month(def.startMonth).date(1).startOf('day')
    setDraft((d) => ({ ...d, spot_date: start, weeks_count: QUARTER_WEEKS }))
    toast.success(`${quarter} ${quarterYear} applied — flight dates: ${def.label.split('— ')[1]} ${quarterYear}`)
  }

  const affOpts = useMemo(
    () =>
      (affiliateOptions || []).map((opt) => {
        const id = parseInt((opt.value || '').split('+aEmail+')[0], 10)
        const label = (opt.label || '').replace(/ — .*$/, '')
        const cashBuy = parseFloat(opt.cash_buy || 0)
        return { value: id, label, cashBuy }
      }),
    [affiliateOptions]
  )

  // Single affiliate: auto-select + auto-fill amount, hide picker
  useEffect(() => {
    if (affOpts.length === 1) {
      setDraft((d) => ({ ...d, affiliate_id: affOpts[0].value, amount: affOpts[0].cashBuy }))
    }
  }, [affOpts])

  const resetDraft = () =>
    setDraft({
      spot_date: null,
      spot_time: null,
      affiliate_id: affOpts.length === 1 ? affOpts[0].value : null,
      weeks_count: 1,
      time_zone: 'EST',
      amount: affOpts.length === 1 ? affOpts[0].cashBuy : 0,
    })

  const expandRows = (input) => {
    const start = dayjs(input.spot_date)
    const rows = []
    for (let i = 0; i < input.weeks_count; i++) {
      const d = start.add(i, 'week')
      rows.push({
        spot_date: d.format('YYYY-MM-DD'),
        spot_time: input.spot_time.format('HH:mm') + ':00',
        affiliate_id: input.affiliate_id,
        day_of_week: d.format('ddd'),
        time_zone: input.time_zone,
        amount: input.amount,
      })
    }
    return rows
  }

  const checkAndAdd = () => {
    if (!draft.spot_date || !draft.spot_time || !draft.affiliate_id) {
      toast.error('Pick date, time, and affiliate first.')
      return
    }
    setChecking(true)
    axios
      .post(route('insertion.order.cash.buy.check.slot'), {
        spots: [
          {
            spot_date: dayjs(draft.spot_date).format('YYYY-MM-DD'),
            spot_time: dayjs(draft.spot_time).format('HH:mm'),
            affiliate_id: draft.affiliate_id,
            weeks_count: draft.weeks_count,
            day_of_week: dayjs(draft.spot_date).format('ddd'),
            time_zone: draft.time_zone,
            amount: draft.amount,
          },
        ],
      })
      .then((res) => {
        if (!res.data.success) {
          const c = res.data.collisions || []
          toast.error(
            `Slot conflict on ${c.length} date(s). First: ${c[0]?.spot_date} ${c[0]?.spot_time}`
          )
          return
        }
        const newRows = expandRows(draft)
        setSpots([...spots, ...newRows])
        toast.success(`${newRows.length} spot(s) added to the schedule.`)
        resetDraft()
      })
      .catch(() => toast.error('Slot check failed.'))
      .finally(() => setChecking(false))
  }

  const removeRow = (idx) => setSpots(spots.filter((_, i) => i !== idx))

  const columns = [
    { title: 'Date', dataIndex: 'spot_date' },
    { title: 'Day', dataIndex: 'day_of_week' },
    { title: 'Time', dataIndex: 'spot_time', render: (v) => v?.slice(0, 5) },
    { title: 'Zone', dataIndex: 'time_zone' },
    {
      title: 'Affiliate',
      dataIndex: 'affiliate_id',
      render: (id) => affOpts.find((a) => a.value === id)?.label || id,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (v) => '$' + Number(v || 0).toFixed(2),
    },
    {
      title: '',
      render: (_, __, idx) => (
        <Tooltip title="Remove">
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRow(idx)} />
        </Tooltip>
      ),
    },
  ]

  return (
    <div className="cash-buy-editor mt-4 border rounded p-3 bg-gray-50">
      <Typography.Text strong>Cash Buy Schedule (optional)</Typography.Text>
      <div className="text-xs text-gray-500 mb-2">
        Each row is a single 30/60-second spot. Recurrence repeats the slot weekly for the chosen
        number of weeks (1–52). The system blocks duplicates on the same date + time + affiliate
        across all active IOs.
      </div>

      <div className="grid grid-cols-4 gap-2 items-end mb-2 p-2 bg-white border rounded">
        <div className="col-span-1">
          <label className="block text-xs">Media Buy Period (optional)</label>
          <Select
            className="w-full"
            allowClear
            placeholder="Pick a quarter"
            value={quarter}
            onChange={(v) => setQuarter(v || null)}
            options={Object.entries(QUARTER_DEFS).map(([k, d]) => ({ value: k, label: d.label }))}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs">Year</label>
          <Select
            className="w-full"
            value={quarterYear}
            onChange={setQuarterYear}
            options={yearOptions()}
          />
        </div>
        <div className="col-span-1">
          <Button onClick={applyQuarter} disabled={!quarter}>
            Apply Quarter
          </Button>
        </div>
        <div className="col-span-1 text-xs text-gray-500 self-center">
          Auto-fills Start Date + 13-week recurrence. Override fields below for custom windows.
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 items-end">
        <div className="col-span-1">
          <label className="block text-xs">Date</label>
          <DatePicker
            value={draft.spot_date}
            onChange={(v) => setDraft({ ...draft, spot_date: v })}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs">Time</label>
          <TimePicker
            format="HH:mm"
            value={draft.spot_time}
            onChange={(v) => setDraft({ ...draft, spot_time: v })}
            className="w-full"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs">Day</label>
          <div className="border rounded px-2 py-1 bg-white text-gray-600">
            {dayName(draft.spot_date) || '—'}
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-xs">Zone</label>
          <Select
            className="w-full"
            value={draft.time_zone}
            onChange={(v) => setDraft({ ...draft, time_zone: v })}
            options={TIME_ZONES.map((z) => ({ value: z, label: z }))}
          />
        </div>
        {affOpts.length !== 1 && (
          <div className="col-span-1">
            <label className="block text-xs">Affiliate</label>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              placeholder="Pick affiliate"
              value={draft.affiliate_id}
              onChange={(v) => {
                const rate = affOpts.find((a) => a.value === v)?.cashBuy ?? 0
                setDraft({ ...draft, affiliate_id: v, amount: rate })
              }}
              options={affOpts}
            />
          </div>
        )}
        <div className="col-span-1">
          <label className="block text-xs">Weeks (1–52)</label>
          <InputNumber
            className="w-full"
            min={1}
            max={52}
            value={draft.weeks_count}
            onChange={(v) => setDraft({ ...draft, weeks_count: v || 1 })}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs">Amount ($)</label>
          <InputNumber
            className="w-full"
            min={0}
            step={5}
            value={draft.amount}
            onChange={(v) => setDraft({ ...draft, amount: v || 0 })}
          />
        </div>
      </div>

      <div className="mt-2">
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={checkAndAdd}
          loading={checking}
          disabled={!draft.spot_date || !draft.spot_time || !draft.affiliate_id}
        >
          Add to schedule
        </Button>
      </div>

      {spots.length > 0 && (
        <Table
          size="small"
          className="mt-3"
          rowKey={(_, i) => i}
          dataSource={spots}
          columns={columns}
          pagination={false}
        />
      )}
    </div>
  )
}

export default CashBuyScheduleEditor
