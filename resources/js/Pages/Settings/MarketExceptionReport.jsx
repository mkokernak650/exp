import Layout from '../Layout/Layout'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import {
  Table,
  Tooltip,
  Button,
  Select,
  Input,
  Radio,
  DatePicker,
  Pagination,
} from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import EditModalFooter from '@/Shared/EditModalFooter'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { countActiveFilters, sanitizeFilterValue } from '@/Helpers/ActiveFilterCount'
import { fields, filter, columns as defaultColumns } from './Helpers/MarketExceptionReportProps'

function mapMarketExceptionRows(items, page, perPage) {
  const offset = (page - 1) * perPage
  return (items || []).map((item, index) => ({
    edit: item.id,
    sl: offset + index + 1,
    campaign: item?.campaign?.campaign_name,
    market_id: item.market_name || item.market_id,
    state: item.state,
    call_type: item.call_type,
    start_date: item.start_date,
    ranks: item.ranks,
    nielsen_households: item.nielsen_households,
    id: item.id,
    key: item.id,
    campaign_id: item.campaign_id,
  }))
}

const MarketExceptionReport = () => {
  const { marketExceptions, campaignId, allCampaigns, allStates, allMarkets, columnsData } =
    usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [open, setOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [exportModal, setExportModal] = useState({ open: false })
  const [type, setType] = useState('xlsx')
  const [loading, setLoading] = useState(false)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(marketExceptions.total || 0)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')

  const handleEditChange = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'campaign_id' && value != null && value !== '') {
      const n = Number(value)
      v = Number.isFinite(n) ? n : value
    }
    setEditData({ ...editData, [name]: v })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('market.exception.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  campaign: editData.campaign,
                  market_id: editData.market_id,
                  state: editData.state,
                  ranks: editData.ranks,
                  nielsen_households: editData.nielsen_households,
                  call_type: editData.call_type,
                  start_date: editData.start_date,
                }
              }
              return item
            })
          )
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.success(res.data.msg)
        } else {
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setEditData()
        handleCloseModal(setShowEditModal)
      })
  }

  const optionKey = 'market-exception-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
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

  const [data, setData] = useState(() =>
    mapMarketExceptionRows(marketExceptions?.data || [], 1, 10)
  )

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
    })
  }

  const handleReorderColumns = (reordered) => {
    setColumns(reordered)
    addTableDetails(columnDetails, setColumnDetails, reordered, optionKey)
  }

  const [filterValue, changeFilter] = useState(filter)
  const activeFilterJSON = useMemo(
    () => JSON.stringify(sanitizeFilterValue(filterValue)),
    [filterValue]
  )

  const [searchSidebar, setSearchSidebar] = useState(false)
  const activeFilterCount = countActiveFilters(filterValue)

  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const deleteHandler = () => {
    axios
      .post(route('market.exception.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          getSearchingData(currentPage)
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setShowDeleteModal({ open: false })
      })
  }

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      const rawCampaignId = item.campaign_id
      const campaignIdNum =
        rawCampaignId != null && rawCampaignId !== ''
          ? Number(rawCampaignId)
          : undefined
      setEditData({
        ...item,
        campaign_id: Number.isFinite(campaignIdNum) ? campaignIdNum : rawCampaignId,
      })
      setShowEditModal({ open: true })
    }
  }

  const handleToolbarEdit = () => {
    handleEdit(selectedRowKeys[0])
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const getSearchingData = async (page = 1) => {
    setCurrentPage(page)
    await axios.get('/market-exception-report', {
      params: { page, itemPerPage, filteredValue: activeFilterJSON, sortField, sortOrder },
    })
      .then((res) => {
        setData(mapMarketExceptionRows(res.data.data || [], page, itemPerPage))
        setTotalRecords(res.data.total ?? 0)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
    setCurrentPage(1)
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

  useEffect(() => {
    const syncTablePanelHeight = () => {
      if (tablePanelRef.current) {
        setTablePanelHeight(tablePanelRef.current.offsetHeight)
      }
    }

    syncTablePanelHeight()
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      syncTablePanelHeight()
    })
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [searchSidebar, data.length])

  useEffect(() => {
    getSearchingData(1)
  }, [itemPerPage, activeFilterJSON, sortField, sortOrder])

  const handleExportTypeChange = (e) => {
    setType(e.target.value)
  }

  const openExportModal = () => {
    setExportModal({ open: true })
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const baseUrl = window.location.origin
  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`${baseUrl}/market-exception-export/${type}/${campaignId}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 204) {
          toast.error('No data found for the selected criteria')
        }
        if (res.status === 200) {
          setExportModal({ open: false })
          triggerExportLink(res.request.responseURL)
          toast.success('Exported Successfully')
          setOpen(true)
        } else {
          toast.error('Exporting failed')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const TableToolbar = () => {
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined style={toolbarIconStyle} />}
            onClick={() => handleOpenModal(setShowDeleteModal)}
          />
        </Tooltip>
        {selectedRowKeys.length === 1 && (
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={toolbarIconStyle} />}
              onClick={handleToolbarEdit}
            />
          </Tooltip>
        )}
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
    },
  }

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter.order) {
      setSortField(sorter.field)
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSortField('')
      setSortOrder('')
    }
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
      .map((col) => {
        const hasSorter = col.dataType === 'number' || col.dataType === 'date' || col.dataType === 'string'
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter: hasSorter ? true : undefined,
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="Market Exception Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              {data.length > 0 && (
                <button
                  type="button"
                  className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                  onClick={handleFilter}
                  aria-label="Open filters"
                >
                  <Filter />
                  {activeFilterCount ? (
                    <span className="filter-count">{activeFilterCount}</span>
                  ) : (
                    ''
                  )}
                </button>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="w-[130px] capitalize text-sm"
                onClick={openExportModal}
                disabled={totalRecords === 0}
              >
                Export
              </Button>
            </div>
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} onReorderColumns={handleReorderColumns} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <div className={`report-content-layout ${searchSidebar ? 'with-filter' : ''}`}>
          <div
            className={`search-sidebar report-filter-sidebar ${searchSidebar ? 'filter-open' : 'filter-closed'}`}
            style={
              tablePanelHeight
                ? { height: `${tablePanelHeight}px`, maxHeight: `${tablePanelHeight}px` }
                : undefined
            }
          >
            <div className="top-element">
              <CustomFilter
                fields={fields}
                filterValue={filterValue}
                setFilterValue={changeFilter}
              />
            </div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
            <Table
              columns={antdColumns}
              components={{ header: { cell: DraggableResizableHeader } }}
              dataSource={data}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={false}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
              onChange={handleTableChange}
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
                current={currentPage}
                total={totalRecords}
                pageSize={itemPerPage}
                onChange={(page) => getSearchingData(page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Market Exception'}
        onClose={() => handleCloseModal(setShowEditModal)}
        footer={
          <EditModalFooter
            onCancel={() => handleCloseModal(setShowEditModal)}
            onSubmit={handleEditSubmit}
          />
        }
      >
        <div className="mt-4">
          <form onSubmit={(e) => e.preventDefault()}>
            <span>Select Campaign</span>
            <Select
              placeholder="Select Campaign"
              onChange={(value) => handleEditChange({ target: { name: 'campaign_id', value } })}
              className="w-full mb-4 mt-2"
              value={(() => {
                const v = editData?.campaign_id
                if (v == null || v === '') return undefined
                const n = Number(v)
                return Number.isFinite(n) ? n : undefined
              })()}
            >
              {allCampaigns.map((option, indx) => (
                <Select.Option key={option.id ?? indx} value={Number(option.id)}>
                  {option.campaign_name}
                </Select.Option>
              ))}
            </Select>
            <span>Select State</span>
            <Select
              placeholder="Select State"
              onChange={(value) => handleEditChange({ target: { name: 'state', value } })}
              className="w-full mb-4 mt-2"
              value={editData?.state ? editData.state : undefined}
            >
              {allStates.map((option, indx) => (
                <Select.Option key={indx} value={option.state}>
                  {option.state}
                </Select.Option>
              ))}
            </Select>
            <span>Select Market</span>
            <Select
              placeholder="Select Market"
              onChange={(value) => handleEditChange({ target: { name: 'market_id', value } })}
              className="w-full mb-4 mt-2"
              value={editData?.market_id}
            >
              {allMarkets.map((option, indx) => (
                <Select.Option key={indx} value={option.market}>
                  {option.market}
                </Select.Option>
              ))}
            </Select>
            <span>Call Type</span>
            <Select
              placeholder="Call Type"
              onChange={(value) => handleEditChange({ target: { name: 'call_type', value } })}
              className="w-full mb-4 mt-2"
              value={editData?.call_type ? editData.call_type : undefined}
            >
              <Select.Option value="L">Landline (L)</Select.Option>
              <Select.Option value="W">Wireless (W)</Select.Option>
              <Select.Option value="B">Both L & W</Select.Option>
            </Select>
            <span>Start Date</span>
            <DatePicker
              value={editData?.start_date ? dayjs(editData.start_date) : null}
              onChange={(date, dateString) =>
                handleEditChange({ target: { name: 'start_date', value: dateString } })
              }
              className="w-full mb-4 mt-2"
            />
            <span>Rank</span>
            <Input
              value={editData?.ranks ? editData.ranks : ''}
              name="ranks"
              type="text"
              onChange={handleEditChange}
              className="w-full mb-4 mt-2"
            />
            <span>Nielsen Households</span>
            <Input
              value={editData?.nielsen_households ? editData.nielsen_households : ''}
              name="nielsen_households"
              type="text"
              onChange={handleEditChange}
              className="w-full mb-4 mt-2"
            />
          </form>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${
          selectedRowKeys.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
      ></ConfirmModal>

      <NormalModal open={exportModal.open} setOpen={setExportModal} width={'500px'} title={''}>
        <div className="flex gap-2.5 ml-2.5">
          <div className="mb-2">Select Type</div>
          <Radio.Group value={type} onChange={(e) => setType(e.target.value)}>
            <Radio value="xlsx">XLSX</Radio>
            <Radio value="csv">CSV</Radio>
            <Radio value="xls">XLS</Radio>
            <Radio value="tsv">TSV</Radio>
          </Radio.Group>
          <Button type="primary" onClick={exportHandler} loading={loading}>
            Next
          </Button>
        </div>
      </NormalModal>
    </>
  )
}

MarketExceptionReport.layout = (page) => <Layout title="MarketExceptionReport">{page}</Layout>
export default MarketExceptionReport
