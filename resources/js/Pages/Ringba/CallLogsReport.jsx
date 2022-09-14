import Layout from '../Layout/Layout'
import { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from 'ka-table/actionCreators'
import 'ka-table/style.scss'
import { usePage } from '@inertiajs/inertia-react'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import DeleteIcon from '@material-ui/icons/Delete'
import produce from 'immer'
import {
  Button,
  makeStyles,
  CircularProgress,
  IconButton,
  Checkbox,
  Tooltip,
  TextField,
} from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import emptyCheckbox from '@/Helpers/EmptyCheckbox'
import { stateStore } from '@/Helpers/StateStore'
import ColumnSettings from '@/Components/ColumnSettings'
import { deleteHandler } from '@/Helpers/HandleRequests'
import CustomFilter from '@/Components/CustomFilter'
import { filterData } from '@/Helpers/filterData'
import { defaultFilter } from '@/Helpers/Filter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import PulseLoader from 'react-spinners/PulseLoader'
import toast from 'react-hot-toast'

const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}))

const CallLogsReport = () => {
  const classes = useStyles()
  const { allCallLogs, campaignsWithAnnotations } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setselectedRowIds] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [updateLoading, setUpdateLoading] = useState(false)
  const [annotationLoading, setAnnotationLoading] = useState(false)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
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

  const style = {
    top: position.y < 650 ? position.y - 79 : position.y - 275,
    left: drawerWidth,
  }
  const [count, setCount] = useState(0)

  const [filteredData, setFilteredData] = useState(filterData(allCallLogs, filterValue))

  const updateAnnotation = (e, tableIndex) => {
    e.preventDefault()
    axios
      .post(route('change.annotation', 'ringbaCallLog'), {
        indexId: tableIndex,
        annotation_id: e.target.value,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.msg)
          tableProps.data.filter((item, indx) => {
            if (item.id == tableIndex) {
              tableProps.data[indx].Has_Annotation = res.data.has_annotation
            }
          })
        }
      })
      .catch((err) => {})
  }

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY })
    }
  }

  const dataArray = filteredData.map((item, index) => {
    return {
      edit: item.id,
      sl: index + 1,
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

  const tablePropsInit = {
    columns: [
      {
        key: 'edit',
        style: { width: 10 },
        visible: true,
      },
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
        visible: false,
      },
      {
        key: 'Call_Date_Time',
        title: 'Call Time (EST)',
        dataType: DataType.Date,
        style: { width: 230 },
        visible: true,
      },
      {
        key: 'Has_Annotation',
        title: 'Has Annotation',
        dataType: DataType.String,
        style: { width: 160 },
        visible: true,
      },
      {
        key: 'Annotation_Tag',
        title: 'Annotation Tag',
        dataType: DataType.String,
        style: { width: 350 },
        visible: true,
      },
      {
        key: 'call_Logs_status',
        title: 'Call Status',
        dataType: DataType.String,
        style: { width: 130 },
        visible: true,
      },
      {
        key: 'Duplicate_Call',
        title: 'Duplicate Call',
        dataType: DataType.String,
        style: { width: 150 },
        visible: true,
      },
      {
        key: 'Recording_Url',
        title: 'Recording_Url',
        style: { width: 360 },
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
        key: 'Source_Hangup',
        title: 'Source/Hangup',
        dataType: DataType.String,
        style: { width: 240 },
        visible: true,
      },
      {
        key: 'Time_To_Call',
        title: 'Time To Call',
        dataType: DataType.Number,
        style: { width: 130 },
        visible: true,
      },
      {
        key: 'call_Length_In_Seconds',
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
        key: 'payoutAmount',
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
    ],
    paging: {
      enabled: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === 'edit') {
        return (
          <div className="edit-icon" onClick={() => handleRowFunctionalities(value)}>
            <Edit />
          </div>
        )
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
  const OPTION_KEY = 'call-logs-report'
  const [tableProps, changeTableProps] = useState(stateStore(tablePropsInit, 'call-logs-report'))
  const SelectionCell = ({ rowKeyValue, dispatch, isSelectedRow, selectedRows }) => {
    return (
      <Checkbox
        checked={isSelectedRow}
        color="primary"
        onChange={(event) => {
          if (event.nativeEvent.shiftKey) {
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()))
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue))
            setTableToolbar(true)
            const id = parseInt(rowKeyValue)
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id)
            }
            const selectedRowData = tableProps.data.filter((item) => item.id == id)
            inboundIds.push(selectedRowData[0].Inbound_Id)
          } else {
            dispatch(deselectRow(rowKeyValue))
            const id = parseInt(rowKeyValue)
            const itemIndx = selectedRowIds.indexOf(id)
            selectedRowIds.splice(itemIndx, 1)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
            const selectedRowData = tableProps.data.filter((item) => item.id == id)
            const inboundIndx = selectedRowData.indexOf(selectedRowData.Inbound_Id)
            inboundIds.splice(inboundIndx, 1)
          }
        }}
      />
    )
  }

  const allSelect = (event, dispatch) => {
    if (event.currentTarget.checked) {
      dispatch(selectAllFilteredRows())
      setTableToolbar(true)
      setInbounIds(tableProps.data.map((item) => item.Inbound_Id))
      setselectedRowIds(tableProps.data.map((item) => item.id))
    } else {
      dispatch(deselectAllFilteredRows())
      selectedRowIds.splice(0, selectedRowIds.length)
      inboundIds.splice(0, inboundIds.length)
      if (selectedRowIds.length < 1) {
        setTableToolbar(false)
      }
    }
  }

  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => allSelect(event, dispatch)}
      />
    )
  }

  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData))
      return newState
    })
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
    setPendingLoading(true)
    axios
      .post(route('add.pending.bill.call'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setPendingLoading(false)
          toast.success(res.data.msg)
          let columnsData = produce(tableProps, (draft) => {
            const filteredData = draft.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
            draft.data = filteredData
          })
          changeTableProps(columnsData)
          setTableToolbar(false)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        } else {
          setPendingLoading(false)
          toast.error(res.data.msg)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })
        }
      })
      .catch((err) => {
        setPendingLoading(false)
        setOpenRowFunctionalities(false)
        setShowPendingModal({ open: false })
        setselectedRowIds([])
        setInbounIds([])
      })
  }

  const handleArchived = (inboundIds) => {
    setArchiveLoading(true)
    axios
      .post(route('add.arichived.bill.call'), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setArchiveLoading(false)
          toast.success(res.data.msg)
          let columnsData = produce(tableProps, (draft) => {
            const filteredData = draft.data.filter((item) => !inboundIds.includes(item.Inbound_Id))
            draft.data = filteredData
          })
          changeTableProps(columnsData)
          setTableToolbar(false)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowArchivedModal({ open: false })
        } else {
          setArchiveLoading(false)
          toast.error(res.data.msg)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowArchivedModal({ open: false })
        }
      })
      .catch((err) => {
        setArchiveLoading(false)
        setInbounIds([])
        setselectedRowIds([])
        setOpenRowFunctionalities(false)
        setShowArchivedModal({ open: false })
      })
  }

  const handleUpdate = (inboundIds) => {
    const response = []
    let i = 0
    while (i < inboundIds.length) {
      updatePostRequest(inboundIds, i, response)
      i = i + 1
    }
  }

  const updatePostRequest = (inboundIdsParam, id, response) => {
    setUpdateLoading(true)
    axios
      .post(route('update.data'), { inboundIds: inboundIdsParam[id] })
      .then((res) => {
        if (res.status === 200) {
          let updateState
          setCount((prevState) => {
            updateState = prevState + 1
            return prevState + 1
          })
          response.push(res.data)
          if (updateState < inboundIdsParam.length) {
            toast.success(`${updateState}  Record Updated`)
          }
          if (updateState == inboundIdsParam.length) {
            let columnsData = produce(tableProps, (draft) => {
              for (let i = 0; i < res.data.length; i++) {
                if (!res.data[i].edit) res.data.edit = ''
                res.data[i].edit = res.data[i].id
                if (!res.data[i].sl) res.data.sl = ''
                res.data[i].sl = i + 1
              }
              draft.data = res.data
            })
            setCount(0)
            changeTableProps(columnsData)
            toast.success(`${inboundIdsParam.length} Record Updated and Updating Completed`)
            setUpdateLoading(false)
            setTableToolbar(false)
            setInbounIds([])
            setselectedRowIds([])
            setOpenRowFunctionalities(false)
            emptyCheckbox('call-logs-report', columnsData, changeTableProps)
          }
        } else if (res.status === 204) {
          toast.error("The record isn't exist in Ringba")
          setUpdateLoading(false)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          emptyCheckbox('call-logs-report', tableProps, changeTableProps)
        } else {
          toast.error('Updating failed')
          setUpdateLoading(false)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          emptyCheckbox('call-logs-report', tableProps, changeTableProps)
        }
      })
      .catch((err) => {
        toast.error('Updating failed')
        setUpdateLoading(false)
        emptyCheckbox('call-logs-report', tableProps, changeTableProps)
        setInbounIds([])
        setselectedRowIds([])
      })
  }

  const handleAnnotation = (inboundIds) => {
    const response = []
    let i = 0
    while (i < inboundIds.length) {
      annotationPostRequest(inboundIds, i, response)
      i = i + 1
    }
  }
  const annotationPostRequest = (inboundIdsParam, id, response) => {
    setAnnotationLoading(true)
    axios
      .post(route('update.annotation'), { inboundIds: inboundIdsParam[id] })
      .then((res) => {
        if (res.status === 200) {
          let updateState
          setCount((prevState) => {
            updateState = prevState + 1
            return prevState + 1
          })
          response.push(res.data)
          if (updateState < inboundIdsParam.length) {
            toast.success(`${updateState}  Record Updated`)
          }
          if (updateState == inboundIdsParam.length) {
            let columnsData = produce(tableProps, (draft) => {
              for (let i = 0; i < res.data.length; i++) {
                if (!res.data[i].edit) res.data.edit = ''
                res.data[i].edit = res.data[i].id
                if (!res.data[i].sl) res.data.sl = ''
                res.data[i].sl = i + 1
              }
              draft.data = res.data
            })
            setCount(0)
            changeTableProps(columnsData)
            toast.success(`${inboundIdsParam.length} Record Updated and Updating Completed`)
            setAnnotationLoading(false)
            setTableToolbar(false)
            setInbounIds([])
            setselectedRowIds([])
            setOpenRowFunctionalities(false)
            emptyCheckbox('call-logs-report', columnsData, changeTableProps)
          }
        } else {
          setAnnotationLoading(false)
          toast.error(res.data.msg)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          emptyCheckbox('call-logs-report', tableProps, changeTableProps)
        }
      })
      .catch((err) => {
        emptyCheckbox('call-logs-report', tableProps, changeTableProps)
        setAnnotationLoading(false)
      })
  }
  const handleClear = (inboundIds) => {
    setRevenueLoading(true)
    axios
      .post(route('calllogs.revenue.update'), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setRevenueLoading(false)
          toast.success('Successfully Updated')
          let columnsData = produce(tableProps, (draft) => {
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
          setselectedRowIds([])
        } else {
          setRevenueLoading(false)
          toast.error(res.data.msg)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setselectedRowIds([])
        }
      })
      .catch((err) => {
        setRevenueLoading(false)
        setShowRevenueClearModal({ open: false })
        setOpenRowFunctionalities(false)
        setInbounIds([])
        setselectedRowIds([])
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
    setselectedRowIds([])
    setInbounIds([])
    emptyCheckbox('call-logs-report', tableProps, changeTableProps)
  }

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem('call-logs-report'))
      if (storedData != null) {
        emptyCheckbox('call-logs-report', tableProps, changeTableProps)
      }
    }
  }, [])

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
          {updateLoading && (
            <CircularProgress
              color="inherit"
              size="1rem"
              thickness={2}
              style={{ marginLeft: '5px' }}
            />
          )}
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleAnnotation(inboundIds)}
        >
          {'Get Annotation'}
          {annotationLoading && (
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
            Update <PulseLoader color={color} loading={updateLoading} size={5} />
          </span>
          <span onClick={() => handleAnnotation(editData)}>
            Get Annotation <PulseLoader color={color} loading={annotationLoading} size={5} />
          </span>
          <span onClick={() => handleOpenModal(setShowRevenueClearModal, tableProps)}>Clear</span>
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
    const tempData = tableProps.data.filter((item) => item.id == id)

    editData.push(tempData[0].Inbound_Id)
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
                    setFilteredData={setFilteredData}
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
          extendedFilter={(data) => filterData(data, filterValue)}
        />
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
        loading={revenueLoading}
        setLoading={setRevenueLoading}
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
        loading={pendingLoading}
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
        loading={archiveLoading}
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={() =>
          deleteHandler(
            'call.logs.delete',
            selectedRowIds,
            setselectedRowIds,
            tableProps,
            changeTableProps,
            setDeleteLoading,
            setInbounIds,
            setTableToolbar,
            setShowDeleteModal,
            OPTION_KEY
          )
        }
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

CallLogsReport.layout = (page) => <Layout title="Call Logs Report">{page}</Layout>
export default CallLogsReport
