import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { Tooltip, Button, Table, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import CustomFilter from '@/Components/CustomFilter'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import toast from 'react-hot-toast'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { Pagination } from 'react-laravel-paginex'
import { columns as defaultColumns } from './Helpers/PendingCallLogsProps'

const PendingCallLogsReport = () => {
  const { pendingCallLogs, campaignsWithAnnotations, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showCallLogModal, setShowCallLogModal] = useState({
    open: false,
  })
  const [showBilledModal, setShowBilledModal] = useState({ open: false })
  const showColumnRef = useRef()
  const [filterValue, setFilterValue] = useState(
    defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, '')
  )
  const [pendingData, setPendingData] = useState(pendingCallLogs)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState({
    callLog: false,
    billed: false,
    delete: false,
  })

  const updateAnnotation = (value, tableIndex) => {
    axios
      .post(route('change.annotation', 'PendingCallLogs'), {
        indexId: tableIndex,
        annotation_id: value,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.msg)
          setData((prev) =>
            prev.map((item) =>
              item.id == tableIndex
                ? { ...item, Has_Annotation: res.data.has_annotation }
                : item
            )
          )
        }
      })
      .catch((err) => {})
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        sl: index + 1,
        SN: item.SN,
        Call_Date: item.Call_Date,
        Call_Date_Time: item.Call_Date_Time,
        Duplicate_Call: item.Duplicate_Call,
        Call_Status: item.call_Logs_status,
        Inbound_Id: item.Inbound_Id,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Campaign: item.Campaign,
        Inbound: item.Inbound,
        Dialed: item.Dialed,
        Type: item.Type,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Customer: item.Customer,
        Source_Hangup: item.Source_Hangup,
        Conn_Duration: item.Conn_Duration,
        Time_To_Call: item.Time_To_Call,
        Call_Length_In_Seconds: item.call_Length_In_Seconds,
        Revenue: item.Revenue,
        Payout: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        City: item.City,
        Annotation_Tag: [item.Annotation_Tag, item.Campaign, item.id],
        Has_Annotation: item.Has_Annotation,
        id: item.id,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(pendingCallLogs.data)

  const optionKey = 'pending-call-logs'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const initialColumns =
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns

  const fields = SearchedFields(initialColumns)
  const [columns, setColumns] = useState(initialColumns)
  const [data, setData] = useState(dataArray)
  const [loading, setLoading] = useState(false)
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
      setInbounIds(selectedRows.map((row) => row.Inbound_Id))
    },
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
            : col.dataType === 'string'
              ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
              : undefined,
      }

      if (col.key === 'Call_Date') {
        base.render = (value) => {
          if (value !== undefined) {
            let shortMonth = value.toLocaleString('en-us', { month: 'short' })
            let format_date = value
            let dd = String(format_date.getDate()).padStart(2, '0')
            let yyyy = format_date.getFullYear()
            return dd + '-' + shortMonth + '-' + yyyy
          }
        }
      }

      if (col.key === 'Call_Date_Time') {
        base.render = (value) => {
          if (value !== undefined) {
            return DateTimeFormat(value)
          }
        }
      }

      if (col.key === 'Annotation_Tag') {
        base.render = (value) => {
          let arrayValue = Array.isArray(value) ? value : String(value).split(',')
          return (
            <Select
              defaultValue={arrayValue[0] || undefined}
              onChange={(value) => updateAnnotation(value, arrayValue[2])}
              size="small"
              className="w-full"
            >
              <Select.Option value="">Select Annotation</Select.Option>
              {campaignsWithAnnotations
                .filter((campaign) => campaign.campaign_name == arrayValue[1])[0]
                ?.annotations.map((annotation, index) => (
                  <Select.Option key={index} value={annotation.id}>
                    {annotation.annotation_name}
                  </Select.Option>
                ))}
            </Select>
          )
        }
      }

      return base
    })
  )

  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const deleteHandler = () => {
    setIsLoading({ ...isLoading, delete: true })
    axios
      .post(route('pending.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setIsLoading({ ...isLoading, delete: false })
          setSelectedRowKeys([])
          getSearchingData(currentPage)
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, delete: false })
          toast.error(res.data.msg)
          setSelectedRowKeys([])
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, delete: false })
        setSelectedRowKeys([])
        setShowDeleteModal({ open: false })
      })
  }

  const handleMoveCallLog = () => {
    setIsLoading({ ...isLoading, callLog: true })
    axios
      .post(route('move.from.pending.bill.to.ringba.call.log'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          setData((prev) => prev.filter((item) => !inboundIds.includes(item.Inbound_Id)))
          setIsLoading({ ...isLoading, callLog: false })
          setTableToolbar(false)
          setInbounIds([])
          getSearchingData(currentPage)
          setShowCallLogModal({ open: false })
          setInbounIds([])
          setSelectedRowKeys([])
        } else {
          setIsLoading({ ...isLoading, callLog: false })
          setTableToolbar(false)
          setInbounIds([])
          setShowCallLogModal({ open: false })
          setInbounIds([])
          setSelectedRowKeys([])
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, callLog: false })
        setTableToolbar(false)
        setInbounIds([])
        setShowCallLogModal({ open: false })
        setInbounIds([])
        setSelectedRowKeys([])
      })
  }

  const handleBilledCallLog = () => {
    setIsLoading({ ...isLoading, billed: true })
    axios
      .post(route('store.bill.call.logs'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          setData((prev) => prev.filter((item) => !inboundIds.includes(item.Inbound_Id)))
          setIsLoading({ ...isLoading, billed: false })
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowKeys([])
          getSearchingData(currentPage)
          setShowBilledModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, billed: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowKeys([])
          setShowBilledModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, billed: false })
        setInbounIds([])
        setSelectedRowKeys([])
        setShowBilledModal({ open: false })
      })
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }
  const getSearchingData = async (pageData) => {
    setcurrentPage(pageData)
    setLoading(true)
    await axios
      .get(
        'pending-call-log-report?page=' +
          pageData.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setPendingData(res.data)
        setLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(currentPage)
  }, [itemPerPage, filterValue])

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

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} />
        </Tooltip>

        <Button
          type="primary"
          className="w-auto capitalize text-sm"
          onClick={() => handleOpenModal(setShowCallLogModal)}
        >
          Move Call Log
        </Button>
        <Button
          type="primary"
          className="w-auto capitalize text-sm"
          onClick={() => handleOpenModal(setShowBilledModal)}
        >
          Billed
        </Button>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Pending Call Logs Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <Search />
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <Cancel />
                  </a>
                </div>

                <div className="top-element">
                  <CustomFilter
                    mainData={data}
                    fields={fields}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    currentPage={currentPage}
                    getSearchingData={getSearchingData}
                  />
                </div>
              </div>
            ) : (
              ''
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={false}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 217px)' }}
          size="small"
        />
        <div className="table-bottom">
          <Select
            value={itemPerPage}
            onChange={(value) => itemPerPageHandleChange(value)}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 100, label: '100' },
              { value: 200, label: '200' },
            ]}
          />
          <Pagination changePage={getSearchingData} data={pendingData} />
        </div>
      </div>

      <ConfirmModal
        open={showCallLogModal.open}
        setOpen={setShowCallLogModal}
        btnAction={() => handleMoveCallLog(inboundIds)}
        closeAction={() => handleCloseModal(setShowCallLogModal)}
        width={'450px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to move these records to Call Log?'
            : 'Do you want to move this record to Call Log?'
        }`}
        loading={isLoading.callLog}
      ></ConfirmModal>

      <ConfirmModal
        open={showBilledModal.open}
        setOpen={setShowBilledModal}
        btnAction={() => handleBilledCallLog(inboundIds)}
        closeAction={() => handleCloseModal(setShowBilledModal)}
        width={'450px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to move these records to Billed?'
            : 'Do you want to move this record to Billed?'
        }`}
        loading={isLoading.billed}
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
        loading={isLoading.delete}
      ></ConfirmModal>
    </>
  )
}

PendingCallLogsReport.layout = (page) => <Layout title="Pending Call Logs Report">{page}</Layout>
export default PendingCallLogsReport
