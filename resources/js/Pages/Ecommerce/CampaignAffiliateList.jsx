import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { columns as defaultColumns } from './Helpers/CampaignAffiliateListProps'
import { Button, Table, Select, Pagination } from 'antd'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CampaignAffiliateList = () => {
  const { affiliateList, campaignId, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const showColumnRef = useRef()
  const [totalRecords, setTotalRecords] = useState(affiliateList.total)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [orderByValue, setOrderByValue] = useState('affiliates.affiliate_name@ASC')

  const mapDataArr = (data) => {
    return data.data.map((item) => ({
      affiliate_name: item.affiliate_name,
      affiliate_fee_type: item.affiliate_fee_type,
      market: item.market,
      tv_households: item.tv_households,
      created_at: item.created_at,
      id: item.id,
      key: item.id,
    }))
  }

  const dataArray = mapDataArr(affiliateList)

  const [data, setData] = useState(dataArray)

  const optionKey = 'campaign-affiliate-list'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const [columns, setColumns] = useState(defaultColumns)
  const {
    DraggableResizableHeader,
    withResizableColumns,
    dndContextProps,
    sortableContextProps,
  } = useReportTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
    })
  }

  const orderByOptions = [
    { label: 'Affiliate Name (Ascending)', value: 'affiliates.affiliate_name@ASC' },
    { label: 'Affiliate Name (Descending)', value: 'affiliates.affiliate_name@DESC' },
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
    { label: 'Created At (Ascending)', value: 'affiliates.created_at@ASC' },
    { label: 'Created At (Descending)', value: 'affiliates.created_at@DESC' },
  ]

  const handleColumns = () => {
    setShowColumns(true)
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showColumns])

  const getSearchingData = async (page = 1) => {
    setCurerentPage(page)
    setTableLoading(true)
    await axios
      .get(
        `/ecommerce-campaigns-affiliates/${campaignId}?page=` +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&orderBy=' +
          orderByValue
      )
      .then((res) => {
        setTotalRecords(res.data.total)
        setTableLoading(false)
        setData(mapDataArr(res.data))
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, orderByValue])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`/ecommerce-campaigns-affiliates/export/${campaignId}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while exporting file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell')
      .map((col) => {
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter:
            col.dataType === 'number'
              ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
              : col.dataType === 'date'
                ? (a, b) => new Date(a[col.key] || 0) - new Date(b[col.key] || 0)
                : col.dataType === 'string'
                  ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                  : undefined,
        }
        if (col.key === 'affiliate_fee_type') {
          base.render = (value) => (value == 1 ? 'Payout Per Order' : 'Cash Buy')
        }
        return base
      })
  )

  return (
    <>
      <Helmet title="Campaign Affiliate List" />
      <div className="selection-demo">
        <div className="table-top-flex-start">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
            </div>
            <Button
              type="primary"
              onClick={exportHandler}
              disabled={totalRecords === 0}
              className="w-auto capitalize text-sm"
              loading={loading}
            >
              Export
            </Button>
          </div>
          <div className="top-left">
            <MultiSelect
              options={orderByOptions}
              onChange={(value) => setOrderByValue(value)}
              placeholder="Order By"
              className="!w-full"
              defaultValue={orderByValue}
              singleSelect
            />
          </div>
          {showColumns ? (
            <div className="column-settings" ref={showColumnRef}>
              <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
            </div>
          ) : (
            ''
          )}
        </div>
        <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          loading={tableLoading}
          pagination={false}
          components={{
            header: {
              cell: DraggableResizableHeader,
            },
          }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
          locale={{ emptyText: 'No Data Found' }}
        />
        </ReportTableDndShell>
        <div className="table-bottom">
          <Select
            value={itemPerPage}
            onChange={(value) => itemPerPageHandleChange(value)}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
          />
          <Pagination
            current={curerentPage}
            total={totalRecords}
            pageSize={itemPerPage}
            onChange={getSearchingData}
            showSizeChanger={false}
          />
        </div>
      </div>
    </>
  )
}

CampaignAffiliateList.layout = (page) => <Layout title="Campaign Affiliate List">{page}</Layout>
export default CampaignAffiliateList
