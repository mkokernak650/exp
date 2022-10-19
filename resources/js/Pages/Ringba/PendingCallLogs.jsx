import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import { Button, TextField } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import CustomFilter from '@/Components/CustomFilter'
import { filterData } from '@/Helpers/filterData'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import toast from 'react-hot-toast'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import addTableDetails from '@/Helpers/AddTableDetails'
import handleSelects from '@/Helpers/HandleSelects'
import { Pagination } from 'react-laravel-paginex'
import { columns, useStyles } from './Helpers/PendingCallLogsProps'

const PendingCallLogsReport = () => {
  const classes = useStyles()
  const { pendingCallLogs, campaignsWithAnnotations, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
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

  const updateAnnotation = (e, tableIndex) => {
    e.preventDefault()
    axios
      .post(route('change.annotation', 'PendingCallLogs'), {
        indexId: tableIndex,
        annotation_id: e.target.value,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.msg)
          const tmpTableProps = { ...tableProps }
          tablePropsRef.current.filter((item) => {
            if (item.id == tableIndex) {
              item.Has_Annotation = res.data.has_annotation
            }
          })
          tmpTableProps.data = tablePropsRef.current
          changeTableProps(tmpTableProps)
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
        key: index,
      }
    })
  }

  const dataArray = mapDataArr(pendingCallLogs.data)

  const optionKey = 'pending-call-logs'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
        ? JSON.parse(columnsData[0])?.[optionKey]
        : columns,
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === 'Call_Date') {
        if (value !== undefined || '') {
          let shortMonth = value.toLocaleString('en-us', { month: 'short' })
          let format_date = value
          let dd = String(format_date.getDate()).padStart(2, '0')
          let yyyy = format_date.getFullYear()
          format_date = dd + '-' + shortMonth + '-' + yyyy
          return format_date
        }
      }
      if (column.key === 'Call_Date_Time') {
        if (value !== undefined || '') {
          return DateTimeFormat(value)
        }
      }
      if (column.key === 'Annotation_Tag') {
        let arrayValue = value.split(',')
        return (
          <TextField
            id="annotation_id"
            select
            name="annotation_id"
            onChange={(e) => updateAnnotation(e, arrayValue[2])}
            SelectProps={{
              native: true,
            }}
            fullWidth
            defaultValue={arrayValue[0]}
          >
            <option value="">Select Annotation</option>
            {campaignsWithAnnotations
              .filter((campaign) => campaign.campaign_name == arrayValue[1])[0]
              ?.annotations.map((annotation, index) => (
                <option key={index} value={annotation.id}>
                  {annotation.annotation_name}
                </option>
              ))}
          </TextField>
        )
      }
    },
  }

  const fields = SearchedFields(tablePropsInit.columns)
  const [tableProps, changeTableProps] = useState(tablePropsInit)
  const tablePropsRef = useRef(tableProps)

  const dispatch = (action) => {
    if (
      ['SelectRow', 'DeselectRow', 'SelectAllFilteredRows', 'DeselectAllFilteredRows'].includes(
        action?.type
      )
    ) {
      handleSelects({
        action,
        selectedRowIds,
        setSelectedRowIds,
        tableProps,
        setTableToolbar,
        inboundIds,
        setInbounIds,
      })
    }
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      if (action?.type === 'ReorderColumns') {
        addTableDetails(columnDetails, setColumnDetails, settingsWithoutData, optionKey)
      }
      return newState
    })
  }

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
      .post(route('pending.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          setIsLoading({ ...isLoading, delete: false })
          changeTableProps(filteredData)
          setSelectedRowIds([])
          getSearchingData(currentPage)
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, delete: false })
          toast.error(res.data.msg)
          setSelectedRowIds([])
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, delete: false })
        setSelectedRowIds([])
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
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
          filteredData.data = newData
          setIsLoading({ ...isLoading, callLog: false })
          changeTableProps(filteredData)
          setTableToolbar(false)
          setInbounIds([])
          getSearchingData(currentPage)
          setShowCallLogModal({ open: false })
          setInbounIds([])
          setSelectedRowIds([])
        } else {
          setIsLoading({ ...isLoading, callLog: false })
          changeTableProps(filteredData)
          setTableToolbar(false)
          setInbounIds([])
          setShowCallLogModal({ open: false })
          setInbounIds([])
          setSelectedRowIds([])
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, callLog: false })
        changeTableProps(filteredData)
        setTableToolbar(false)
        setInbounIds([])
        setShowCallLogModal({ open: false })
        setInbounIds([])
        setSelectedRowIds([])
      })
  }

  const handleBilledCallLog = () => {
    setIsLoading({ ...isLoading, billed: true })
    axios
      .post(route('store.bill.call.logs'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
          filteredData.data = newData
          setIsLoading({ ...isLoading, billed: false })
          changeTableProps(filteredData)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowIds([])
          getSearchingData(currentPage)
          setShowBilledModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, billed: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowIds([])
          setShowBilledModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, billed: false })
        setInbounIds([])
        setSelectedRowIds([])
        setShowBilledModal({ open: false })
      })
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowIds([])
  }
  const getSearchingData = async (data) => {
    setcurrentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'pending-call-log-report?page=' +
          data.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        const tmpTableProps = { ...tableProps }
        tmpTableProps.data = mapDataArr(res.data.data)
        changeTableProps(tmpTableProps)
        tablePropsRef.current = mapDataArr(res.data.data)
        setPendingData(res.data)
        dispatch(hideLoading())
      })
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
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
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: '#031b4e' }} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleOpenModal(setShowCallLogModal)}
        >
          Move Call Log
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleOpenModal(setShowBilledModal)}
        >
          Billed
        </Button>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
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
                    mainData={tableProps.data}
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
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return <SelectionCell {...props} />
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(tableProps)}
                    />
                  )
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />
        <div className="table-bottom">
          <select
            name="item-per-page"
            id="item-per-page"
            value={itemPerPage}
            onChange={(e) => itemPerPageHandleChange(e)}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
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
