import Layout from '../Layout/Layout'
import { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import { usePage } from '@inertiajs/inertia-react'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import { Button, makeStyles } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import CustomFilter from '@/Components/CustomFilter'
import { filterData } from '@/Helpers/filterData'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import toast from 'react-hot-toast'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import addTableDetails from '@/Helpers/AddTableDetails'
import handleSelects from '@/Helpers/HandleSelects'
import { Pagination } from 'react-laravel-paginex'

const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}))

const ArchivedCallLogReports = () => {
  const classes = useStyles()
  const { archivedCallLogs, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showCallLogModal, setShowCallLogModal] = useState({
    open: false,
  })
  const showColumnRef = useRef()
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [filterValue, setFilterValue] = useState(
    defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, '')
  )
  const [archivedData, setArchivedDataData] = useState(archivedCallLogs)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        sl: index + 1,
        SN: item.SN,
        Campaign: item.Campaign,
        Call_Date: item.Call_Date,
        Call_Date_Time: item.Call_Date_Time,
        Conn_Duration: item.Conn_Duration,
        Call_Length_In_Seconds: item.call_Length_In_Seconds,
        Customer: item.Customer,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Target_Description: item.Target_Description,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Revenue: item.Revenue,
        Payout: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        Inbound_Id: item.Inbound_Id,
        Inbound: item.Inbound,
        Time: item.Call_Date_Time,
        Dialed: item.Dialed,
        Type: item.Type,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        id: item.id,
        key: index,
      }
    })
  }
  const dataArray = mapDataArr(archivedCallLogs.data)
  const columns = [
    {
      key: 'selection-cell',
      style: { width: 80 },
      visible: true,
    },
    {
      key: 'sl',
      title: 'SL',
      dataType: DataType.Number,
      style: { width: 100 },
      visible: false,
    },
    {
      key: 'SN',
      title: 'SN',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'Call_Date_Time',
      title: 'Call Time (EST)',
      dataType: DataType.Date,
      style: { width: 230 },
      visible: true,
    },

    {
      key: 'Inbound_Id',
      title: 'Inbound Id',
      dataType: DataType.String,
      style: { width: 600 },
      visible: true,
    },
    {
      key: 'Affiliate',
      title: 'Affiliate',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Market',
      title: 'Market',
      dataType: DataType.String,
      style: { width: 350 },
      visible: true,
    },
    {
      key: 'Campaign',
      title: 'Campaign',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'Inbound',
      title: 'Inbound',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'Dialed',
      title: 'Dialed',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'Type',
      title: 'Type',
      dataType: DataType.String,
      style: { width: 100 },
      visible: true,
    },
    {
      key: 'Customer',
      title: 'Customer',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Target',
      title: 'Target',
      dataType: DataType.String,
      style: { width: 350 },
      visible: true,
    },
    {
      key: 'Target_Number',
      title: 'Target Number',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'Target_Description',
      title: 'Target Description',
      dataType: DataType.String,
      style: { width: 400 },
      visible: true,
    },
    {
      key: 'Call_Length_In_Seconds',
      title: 'Call Length In Seconds',
      dataType: DataType.Number,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Revenue',
      title: 'Revenue',
      dataType: DataType.Number,
      style: { width: 120 },
      visible: true,
    },
    {
      key: 'Conn_Duration',
      title: 'Conn.Duration',
      dataType: DataType.Number,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Payout',
      title: 'Payout',
      dataType: DataType.Number,
      style: { width: 100 },
      visible: true,
    },
    {
      key: 'Total_Cost',
      title: 'Total Cost',
      dataType: DataType.Number,
      style: { width: 120 },
      visible: true,
    },
    {
      key: 'Profit',
      title: 'Profit',
      dataType: DataType.Number,
      style: { width: 120 },
      visible: true,
    },
    {
      key: 'City',
      title: 'City',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'State',
      title: 'State',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Zipcode',
      title: 'Zipcode',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
  ]
  const optionKey = 'archived-call-logs'
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
        if (value !== undefined) {
          let shortMonth = value.toLocaleString('en-us', { month: 'short' })
          let format_date = value
          let dd = String(format_date.getDate()).padStart(2, '0')
          let yyyy = format_date.getFullYear()
          format_date = dd + '-' + shortMonth + '-' + yyyy
          return format_date
        }
      }
      if (column.key === 'Call_Date_Time') {
        if (value !== undefined) {
          return DateTimeFormat(value)
        }
      }
    },
  }
  const fields = SearchedFields(tablePropsInit.columns)

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const dispatch = (action) => {
    handleSelects({
      action,
      selectedRowIds,
      setSelectedRowIds,
      tableProps,
      setTableToolbar,
      inboundIds,
      setInbounIds,
    })
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
    setDeleteLoading(true)
    axios
      .post('archive-delete', { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          setDeleteLoading(false)

          changeTableProps(filteredData)
          setInbounIds([])
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setDeleteLoading(false)
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowIds([])
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setDeleteLoading(false)
        setInbounIds([])
        setSelectedRowIds([])
        setShowDeleteModal({ open: false })
      })
  }

  const handleMoveCallLog = (inboundIds) => {
    setArchiveLoading(true)
    axios
      .post(route('archived.to.call.log'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setArchiveLoading(false)
          toast.success(res.data.msg)
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
          filteredData.data = newData
          changeTableProps(filteredData)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowIds([])
          setInbounIds([])
          setShowCallLogModal({ open: false })
        } else {
          setArchiveLoading(false)
          toast.error(res.data.msg)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowIds([])
          setInbounIds([])
          setShowCallLogModal({ open: false })
        }
      })
      .catch((err) => {
        setArchiveLoading(false)
        setTableToolbar(false)
        setInbounIds([])
        setSelectedRowIds([])
        setInbounIds([])
        setShowCallLogModal({ open: false })
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
        'archived-call-log-report?page=' +
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
        setArchivedDataData(res.data)
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
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Archived CallLogs Report" />
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
            filterRowCell: {
              content: (props) => {
                if (props.column.key === 'selection-cell') {
                  return <></>
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
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case 'drag':
                    return (
                      <img
                        style={{ cursor: 'move' }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    )
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={() => tableProps.data}
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
          <Pagination changePage={getSearchingData} data={archivedData} />
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
        loading={archiveLoading}
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
        loading={deleteLoading}
      ></ConfirmModal>
    </>
  )
}

ArchivedCallLogReports.layout = (page) => <Layout title="Archived Call Log Reports">{page}</Layout>
export default ArchivedCallLogReports
