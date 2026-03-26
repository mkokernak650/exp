import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Tooltip, Button, Select, Input, Radio, DatePicker } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import { filterData } from '@/Helpers/filterData'
import { fields, filter, columns as defaultColumns } from './Helpers/MarketExceptionReportProps'
import { Row, Col } from 'antd'

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

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
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
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setEditData()
          setShowEditModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setEditData()
        setShowEditModal({ open: false })
      })
  }

  const dataArray = marketExceptions.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
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

  const optionKey = 'market-exception-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )
  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const [data, setData] = useState(dataArray)

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
    })
  }

  const [filterValue, changeFilter] = useState(filter)

  const [searchSidebar, setSearchSidebar] = useState(false)
  const activeFilterCount = countActiveFilters(filterValue)
  const filteredData = filterData(data, filterValue)

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
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
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
      setEditData(item)
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

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
      .map((col) => {
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter:
            col.dataType === 'number'
              ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
              : col.dataType === 'string'
                ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                : undefined,
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
              <button
                type="button"
                className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                onClick={handleFilter}
                aria-label="Open filters"
              >
                <Filter />
                {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : ''}
              </button>
              <Button
                type="primary"
                htmlType="submit"
                className="w-[130px] capitalize text-sm"
                onClick={openExportModal}
                disabled={marketExceptions == ''}
              >
                Export
              </Button>
            </div>
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
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
            <Table
              columns={antdColumns}
              components={{ header: { cell: ResizableTitle } }}
              dataSource={filteredData}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
              }}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Market Exception'}
      >
        <div className="edit_target">
          <form>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Select
                  placeholder="Select Campaign"
                  onChange={(value) => handleEditChange({ target: { name: 'campaign_id', value } })}
                  className="w-full"
                  value={editData?.campaign_id ? editData.campaign_id : undefined}
                >
                  {allCampaigns.map((option, indx) => (
                    <Select.Option key={indx} value={option.id}>
                      {option.campaign_name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={24}>
                <Select
                  placeholder="Select State"
                  onChange={(value) => handleEditChange({ target: { name: 'state', value } })}
                  className="w-full"
                  value={editData?.state ? editData.state : undefined}
                >
                  {allStates.map((option, indx) => (
                    <Select.Option key={indx} value={option.state}>
                      {option.state}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={24}>
                <Select
                  placeholder="Select Market"
                  onChange={(value) => handleEditChange({ target: { name: 'market_id', value } })}
                  className="w-full"
                  value={editData?.market_id}
                >
                  {allMarkets.map((option, indx) => (
                    <Select.Option key={indx} value={option.market}>
                      {option.market}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={24}>
                <Select
                  placeholder="Call Type"
                  onChange={(value) => handleEditChange({ target: { name: 'call_type', value } })}
                  className="w-full"
                  value={editData?.call_type ? editData.call_type : undefined}
                >
                  <Select.Option value="L">Landline (L)</Select.Option>
                  <Select.Option value="W">Wireless (W)</Select.Option>
                  <Select.Option value="B">Both L & W</Select.Option>
                </Select>
              </Col>
              <Col span={24}>
                <div>
                  <DatePicker
                    value={editData?.start_date ? dayjs(editData.start_date) : null}
                    onChange={(date, dateString) =>
                      handleEditChange({ target: { name: 'start_date', value: dateString } })
                    }
                    className="w-full"
                  />
                </div>
              </Col>
              <Col span={24}>
                <span>Rank:</span>
                <Input
                  value={editData?.ranks ? editData.ranks : ''}
                  name="ranks"
                  type="text"
                  onChange={handleEditChange}
                  className="w-full mt-2"
                />
              </Col>
              <Col span={24}>
                <span>Nielsen Households:</span>
                <Input
                  value={editData?.nielsen_households ? editData.nielsen_households : ''}
                  name="nielsen_households"
                  type="text"
                  onChange={handleEditChange}
                  className="w-full mt-2"
                />
              </Col>
              <Col span={24}>
                <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">
                  Edit
                </Button>
              </Col>
            </Row>
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
