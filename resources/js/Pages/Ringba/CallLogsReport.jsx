import Layout from '../Layout/Layout'
import { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import 'ka-table/style.scss'
import { usePage } from '@inertiajs/inertia-react'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import ThreeDots from '@/Components/Icons/ThreeDots.jsx'
import DeleteIcon from '@material-ui/icons/Delete'
import produce from 'immer'
import { Button, CircularProgress, IconButton, Tooltip, TextField } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import { deleteHandler } from '@/Helpers/HandleRequests'
import CustomFilter from '@/Components/CustomFilter'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import PulseLoader from 'react-spinners/PulseLoader'
import toast from 'react-hot-toast'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import addTableDetails from '@/Helpers/AddTableDetails'
import handleSelects from '@/Helpers/HandleSelects'
import { Pagination } from 'react-laravel-paginex'
import { columns, useStyles } from './Helpers/CallLogsReportProps'

const CallLogsReport = () => {
  const classes = useStyles()
  const { allCallLogs, campaignsWithAnnotations, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [editData, setEditData] = useState([])
  const [sn, setSn] = useState('')
  const [showRevenueClearModal, setShowRevenueClearModal] = useState({ open: false })
  const [showPendingModal, setShowPendingModal] = useState({ open: false })
  const [showArchivedModal, setShowArchivedModal] = useState({ open: false })
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
  const [ringbaData, setRingbaData] = useState(allCallLogs)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
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
        edit: item.Inbound_Id,
        SN: item.SN,
        Call_Date: item.Call_Date,
        Call_Date_Time: item.Call_Date_Time,
        Has_Annotation: item.Has_Annotation,
        Annotation_Tag: [item.Annotation_Tag, item.Campaign, item.id],
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
        payoutAmount: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        id: item.id,
        key: index,
      }
    })
  }

  const dataArray = mapDataArr(allCallLogs.data)

  const optionKey = 'call-logs-report'
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
      if (column.key === 'edit') {
        return (
          <div className="edit-icon" onClick={() => handleRowFunctionalities(value)}>
            <ThreeDots />
          </div>
        )
      }
      if (column.key === 'Annotation_Tag') {
        let arrayValue = value?.split(',')
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
      if (column.key === 'Recording_Url') {
        return (
          <audio className="audio-data" controls style={{ width: '100%' }}>
            <source src={value} type="audio/mp3" />
            Your browser does not support the <code>audio</code> element.
          </audio>
        )
      }

      if (column.key === 'Call_Date_Time') {
        if (value !== undefined) {
          return DateTimeFormat(value)
        }
      }
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

  const updateAnnotation = (e, tableIndex) => {
    e.preventDefault()
    axios
      .post(route('change.annotation', 'RingbaCallLogs'), {
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

  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }

  const handleColumns = () => {
    setShowColumns(true)
    setOpenRowFunctionalities(false)
  }
  
  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const handlePending = (inboundIds) => {
    setIsLoading({ ...isLoading, pending: true })
    axios
      .post(route('add.pending.bill.call'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setIsLoading({ ...isLoading, pending: false })
          toast.success(res.data.msg)
          const columnsData = produce(tableProps, (draft) => {
            const filteredData = draft.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
            draft.selectedRows = []
            draft.data = filteredData
          })
          changeTableProps(columnsData)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowIds([])
          getSearchingData(currentPage)
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, pending: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, pending: false })
        setOpenRowFunctionalities(false)
        setShowPendingModal({ open: false })
        setSelectedRowIds([])
        setInbounIds([])
      })
  }

  const handleArchived = (inboundIds) => {
    setIsLoading({ ...isLoading, archive: true })
    axios
      .post(route('add.arichived.bill.call'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setIsLoading({ ...isLoading, archive: false })
          toast.success(res.data.msg)
          let columnsData = produce(tableProps, (draft) => {
            const filteredData = draft.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
            draft.selectedRows = []
            draft.data = filteredData
          })
          changeTableProps(columnsData)
          setTableToolbar(false)
          setInbounIds([])
          setSelectedRowIds([])
          getSearchingData(currentPage)
          setOpenRowFunctionalities(false)
          setShowArchivedModal({ open: false })
        } else {
          setIsLoading({ ...isLoading, archive: false })
          toast.error(res.data.msg)
          setInbounIds([])
          setSelectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowArchivedModal({ open: false })
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, archive: false })
        setInbounIds([])
        setSelectedRowIds([])
        setOpenRowFunctionalities(false)
        setShowArchivedModal({ open: false })
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
      .post(route('update.data'), { inboundId: inboundIdsParam[id] })
      .then((res) => {
        if (res.status === 200) {
          if (!res.data[0].edit) res.data[0].edit = ''
          res.data[0].edit = res.data[0].id
          const tmpTableProps = { ...tableProps }
          const mappedData = mapDataArr(res.data)
          for (let i = 0; i < tmpTableProps.data.length; i++) {
            if (tmpTableProps.data[i].id === res.data[0].id) {
              tmpTableProps.data[i] = mappedData[0]
            }
          }

          if (id === inboundIdsParam.length - 1) {
            toast.success(`${inboundIdsParam.length} Record Updated`)
            setSelectedRowIds([])
            setIsLoading({ ...isLoading, update: false })
            setTableToolbar(false)
            setInbounIds([])
            setOpenRowFunctionalities(false)
            tmpTableProps.selectedRows = []
          }
          changeTableProps(tmpTableProps)
        } else if (res.status === 204) {
          toast.error("The record isn't exist in Ringba")
          setIsLoading({ ...isLoading, update: false })

          setInbounIds([])
          setSelectedRowIds([])
          setOpenRowFunctionalities(false)
        } else {
          toast.error('Updating failed')
          setIsLoading({ ...isLoading, update: false })

          setInbounIds([])
          setSelectedRowIds([])
          setOpenRowFunctionalities(false)
        }
      })
      .catch((err) => {
        toast.error('Updating failed')
        setIsLoading({ ...isLoading, update: false })
        setInbounIds([])
        setSelectedRowIds([])
      })
  }

  const handleClear = (inboundIds) => {
    setIsLoading({ ...isLoading, revenue: true })
    axios
      .post(route('calllogs.revenue.update'), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading({ ...isLoading, revenue: false })
          toast.success('Successfully Updated')
          const columnsData = produce(tableProps, (draft) => {
            draft.data.filter((item) => {
              if (item.Inbound_Id === editData[0]) {
                item.Revenue = ''
                item.payoutAmount = ''
              }
            })
          })
          changeTableProps(columnsData)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowIds([])
        } else {
          setIsLoading({ ...isLoading, revenue: false })
          toast.error(res.data.msg)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowIds([])
        }
      })
      .catch((err) => {
        setIsLoading({ ...isLoading, revenue: false })
        setShowRevenueClearModal({ open: false })
        setOpenRowFunctionalities(false)
        setInbounIds([])
        setSelectedRowIds([])
      })
  }

  const handleOpenModal = (setOpenModal, tableData) => {
    setOpenModal({ open: true })
    if (tableData) {
      let filteredData = tableProps
      filteredData.data.filter((item) => {
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
    setSelectedRowIds([])
    setInbounIds([])
  }

  const getSearchingData = async (data) => {
    setCurrentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'call-logs-report?page=' +
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
        setRingbaData(res.data)
        dispatch(hideLoading())
      })
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(currentPage)
  }, [itemPerPage, filterValue])

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
          onClick={() => handleOpenModal(setShowPendingModal)}
        >
          Pending
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleOpenModal(setShowArchivedModal)}
        >
          Archived
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleUpdate(inboundIds)}
        >
          {'Update'}
          {isLoading.update && (
            <CircularProgress
              color="inherit"
              size="1rem"
              thickness={2}
              style={{ marginLeft: '5px' }}
            />
          )}
        </Button>

        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

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
          <span onClick={() => handleOpenModal(setShowRevenueClearModal, tableProps)}>Clear</span>
        </div>
      </div>
    )
  }

  const handleRowFunctionalities = (inbound_id) => {
    setOpenRowFunctionalities(true)
    setShowColumns(false)
    if (editData.length) {
      const itemIndx = editData.indexOf(inbound_id)
      editData.splice(itemIndx, 1)
    }
    editData.push(inbound_id)
  }

  return (
    <>
      <Helmet title="Call Logs Report" />
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
            {showColumns && (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
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

              elementAttributes: (props) => {
                if (props.column.key === 'edit') {
                  return {
                    style: {
                      ...props.column.style,
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                    },
                  }
                }
              },
            },
            cell: {
              elementAttributes: (props) => {
                if (props.column.key === 'edit') {
                  return {
                    style: {
                      ...props.column.style,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#fff',
                    },
                  }
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
          <Pagination changePage={getSearchingData} data={ringbaData} />
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
        btnAction={() =>
          deleteHandler(
            'call.logs.delete',
            selectedRowIds,
            setSelectedRowIds,
            tableProps,
            changeTableProps,
            isLoading,
            setIsLoading,
            setInbounIds,
            setTableToolbar,
            setShowDeleteModal,
            itemPerPage,
            getSearchingData
          )
        }
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

CallLogsReport.layout = (page) => <Layout title="Call Logs Report">{page}</Layout>
export default CallLogsReport
