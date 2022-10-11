import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import { Button, makeStyles } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import toast from 'react-hot-toast'

const useStyles = makeStyles(() => ({
  topBtn: {
    display: 'flex',
    gap: '10px',
    marginLeft: '10px',
  },
  button: {
    width: 130,
    textTransform: 'capitalize',
    fontSize: '14px',
  },
  editButton: {
    marginTop: '15px',
  },
}))

const operators = [
  {
    caption: 'Contains',
    name: 'contains',
  },
  {
    caption: 'Not Contains',
    name: 'doesNotContain',
  },
  {
    caption: 'Is Empty',
    name: 'isEmpty',
  },
  {
    caption: 'Is Not Empty',
    name: 'isNotEmpty',
  },
  {
    caption: 'Starts With',
    name: 'startswith',
  },
  {
    caption: 'Ends With',
    name: 'endsWith',
  },
  {
    caption: 'Is',
    name: 'is',
  },
  {
    caption: 'Is Not',
    name: 'isnot',
  },
]

export const fields = [
  {
    caption: 'customer',
    name: 'customer',
    operators,
  },
  {
    caption: 'email',
    name: 'email',
    operators,
  },
  {
    caption: 'telephone',
    name: 'telephone',
    operators,
  },
]

export const groups = [
  {
    caption: 'And',
    name: 'and',
  },
  {
    caption: 'Or',
    name: 'or',
  },
]

export const filter = {
  groupName: 'and',
  items: [
    {
      field: 'customer',
      operator: 'isNotEmpty',
    },
  ],
}

const CustomerReport = () => {
  const classes = useStyles()
  const { allCustomers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showArchivedModal, setShowArchivedModal] = useState({
    open: false,
  })
  const showColumnRef = useRef()

  const dataArray = allCustomers.map((item, index) => ({
    edit: item.id,
    customer: item.customer_name,
    email: item.email,
    telephone: item.telephone,
    address: item.address,
    id: item.id,
    key: index,
  }))

  const columns = [
    {
      key: 'edit',
      style: { width: 20 },
      visible: true,
    },
    {
      key: 'selection-cell',
      style: { width: 80 },
      visible: true,
    },
    {
      key: 'customer',
      title: 'Customer',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'telephone',
      title: 'Telephone',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'address',
      title: 'Address',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
  ]

  const optionKey = 'customer-report'
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
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

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
      .post(route('customer.delete'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          changeTableProps(filteredData)
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
        } else {
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
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

  const handleArchived = () => {
    axios
      .post(route('move.customer.archive'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          changeTableProps(filteredData)
          setTableToolbar(false)
          setSelectedRowIds([])
          setShowArchivedModal({ open: false })
        } else {
          toast.error(res.data.msg)
          setSelectedRowIds([])
          setShowArchivedModal({ open: false })
        }
      })
      .catch((err) => {})
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('customer.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].customer = editData.customer
              filteredData.data[indx].email = editData.email
              filteredData.data[indx].telephone = editData.telephone
              filteredData.data[indx].address = editData.address
            }
          })
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setEditData()
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

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      // Cleanup the event listener
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
          onClick={() => handleOpenModal(setShowArchivedModal)}
        >
          Archived
        </Button>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Customer Report" />

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
        title={'Edit Customer'}
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
            <span>Email:</span>
            <TextField
              value={editData ? editData.email : ''}
              fullWidth
              margin="normal"
              name="email"
              type="email"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Telephone:</span>
            <TextField
              value={editData ? editData.telephone : ''}
              fullWidth
              margin="normal"
              name="telephone"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <span>Address:</span>
            <TextField
              value={editData ? editData.address : ''}
              fullWidth
              margin="normal"
              name="address"
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

      <ConfirmModal
        open={showArchivedModal.open}
        setOpen={setShowArchivedModal}
        btnAction={handleArchived}
        closeAction={() => handleCloseModal(setShowArchivedModal)}
        width={'450px'}
        title={`${
          selectedRowIds.length > 1
            ? 'Do you want to move these records to archive?'
            : 'Do you want to move this record to archive?'
        }`}
      ></ConfirmModal>
    </>
  )
}

CustomerReport.layout = (page) => <Layout title="Customer Report">{page}</Layout>
export default CustomerReport
