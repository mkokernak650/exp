import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import Edit from '../../../images/three-dots.svg'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import produce from 'immer'
import { makeStyles, TextField } from '@material-ui/core'
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



const BilledCallLogs = () => {
  const { billedCallLogs, campaignsWithAnnotations, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [inboundIds, setInbounIds] = useState([])
  const [showRevenueClearModal, setShowRevenueClearModal] = useState({
    open: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const showColumnRef = useRef()
  const editData = []
  const [filterValue, setFilterValue] = useState(
    defaultFilter('and', 'SN', 'isNotEmpty', 'string', 0, '')
  )
  const [sn, setSn] = useState('')
  const [openRowFunctionalities, setOpenRowFunctionalities] = useState(false)
  const rowFunctionalitiesRef = useRef()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [billedData, setBilledData] = useState(billedCallLogs)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const style = {
    top: position.y < 650 ? position.y - 79 : position.y - 275,
    left: 350,
  }

  const updateAnnotation = (e, tableIndex, index) => {
    e.preventDefault()
    axios
      .post(route('change.annotation', 'billedCallLog'), {
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
        Recording_Url: item.Recording_Url,
        Call_Date_Time: item.Call_Date_Time,
        Call_Date: item.Call_Date,
        Duplicate_Call: item.Duplicate_Call,
        Customer: item.Customer,
        Affiliate: item.Affiliate,
        Market: item.Market,
        Campaign: item.Campaign,
        Inbound: item.Inbound,
        Inbound_Id: item.Inbound_Id,
        Dialed: item.Dialed,
        Type: item.Type,
        Target: item.Target,
        Target_Number: item.Target_Number,
        Target_Description: item.Target_Description,
        Source_Hangup: item.Source_Hangup,
        Conn_Duration: item.Conn_Duration,
        Time_To_Call: item.Time_To_Call,
        call_Length_In_Seconds: item.call_Length_In_Seconds,
        Revenue: item.Revenue,
        payoutAmount: item.payoutAmount,
        Total_Cost: item.Total_Cost,
        Profit: item.Profit,
        Call_Status: item.call_Logs_status,
        City: item.City,
        State: item.State,
        Zipcode: item.Zipcode,
        Annotation_Tag: [item.Annotation_Tag, item.Campaign, item.id, index],
        Has_Annotation: item.Has_Annotation,
        id: item.id,
        key: index,
      }
    })
  }
  const dataArray = mapDataArr(billedCallLogs.data)

  const columns = [
    {
      key: 'edit',
      style: { width: 10 },
      visible: false,
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
      key: 'Call_Status',
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
      dataType: DataType.String,
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
  ]

  const optionKey = 'billed-call-logs'
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
            <img src={Edit} alt="edit-icon"></img>
          </div>
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
      if (column.key === 'Annotation_Tag') {
        if (typeof value == 'string') {
          value = value.split(',')
        }
        return (
          <TextField
            select
            name="annotation_id"
            onChange={(e) => updateAnnotation(e, value[2], value[3])}
            SelectProps={{
              native: true,
            }}
            fullWidth
            defaultValue={value[0]}
          >
            <option value="">Select Annotation</option>
            {campaignsWithAnnotations
              .filter((campaign) => campaign.campaign_name == value[1])[0]
              ?.annotations.map((annotation, index) => (
                <option key={annotation.id} value={annotation.id}>
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
      .post(route('billed.delete'), { selectedRowIds })
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
          setInbounIds([])
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setDeleteLoading(false)
        setInbounIds([])
        setSelectedRowIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  // const handleAnnotation = (inboundIds) => {
  //   const response = []
  //   let i = 0
  //   while (i < inboundIds.length) {
  //     annotationPostRequest(inboundIds, i, response)
  //     i = i + 1
  //   }
  // }
  // const annotationPostRequest = (inboundIdsParam, id, response) => {
  //   setAnnotationLoading(true)
  //   axios
  //     .post(route('billed.get.annotation'), { inboundIds: inboundIdsParam[id] })
  //     .then((res) => {
  //       setAnnotationLoading(false)
  //       if (res.status === 200) {
  //         console.log(res)
  //         let updateState

  //         response.push(res.data)
  //         if (updateState < inboundIdsParam.length) {
  //           toast.success(`${updateState}  Record Updated`)
  //         }
  //         if (updateState == inboundIdsParam.length) {
  //           let columnsData = produce(tableProps, (draft) => {
  //             for (let i = 0; i < res.data.length; i++) {
  //               if (!res.data[i].edit) res.data.edit = ''
  //               res.data[i].edit = res.data[i].id
  //               if (!res.data[i].sl) res.data.sl = ''
  //               res.data[i].sl = i + 1
  //             }
  //             draft.selectedRows = []
  //             draft.data = res.data
  //           })
  //           changeTableProps(columnsData)
  //           toast.success(`${inboundIdsParam.length} Record Updated and Updating Completed`)
  //           setTableToolbar(false)
  //           setInbounIds([])
  //           setSelectedRowIds([])
  //           setOpenRowFunctionalities(false)
  //         }
  //       } else {
  //         setAnnotationLoading(false)
  //         toast.success(res.data.msg)
  //         setInbounIds([])
  //         setSelectedRowIds([])
  //         setOpenRowFunctionalities(false)
  //         emptyCheckbox('billed-call-logs', tableProps, changeTableProps)
  //       }
  //     })
  //     .catch((err) => {
  //       emptyCheckbox('billed-call-logs', tableProps, changeTableProps)
  //       setAnnotationLoading(false)
  //       setInbounIds([])
  //       setSelectedRowIds([])
  //     })
  // }

  const handleClear = (inboundIds) => {
    setRevenueLoading(true)
    axios
      .post(route('bill.calllogs.revenue.update'), { inboundIds })
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
          setSelectedRowIds([])
        } else {
          setRevenueLoading(false)
          toast.success(res.data.msg)
          setShowRevenueClearModal({ open: false })
          setOpenRowFunctionalities(false)
          setInbounIds([])
          setSelectedRowIds([])
        }
      })
      .catch((err) => {
        setRevenueLoading(false)
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
    setTableToolbar(false)
    setSelectedRowIds([])
  }

  const handleDeleteOpenModal = () => {
    setShowDeleteModal({ open: true })
  }
  const getSearchingData = async (data) => {
    setcurrentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'billed-call-log-report?page=' +
          data.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        const tmpTableProps = { ...tableProps }
        tmpTableProps.data = mapDataArr(res.data.data)
        tablePropsRef.current = mapDataArr(res.data.data)
        changeTableProps(tmpTableProps)
        setBilledData(res.data)
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

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={handleDeleteOpenModal}>
            <DeleteIcon style={{ color: '#031b4e' }} />
          </IconButton>
        </Tooltip>
        {/* 
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
        </Button> */}
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Billed Call Logs Report" />
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
          <Pagination changePage={getSearchingData} data={billedData} />
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
        loading={revenueLoading}
        setLoading={setRevenueLoading}
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

BilledCallLogs.layout = (page) => <Layout title="Billed Call Logs">{page}</Layout>
export default BilledCallLogs
