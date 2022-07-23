import Layout from "../Layout/Layout"
import React, { useEffect, useState, useRef } from "react"
import { kaReducer, Table } from "ka-table"
import {
  DataType,
  SortingMode,
  PagingPosition,
  EditingMode,
  ActionType,
} from "ka-table/enums"
import { kaPropsUtils } from "ka-table/utils"
import { usePage } from "@inertiajs/inertia-react"
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from "ka-table/actionCreators"
import "ka-table/style.scss"
import search from "../../../images/search.svg"
import eyeIcon from "../../../images/eyeIcon.svg"
import closeNav from "../../../images/closeNav.svg"
import Edit from "../../../images/three-dots.svg"
import { hideColumn, showColumn } from "ka-table/actionCreators"
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean"
import Tooltip from "@material-ui/core/Tooltip"
import DeleteIcon from "@material-ui/icons/Delete"
import produce from "immer"
import IconButton from "@material-ui/core/IconButton"
import Checkbox from "@material-ui/core/Checkbox"
import {
  Button,
  makeStyles,
  CircularProgress,
} from "@material-ui/core"
import axios from "axios"
import { Helmet } from "react-helmet"
import ConfirmModal from "../../Shared/ConfirmModal"
import PulseLoader from "react-spinners/PulseLoader"
import SnackBar from "../../Shared/SnackBar"
import CustomFilter from "../../Components/CustomFilter"
import { filterData } from '../../Helpers/filterData'
import { defaultFilter } from "../../Helpers/Filter"
import { SearchedFields } from "../../Helpers/SearchedFields"

const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}))




const Exceptions = () => {
  const classes = useStyles()
  const { Exceptions } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setselectedRowIds] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [response, setResponse] = useState()
  const [open, setOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [annotationLoading, setAnnotationLoading] = useState(false)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [editData, setEditData] = useState([])
  const [sn, setSn] = useState("")
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
  let [color, setColor] = useState("#36D7B7")
  const [drawerWidth, setDrawerWidth] = useState(350)
  const [count, setCount] = useState(0)
  const [filterValue, setFilterValue] = useState(defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, ''))

  const style = {
    top: position.y < 650 ? position.y - 79 : position.y - 275,
    left: drawerWidth
  }

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY })
    }
  }
  const [filteredData, setFilteredData] = useState(
    filterData(Exceptions, filterValue)
  )

  const dataArray = filteredData.map((item, index) => ({
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
    key: index,
  }))

  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 10 },
      },
      {
        key: "selection-cell",
        style: { width: 80 },
      },
      {
        key: "sl",
        title: "SL",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "SN",
        title: "SN",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Call_Date_Time",
        title: "Call Time (EST)",
        dataType: DataType.string,
        style: { width: 230 },
      },
      {
        key: "Has_Annotation",
        title: "Has Annotation",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "Annotation_Tag",
        title: "Annotation Tag",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "call_Logs_status",
        title: "Call Status",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Duplicate_Call",
        title: "Duplicate Call",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "Recording_Url",
        title: "Recording_Url",
        dataType: DataType.String,
        style: { width: 360 },

      },
      {
        key: "Inbound_Id",
        title: "Inbound Id",
        dataType: DataType.String,
        style: { width: 600 },
      },
      {
        key: "Affiliate",
        title: "Affiliate",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Campaign",
        title: "Campaign",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Inbound",
        title: "Inbound",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Dialed",
        title: "Dialed",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Type",
        title: "Type",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "Customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Target",
        title: "Target",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Target_Number",
        title: "Target Number",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Target_Description",
        title: "Target Description",
        dataType: DataType.String,
        style: { width: 400 },
      },
      {
        key: "Source_Hangup",
        title: "Source/Hangup",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Time_To_Call",
        title: "Time To Call",
        dataType: DataType.Number,
        style: { width: 130 },
      },
      {
        key: "call_Length_In_Seconds",
        title: "Call Length In Seconds",
        dataType: DataType.Number,
        style: { width: 240 },
      },
      {
        key: "Revenue",
        title: "Revenue",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "Conn_Duration",
        title: "Conn.Duration",
        dataType: DataType.Number,
        style: { width: 240 },
      },
      // {
      //   key: "Time",
      //   title: "Time",
      //   dataType: DataType.String,
      //   style: { width: 220 },
      // },
      {
        key: "payoutAmount",
        title: "Payout",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "Total_Cost",
        title: "Total Cost",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "Profit",
        title: "Profit",
        dataType: DataType.Number,
        style: { width: 120 },
      },
      {
        key: "City",
        title: "City",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "State",
        title: "State",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Zipcode",
        title: "Zipcode",
        dataType: DataType.String,
        style: { width: 240 },
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
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === "Recording_Url") {
        return (
          <audio className="audio-data" controls style={{ width: '100%' }}>
            <source src={value} type="audio/mp3" />
            Your browser does not support the <code>audio</code> element.
          </audio>
        )
      }
      if (column.key === "edit") {
        return (
          <div
            className="edit-icon"
            onClick={() => handleRowFunctionalities(value)}
          >
            <img src={Edit} alt="edit-icon"></img>
          </div>
        )
      }
      if (column.key === "Call_Date_Time") {
        if (value !== undefined) {
          let d = new Date(value)
          let hours = d.getHours()
          let minutes = d.getMinutes()
          let ampm = hours >= 12 ? "PM" : "AM"
          hours = hours % 12
          hours = hours ? hours : 12 // the hour "0" should be "12"
          minutes = minutes < 10 ? "0" + minutes : minutes
          let strTime = hours + ":" + minutes + " " + ampm
          return d.getDate() + "-" + new Intl.DateTimeFormat('en', { month: 'short' }).format(d) + "-" + d.getFullYear().toString().substr(-2) + " " + strTime
        }
      }
      if (column.key === "Call_Date") {
        if(value !==undefined){

        let shortMonth = value.toLocaleString('en-us', { month: 'short' })
        let format_date = value
        let dd = String(format_date.getDate()).padStart(2, "0")
        let yyyy = format_date.getFullYear()
        format_date = dd + "-" + shortMonth + "-" + yyyy
        return format_date
      }
    }
    },
  }
  const fields = SearchedFields(tablePropsInit.columns)

  const OPTION_KEY = "exception-report"
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  }
  const [tableProps, changeTableProps] = useState(stateStore)

  const SelectionCell = ({
    rowKeyValue,
    dispatch,
    isSelectedRow,
    selectedRows,
  }) => {
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
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            )
            inboundIds.push(selectedRowData[0].Inbound_Id)
          } else {
            dispatch(deselectRow(rowKeyValue))
            const id = parseInt(rowKeyValue)
            const itemIndx = selectedRowIds.indexOf(id)
            selectedRowIds.splice(itemIndx, 1)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            )
            const inboundIndx = selectedRowData.indexOf(
              selectedRowData.Inbound_Id
            )
            inboundIds.splice(inboundIndx, 1)
          }
        }}
      />
    )
  }
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows()) // also available: selectAllVisibleRows(), selectAllRows()
            setTableToolbar(true)
            let i = 0
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id)
                inboundIds.push(tableProps.data[i].Inbound_Id)
                continue
              }
              i++
            }
          } else {
            dispatch(deselectAllFilteredRows()) // also available: deselectAllVisibleRows(), deselectAllRows()
            // if (selectedRowIds) {
            selectedRowIds.splice(0, selectedRowIds.length)
            inboundIds.splice(0, inboundIds.length)

            // }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
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
  }
  const closeSidebar = () => {
    setSearchSidebar(false)
  }
  const deleteHandler = () => {
    setDeleteLoading(true)
    axios
      .post(route("exception.delete"), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          )
          filteredData.data = newData
          setDeleteLoading(false)
          changeTableProps(filteredData)
          setselectedRowIds([])
          setInbounIds([])
          setTableToolbar(false)
          setOpen(true)
          setResponse(res.data.msg)
          setShowDeleteModal({ open: false })
          emptyCheckbox("exception-report", tableProps, changeTableProps)

        } else {
          setDeleteLoading(false)
          setselectedRowIds([])
          setInbounIds([])
          setTableToolbar(false)
          setOpen(true)
          setResponse(res.data.msg)
          setShowDeleteModal({ open: false })
          emptyCheckbox("exception-report", tableProps, changeTableProps)

        }
      })
      .catch((err) => {
        setDeleteLoading(false)
        setselectedRowIds([])
        setInbounIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
        emptyCheckbox("exception-report", tableProps, changeTableProps)

      })
  }

  const handlePending = (inboundIds) => {
    setPendingLoading(true)
    axios
      .post(route("move.exception.to.pending"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setPendingLoading(false)
          setResponse(res.data.msg)
          setOpen(true)
          let columnsData = produce(tableProps, draft => {
            const filteredData = draft.data.filter(
              (item) => !inboundIds.includes(item.Inbound_Id)
            )
            draft.data = filteredData
          })
          changeTableProps(columnsData)
          setTableToolbar(false)
          setselectedRowIds([])
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })

        } else {
          setPendingLoading(false)
          setResponse(res.data.msg)
          setOpen(true)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          setShowPendingModal({ open: false })

        }
      })
      .catch((err) => {
        setPendingLoading(false)
        setInbounIds([])
        setselectedRowIds([])
        setOpenRowFunctionalities(false)
      })
  }

  const handleArchived = (inboundIds) => {
    setArchiveLoading(true)
    axios
      .post(route("move.exception.to.arhived"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setArchiveLoading(false)
          setResponse(res.data.msg)
          setOpen(true)
          let columnsData = produce(tableProps, draft => {
            const filteredData = draft.data.filter(
              (item) => !inboundIds.includes(item.Inbound_Id)
            )
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
          setResponse(res.data.msg)
          setOpen(true)
          setInbounIds([])
          setselectedRowIds([])
          setShowArchivedModal({ open: false })

        }
      })
      .catch((err) => {
        setArchiveLoading(false)
        setTableToolbar(false)
        setInbounIds([])
        setselectedRowIds([])
        setOpenRowFunctionalities(false)
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
      .post(route("update.exception.report"), { inboundIds: inboundIdsParam[id] })
      .then((res) => {
        if (res.status === 200) {
          let updateState
          setCount(prevState => {
            updateState = prevState + 1
            return prevState + 1
          })
          response.push(res.data)
          if (updateState < inboundIdsParam.length) {
            setResponse(`${updateState}  Record Updated`)
            setOpen(true)
          }
          if (updateState == inboundIdsParam.length) {
            let columnsData = produce(tableProps, draft => {
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
            setResponse(`${inboundIdsParam.length} Record Updated and Updating Completed`)
            setOpen(true)
            setUpdateLoading(false)
            setTableToolbar(false)
            setInbounIds([])
            setselectedRowIds([])
            setOpenRowFunctionalities(false)
            emptyCheckbox("exception-report", columnsData, changeTableProps)
          }
        } else {
          setUpdateLoading(false)
          setResponse(res.data.msg)
          setOpen(true)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          emptyCheckbox("exception-report", tableProps, changeTableProps)
        }
      })
      .catch((err) => {
        setUpdateLoading(false)
        setInbounIds([])
        setselectedRowIds([])
        setOpenRowFunctionalities(false)
        emptyCheckbox("exception-report", tableProps, changeTableProps)
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
      .post(route("exception.get.annotation"), { inboundIds: inboundIdsParam[id] })
      .then((res) => {

        if (res.status === 200) {
          let updateState
          setCount(prevState => {
            updateState = prevState + 1
            return prevState + 1
          })
          response.push(res.data)
          if (updateState < inboundIdsParam.length) {
            setResponse(`${updateState}  Record Updated`)
            setOpen(true)
          }
          if (updateState == inboundIdsParam.length) {
            let columnsData = produce(tableProps, draft => {
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
            setResponse(`${inboundIdsParam.length} Record Updated and Updating Completed`)
            setOpen(true)
            setAnnotationLoading(false)
            setTableToolbar(false)
            setInbounIds([])
            setselectedRowIds([])
            setOpenRowFunctionalities(false)
            emptyCheckbox("exception-report", columnsData, changeTableProps)
          }
        } else {
          setAnnotationLoading(false)
          setResponse(res.data.msg)
          setOpen(true)
          setInbounIds([])
          setselectedRowIds([])
          setOpenRowFunctionalities(false)
          emptyCheckbox("exception-report", tableProps, changeTableProps)
        }
      })
      .catch((err) => {
        emptyCheckbox("exception-report", tableProps, changeTableProps)
        setAnnotationLoading(false)
        setInbounIds([])
        setselectedRowIds([])
      })
  }

  const handleClear = (inboundIds) => {
    setRevenueLoading(true)
    axios
      .post(route("exception.revenue.update"), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setRevenueLoading(false)
          setResponse("Successfully Updated")
          setOpen(true)
          let columnsData = produce(tableProps, draft => {
            draft.data.filter((item) => {
              if (item.Inbound_Id === editData[0]) {
                item.Revenue = ""
                item.payoutAmount = ""
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
          setResponse(res.data.msg)
          setOpen(true)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setselectedRowIds([])

        }
      })
      .catch((err) => {
        setRevenueLoading(false)
        setInbounIds([])
        setselectedRowIds([])
        setOpenRowFunctionalities(false)
        emptyCheckbox("exception-report", tableProps, changeTableProps)
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
    emptyCheckbox("exception-report", tableProps, changeTableProps)
  }

  const emptyCheckbox = (storageName, tempData, changeTableProps) => {
    const storedData = JSON.parse(localStorage.getItem(`${storageName}`))
    storedData.selectedRows = []
    localStorage.setItem("exception-report", JSON.stringify(storedData))
    let filteredData = { ...tempData }
    filteredData.selectedRows = []
    changeTableProps(filteredData)
  }

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("exception-report"))
      if (storedData != null) {
        emptyCheckbox("exception-report", tableProps, changeTableProps)
      }
    }
  }, [])




  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}  >
            <DeleteIcon style={{ color: "#031b4e" }} />
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
          {"Update"}
          {updateLoading && <CircularProgress color="inherit" size="1rem" thickness={2} style={{ marginLeft: "5px" }} />}
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleAnnotation(inboundIds)}
        >
          {"Get Annotation"}
          {annotationLoading && <CircularProgress color="inherit" size="1rem" thickness={2} style={{ marginLeft: "5px" }} />}
        </Button>

        <div className="selection-rows">
          {selectedRowIds.length} Row Selected
        </div>
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

    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [openRowFunctionalities])

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        setShowColumns(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [showColumns])

  const RowFunctionalities = () => {
    return (
      <div
        className="row-functionalities"
        ref={rowFunctionalitiesRef}
        style={style}
      >
        <div>
          <span onClick={() => handleOpenModal(setShowPendingModal)}>Pending </span>
          <span onClick={() => handleOpenModal(setShowArchivedModal)}>Archived</span>
          <span onClick={() => handleUpdate(editData)}>
            Update <PulseLoader color={color} loading={updateLoading} size={5} />
          </span>
          <span onClick={() => handleAnnotation(editData)}>
            Get Annotation{" "}
            <PulseLoader color={color} loading={annotationLoading} size={5} />
          </span>
          <span onClick={() => handleOpenModal(setShowRevenueClearModal, tableProps)}>Clear</span>
        </div >
      </div >
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

  const ColumnSettings = (tableProps) => {
    const columnsSettingsProps = {
      data: tableProps.columns.map((c) => ({
        ...c,
        visible: c.visible !== false,
      })),
      rowKeyField: "key",
      columns: [
        {
          key: "visible",
          title: "Visible",
          isEditable: false,
          style: { textAlign: "center" },
          width: 80,
          dataType: DataType.Boolean,
        },
        {
          key: "title",
          isEditable: false,
          title: "Fields",
          dataType: DataType.String,
        },
      ],
      editingMode: EditingMode.None,
    }
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        )
      }
    }
    return (
      <Table
        {...columnsSettingsProps}
        childComponents={{
          rootDiv: {
            elementAttributes: () => ({
              style: { width: 400, marginBottom: 20 },
            }),
          },
          cell: {
            content: (props) => {
              switch (props.column.key) {
                case "visible":
                  return <CellEditorBoolean {...props} />
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    )
  }

  return (
    <>
      <Helmet title="Exception Report" />

      <div className="selection-demo" onClick={rowFunctionalitiesPosition}>
        {openRowFunctionalities ? <RowFunctionalities /> : ""}
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search"></img>
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <img src={search} alt="search"></img>
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <img src={closeNav} alt="file not found"></img>
                  </a>
                </div>

                <div className="top-element">
                  <CustomFilter mainData={tableProps.data} fields={fields} filterValue={filterValue} setFilterValue={setFilterValue} filteredData={filteredData} setFilteredData={setFilteredData} filterData={filterData} />
                </div>
              </div>
            ) : (
              ""
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <SelectionCell {...props} />
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(
                        tableProps
                      )}
                    // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                    />
                  )
                }
              },

              elementAttributes: (props) => {
                if (props.column.key === "edit") {
                  return {
                    style: {
                      ...props.column.style,
                      position: "sticky",
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
                  case "drag":
                    return (
                      <img
                        style={{ cursor: "move" }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    )
                }
              },

              elementAttributes: (props) => {
                if (props.column.key === "edit") {
                  return {
                    style: {
                      ...props.column.style,
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#fff",
                    },
                  }
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />


        <SnackBar open={open} setOpen={setOpen} response={response} />
      </div>

      <ConfirmModal
        open={showRevenueClearModal.open}
        setOpen={setShowRevenueClearModal}
        btnAction={handleClear}
        closeAction={() => handleCloseModal(setShowRevenueClearModal)}
        editData={editData}
        width={"450px"}
        title={
          <>
            Do you want clear <b>revenue</b> and <b>payout</b> for - <b>{sn}</b>
          </>
        }
        loading={revenueLoading}
      ></ConfirmModal>
      <ConfirmModal
        open={showPendingModal.open}
        setOpen={setShowPendingModal}
        btnAction={() => handlePending(inboundIds.length > 0 ? inboundIds : editData)}
        closeAction={() => handleCloseModal(setShowPendingModal)}
        width={"450px"}
        title={`${inboundIds.length > 1
          ? "Do you want to move these records to pending?"
          : "Do you want to move this record to pending?"
          }`}
        loading={pendingLoading}

      ></ConfirmModal>
      <ConfirmModal
        open={showArchivedModal.open}
        setOpen={setShowArchivedModal}
        btnAction={() => handleArchived(inboundIds.length > 0 ? inboundIds : editData)}
        closeAction={() => handleCloseModal(setShowArchivedModal)}
        editData={editData}
        width={"450px"}
        title={`${inboundIds.length > 1
          ? "Do you want to move these records to archive?"
          : "Do you want to move this record to archive?"
          }`}
        loading={archiveLoading}
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={"400px"}
        title={`${inboundIds.length > 1
          ? "Do you want to delete these records?"
          : "Do you want to delete this record?"
          }`}
        loading={deleteLoading}
      ></ConfirmModal>
    </>
  )
}

Exceptions.layout = (page) => <Layout title="Exceptions">{page}</Layout>
export default Exceptions
