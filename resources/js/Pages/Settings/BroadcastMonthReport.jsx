import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'
import Switch from '@material-ui/core/Switch'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import CheckOutsideClick from '@/Helpers/CheckOutsideClick'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import toast from 'react-hot-toast'
import { useStyles, fields, groups, filter, columns } from './Helpers/BroadcastMonthReportProps'
import mergeColumns from '@/Helpers/MergeColumns'
import { hideLoading, showColumn, showLoading } from 'ka-table/actionCreators'
import { Pagination } from 'react-laravel-paginex'

const BroadcastMonthReport = () => {
  const classes = useStyles()
  const { allBroadCastMonths, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const showColumnRef = useRef()
  const [broadCastMonths, setBroadCastMonths] = useState(allBroadCastMonths)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)

  const mapDataArr = (data) => {
    return data.map((item, index) => ({
      edit: item.id,
      sl: index + 1,
      broad_cast_month: item.broad_cast_month,
      start_date: item.start_date,
      end_date: item.end_date,
      days_count: item.days_count,
      status: [item.status, item.id],
      id: item.id,
      key: index,
    }))
  }

  const dataArray = mapDataArr(allBroadCastMonths.data)

  const optionKey = 'broadcast-month-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns: mergeColumns(
      columns,
      columnsData.length ? JSON.parse(columnsData[0])?.[optionKey] : null
    ),
    loading: {
      enabled: false,
      text: 'Loading...',
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === 'edit') {
        return (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <Edit />
          </div>
        )
      }
      if (column.key === 'status') {
        return (
          <Switch
            checked={value[0] === 1 && true}
            color="primary"
            onChange={() => handleStatus(value[0], value[1])}
          />
        )
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)
  const tablePropsRef = useRef(tableProps.data)

  const handleStatus = (value, rowId) => {
    axios
      .post(route('broadcast.month.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        let tmpData = { ...tableProps }
        tablePropsRef.current.filter((item) => {
          if (item.id === rowId) {
            if (item.status[0] == 1) {
              item.status = [0, rowId]
            } else {
              item.status = [1, rowId]
            }
          }
        })
        tmpData.data = tablePropsRef.current
        changeTableProps(tmpData)
        toast.success(res.data.msg)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const dispatch = (action) => {
    handleSelects({
      action,
      selectedRowIds,
      setSelectedRowIds,
      tableProps,
      setTableToolbar,
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

  const [filterValue, changeFilter] = useState(filter)

  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
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

  const handleEdit = (itemId) => {
    tablePropsRef.current.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('broadcast.month.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].broad_cast_month = editData.broad_cast_month
              filteredData.data[indx].start_date = editData.start_date
              filteredData.data[indx].end_date = editData.end_date
              filteredData.data[indx].days_count = res.data.days_count
            }
          })
          setEditData([])
          tablePropsRef.current = filteredData.data
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setEditData([])
          setShowEditModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowIds([])
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const deleteHandler = () => {
    axios
      .post(route('broadcast.month.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          changeTableProps(filteredData)
          tablePropsRef.current = newData
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    const closeColumnSetting = (e) => {
      CheckOutsideClick(e, showColumn, setShowColumns, showColumnRef)
    }
    document.addEventListener('mousedown', closeColumnSetting)
    return () => {
      document.removeEventListener('mousedown', closeColumnSetting)
    }
  }, [showColumns])


  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'broadcast-month-report?page=' +
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
        setBroadCastMonths(res.data)
        dispatch(hideLoading())
      })
  }

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={() => handleOpenModal(setShowDeleteModal)}>
            <DeleteIcon style={{ color: '#031b4e' }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage, filterValue])

  return (
    <>
      <Helmet title="Broadcast Month Report" />

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
                  <FilterControl
                    {...{
                      fields,
                      groups,
                      filterValue,
                      onFilterValueChanged: onFilterChanged,
                    }}
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
          <Pagination changePage={getSearchingData} data={broadCastMonths} />
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit BroadCast Month'}
      >
        <div className="edit-broadcast-month">
          <form className={classes.form}>
            <span>BroadCast Month:</span>
            <TextField
              value={editData ? editData.broad_cast_month : ''}
              fullWidth
              margin="normal"
              name="broad_cast_month"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Start Date:</span>
            <TextField
              defaultValue={editData ? editData.start_date : ''}
              fullWidth
              margin="normal"
              name="start_date"
              type="date"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>End Date:</span>

            <TextField
              defaultValue={editData ? editData.end_date : ''}
              fullWidth
              margin="normal"
              name="end_date"
              type="date"
              variant="outlined"
              onChange={handleEditChange}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
            >
              Edit
            </Button>
          </form>

          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon">
            <Cancel />
          </div>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${selectedRowIds.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
      ></ConfirmModal>
    </>
  )
}

BroadcastMonthReport.layout = (page) => <Layout title="BroadcastMonthReport">{page}</Layout>
export default BroadcastMonthReport
