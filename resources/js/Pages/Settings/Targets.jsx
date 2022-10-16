import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import Switch from '@material-ui/core/Switch'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import { useStyles, fields, groups, filter, columns } from './Helpers/TargetsProps'

const Targets = () => {
  const classes = useStyles()
  const { allTargets, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

  const dataArray = allTargets.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    customer: item.Customer,
    Ringba_Target_Name: item.Ringba_Targets_Name,
    Description: item.Description,
    status: [item.status, item.id],
    id: item.id,
    key: index,
  }))

  const optionKey = 'target-report'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
        ? JSON.parse(columnsData[0])?.[optionKey]
        : columns,
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
            onChange={() => handleStatus(event, value[0], value[1])}
          />
        )
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const handleStatus = (e, value, rowId) => {
    axios
      .post(route('target.status.update'), { value: value, rowId: rowId })
      .then((res) => {
        let tmpData = { ...tableProps }
        tmpData.data.filter((item, indx) => {
          if (item.id === rowId) {
            if (tmpData.data[indx].status[0] == 1) {
              tmpData.data[indx].status = [0, rowId]
            } else {
              tmpData.data[indx].status = [1, rowId]
            }
          }
        })
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

  const deleteHandler = () => {
    axios
      .post(route('target.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          setSelectedRowIds([])
          changeTableProps(filteredData)
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setSelectedRowIds([])
          setTableToolbar(false)
          setShowDeleteModal({ open: false })
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setSelectedRowIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
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
      .post(route('target.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].customer = editData.customer
              filteredData.data[indx].Ringba_Target_Name = editData.Ringba_Target_Name
              filteredData.data[indx].Description = editData.Description
            }
          })
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
          setSelectedRowIds([])
        } else {
          setEditData()
          setShowEditModal({ open: false })
          toast.error(res.data.msg)
          setSelectedRowIds([])
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
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Targets Report" />
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
          extendedFilter={(data) => filterData(data, filterValue)}
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Targets'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <span>Customer:</span>
            <TextField
              value={editData ? editData.customer : ''}
              fullWidth
              margin="normal"
              name="customer"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Description:</span>
            <TextField
              value={editData ? editData.Description : ''}
              fullWidth
              margin="normal"
              name="Description"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Ringba Target Name:</span>
            <TextField
              value={editData ? editData.Ringba_Target_Name : ''}
              fullWidth
              margin="normal"
              name="Ringba_Target_Name"
              type="text"
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
        title={`${
          selectedRowIds.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
      ></ConfirmModal>
    </>
  )
}

Targets.layout = (page) => <Layout title="Targets">{page}</Layout>
export default Targets
