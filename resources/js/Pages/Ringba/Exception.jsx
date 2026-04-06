import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import ThreeDots from '@/Components/Icons/ThreeDots.jsx'
import { Tooltip, Button, Table, Select, Pagination } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import produce from 'immer'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import CustomFilter from '@/Components/CustomFilter'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import PulseLoader from 'react-spinners/PulseLoader'
import toast from 'react-hot-toast'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { columns as defaultColumns } from './Helpers/ExceptionProps'

const Exceptions = () => {
  const { Exceptions: ExceptionsData, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [editData, setEditData] = useState([])
  const [sn, setSn] = useState('')
  const [showRevenueClearModal, setShowRevenueClearModal] = useState({
    open: false,
  })
  const [showPendingModal, setShowPendingModal] = useState({
    open: false,
  })
  const [showArchivedModal, setShowArchivedModal] = useState({
    open: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [openRowFunctionalities, setOpenRowFunctionalities] = useState(false)
  const rowFunctionalitiesRef = useRef()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const showColumnRef = useRef()
  const color = '#36D7B7'
  const drawerWidth = 350
  const [filterValue, setFilterValue] = useState(
    defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, '')
  )
  const [totalRecords, setTotalRecords] = useState(ExceptionsData.total || 0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState({
    update: false,
    revenue: false,
    pending: false,
    archive: false,
    delete: false,
  })

  const style = {
    top: position.y < 650 ? position.y - 137 : position.y - 298,
    left: drawerWidth,
  }

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY })
    }
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        edit: item.id,
        sl: index + 1,
        SN: item.SN,
        Call_Date_Time: item.Call_Date_Time,
        Call_Date: item.Call_Date_Time,
        Has_Annotation: item.Has_Annotation,
        Annotation_Tag: item.Annotation_Tag,
        call_Logs_status: item.call_Logs_status,
        Duplicate_Call: item.Duplicate_Call,
        Recording_Url: item.Recording_Url,
        Inbound_Id: item.Inbound_Id,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Campaign: item.Campaign,
        Inbound: item.Inbound,
        Dialed: item.Dialed,
        Type: item.Type,
        Customer: item.Customer,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Target_Description: item.Target_Description,
        Source_Hangup: item.Source_Hangup,
        Time_To_Call: item.Time_To_Call,
        call_Length_In_Seconds: item.call_Length_In_Seconds,
        Revenue: item.Revenue,
        Conn_Duration: item.Conn_Duration,
        Time: item.Call_Date_Time,
        payoutAmount: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        id: item.id,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(ExceptionsData.data)

  const optionKey = 'exception-call-logs-report'
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
              : col.dataType === 'date'
                ? (a, b) => new Date(a[col.key] || 0) - new Date(b[col.key] || 0)
                : col.dataType === 'string'
                  ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                  : undefined,
        }

        if (col.key === 'edit') {
          base.fixed = 'left'
          base.render = (value) => (
            <div className="edit-icon" onClick={() => handleRowFunctionalities(value)}>
              <ThreeDots />
            </div>
          )
        }

        if (col.key === 'Recording_Url') {
          base.render = (value) => (
            <audio className="audio-data w-full" controls>
              <source src={value} type="audio/mp3" />
              Your browser does not support the <code>audio</code> element.
            </audio>
          )
        }

        if (col.key === 'Call_Date_Time') {
          base.render = (value) => {
            if (value !== undefined) {
              return DateTimeFormat(value)
            }
          }
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
      .post(route('exception.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setIsLoading({ ...isLoading, delete: false })
          setSelectedRowKeys([])
          setInbounIds([])
          getSearchingData(currentPage)
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, delete: false })
          setSelectedRowKeys([])
          setInbounIds([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, delete: false })
        setSelectedRowKeys([])
        setInbounIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handlePending = (inboundIds) => {
    setIsLoading({ ...isLoading, pending: true })
    axios
      .post(route('move.exception.to.pending'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setIsLoading({ ...isLoading, pending: false })
          toast.success(res.data.msg)
          setData((prev) => prev.filter((item) => !inboundIds.includes(item.Inbound_Id)))
          setTableToolbar(false)
          setSelectedRowKeys([])
          setInbounIds([])
          getSearchingData(currentPage)
          setSelectedRowKeys([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, pending: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowKeys([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, pending: false })
        setInbounIds([])
        setSelectedRowKeys([])
        setOpenRowFunctionalities(false)
      })
  }

  const handleArchived = (inboundIds) => {
    setIsLoading({ ...isLoading, archive: true })
    axios
      .post(route('move.exception.to.arhived'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setIsLoading({ ...isLoading, archive: false })
          toast.success(res.data.msg)
          setData((prev) => prev.filter((item) => !inboundIds.includes(item.Inbound_Id)))
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowKeys([])
          getSearchingData(currentPage)
          setOpenRowFunctionalities(false)
          setShowArchivedModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, archive: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowKeys([])
          setShowArchivedModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, archive: false })
        setTableToolbar(false)
        setInbounIds([])
        setSelectedRowKeys([])
        setOpenRowFunctionalities(false)
      })
  }

  const handleUpdate = (inboundIds) => {
    let i = 0
    while (i < inboundIds.length) {
      updatePostRequest(inboundIds, i)
      i = i + 1
    }
  }

  const updatePostRequest = (inboundIdsParam, id) => {
    setIsLoading({ ...isLoading, update: true })
    axios
      .post(route('update.exception.report'), { inboundId: inboundIdsParam[id] })
      .then((res) => {
        if (res.status === 200) {
          if (!res.data[0].edit) res.data[0].edit = ''
          res.data[0].edit = res.data[0].id
          const mappedData = mapDataArr(res.data)
          setData((prev) => prev.map((item) => (item.id === res.data[0].id ? mappedData[0] : item)))
          if (id === inboundIdsParam.length - 1) {
            toast.success(`${inboundIdsParam.length} Record Updated`)
            setSelectedRowKeys([])
            setIsLoading({ ...isLoading, update: false })
            setTableToolbar(false)
            setInbounIds([])
            setOpenRowFunctionalities(false)
          }
        } else if (res.status === 204) {
          toast.error("The record isn't exist in Ringba")
          setIsLoading({ ...isLoading, update: false })
          setInbounIds([])
          setSelectedRowKeys([])
          setOpenRowFunctionalities(false)
        } else {
          toast.error('Updating failed')
          setIsLoading({ ...isLoading, update: false })
          setInbounIds([])
          setSelectedRowKeys([])
          setOpenRowFunctionalities(false)
        }
      })
      .catch((err) => {
        toast.error('Updating failed')
        setIsLoading({ ...isLoading, update: false })
        setInbounIds([])
        setSelectedRowKeys([])
      })
  }

  const handleClear = (inboundIds) => {
    setIsLoading({ ...isLoading, revenue: true })
    axios
      .post(route('exception.revenue.update'), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading({ ...isLoading, revenue: false })
          toast.success('Successfully Updated')
          setData((prev) =>
            prev.map((item) =>
              item.Inbound_Id === editData[0] ? { ...item, Revenue: '', payoutAmount: '' } : item
            )
          )
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowKeys([])
        } else {
          setIsLoading({ ...isLoading, revenue: false })
          toast.error(res.data.msg)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowKeys([])
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, revenue: false })
        setInbounIds([])
        setSelectedRowKeys([])
        setOpenRowFunctionalities(false)
      })
  }

  const handleOpenModal = (setOpenModal, tableData) => {
    setOpenModal({ open: true })
    if (tableData) {
      data.forEach((item) => {
        if (item.Inbound_Id === editData[0]) {
          setSn(item.SN)
        }
      })
      setShowRevenueClearModal({ open: true })
    }
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setOpenRowFunctionalities(false)
    setTableToolbar(false)
    setSelectedRowKeys([])
    setInbounIds([])
  }

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: '#031b4e' }} />}
            onClick={() => handleOpenModal(setShowDeleteModal)}
          />
        </Tooltip>

        <Button
          type="primary"
          className="w-auto capitalize text-sm"
          onClick={() => handleOpenModal(setShowPendingModal)}
        >
          Pending
        </Button>
        <Button
          type="primary"
          className="w-auto capitalize text-sm"
          onClick={() => handleOpenModal(setShowArchivedModal)}
        >
          Archived
        </Button>
        <Button
          type="primary"
          className="w-auto capitalize text-sm"
          onClick={() => handleUpdate(inboundIds)}
          loading={isLoading.update}
        >
          Update
        </Button>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const getSearchingData = async (page = 1) => {
    setcurrentPage(page)
    setLoading(true)
    await axios
      .get(
        'exceptions?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setTotalRecords(res.data.total)
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
      if (
        openRowFunctionalities &&
        rowFunctionalitiesRef.current &&
        !rowFunctionalitiesRef.current.contains(e.target)
      ) {
        setOpenRowFunctionalities(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [openRowFunctionalities])

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

  const RowFunctionalities = () => {
    return (
      <div className="row-functionalities" ref={rowFunctionalitiesRef} style={style}>
        <div>
          <span onClick={() => handleOpenModal(setShowPendingModal)}>Pending </span>
          <span onClick={() => handleOpenModal(setShowArchivedModal)}>Archived</span>
          <span onClick={() => handleUpdate(editData)}>
            Update <PulseLoader color={color} loading={isLoading.update} size={5} />
          </span>
          <span onClick={() => handleOpenModal(setShowRevenueClearModal, true)}>Clear</span>
        </div>
      </div>
    )
  }

  const handleRowFunctionalities = (id) => {
    setOpenRowFunctionalities(true)
    setShowColumns(false)
    if (editData.length > 0) {
      const itemIndx = editData.indexOf(id)
      editData.splice(itemIndx, 1)
    }
    const tempData = data.filter((item) => item.id == id)
    editData.push(tempData[0].Inbound_Id)
  }

  return (
    <>
      <Helmet title="Exception Report" />
      <div className="selection-demo" onClick={rowFunctionalitiesPosition}>
        {openRowFunctionalities ? <RowFunctionalities /> : ''}
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
        <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={false}
          components={{
            header: {
              cell: DraggableResizableHeader,
            },
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 217px)' }}
          size="small"
        />
        </ReportTableDndShell>
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
          <Pagination
            current={currentPage}
            total={totalRecords}
            pageSize={itemPerPage}
            onChange={(page) => getSearchingData(page)}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ConfirmModal
        open={showRevenueClearModal.open}
        setOpen={setShowRevenueClearModal}
        btnAction={handleClear}
        closeAction={() => handleCloseModal(setShowRevenueClearModal)}
        editData={editData}
        width={'450px'}
        title={
          <>
            Do you want clear <b>revenue</b> and <b>payout</b> for - <b>{sn}</b>
          </>
        }
        loading={isLoading.revenue}
      ></ConfirmModal>

      <ConfirmModal
        open={showPendingModal.open}
        setOpen={setShowPendingModal}
        btnAction={() => handlePending(inboundIds.length > 0 ? inboundIds : editData)}
        closeAction={() => handleCloseModal(setShowPendingModal)}
        width={'450px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to move these records to pending?'
            : 'Do you want to move this record to pending?'
        }`}
        loading={isLoading.pending}
      ></ConfirmModal>
      <ConfirmModal
        open={showArchivedModal.open}
        setOpen={setShowArchivedModal}
        btnAction={() => handleArchived(inboundIds.length > 0 ? inboundIds : editData)}
        closeAction={() => handleCloseModal(setShowArchivedModal)}
        editData={editData}
        width={'450px'}
        title={`${
          inboundIds.length > 1
            ? 'Do you want to move these records to archive?'
            : 'Do you want to move this record to archive?'
        }`}
        loading={isLoading.archive}
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

Exceptions.layout = (page) => <Layout title="Exceptions">{page}</Layout>
export default Exceptions
