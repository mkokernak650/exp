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
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import toast from 'react-hot-toast'
import { useStyles, fields, groups, filter, columns } from './Helpers/ArchivedCustomersProps'
import TextInput from '../../Components/Global/TextInput'

const ArchivedCustomers = () => {
  const classes = useStyles()
  const { allCustomers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showActiveModal, setShowActiveModal] = useState({
    open: false,
  })
  const [editData, setEditData] = useState()
  const showColumnRef = useRef()
  const [errors, setErrors] = useState({});

  const dataArray = allCustomers.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    customer: item.customer_name,
    email: item.email,
    telephone: item.telephone,
    address: item.address,
    contact_name: item.contact_name,
    contact_telephone: item.contact_telephone,
    id: item.id,
    key: index,
  }))

  const optionKey = 'customer-archived'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      // columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      //   ? JSON.parse(columnsData[0])?.[optionKey]
      //   : 
      columns,
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

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const handleActive = () => {
    axios
      .post(route('active.customer'), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          let filteredData = tableProps
          const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
          filteredData.data = newData
          changeTableProps(filteredData)
          setTableToolbar(false)
          setSelectedRowIds([])
          setShowActiveModal({ open: false })
        } else {
          toast.error(res.data.msg)
          setSelectedRowIds([])
          setShowActiveModal({ open: false })
        }
      })
      .catch((err) => { })
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
              filteredData.data[indx].contact_name = editData.contact_name
              filteredData.data[indx].contact_telephone = editData.contact_telephone
            }
          })
          setEditData()
          setErrors({})
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
          setErrors({})
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        setErrors(err.response.data.errors)
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
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleOpenModal(setShowActiveModal)}
        >
          Active
        </Button>
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="Archived Customers" />
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
                    // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
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
            <TextField
              label="Customer Name"
              value={editData ? editData.customer : ''}
              fullWidth
              margin="normal"
              name="customer"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
              required
              error={errors?.customer}
              helperText={errors?.customer?.[0]}
            />
            <TextField
              label="Email"
              value={editData ? editData.email : ''}
              fullWidth
              margin="normal"
              name="email"
              type="email"
              variant="outlined"
              onChange={handleEditChange}
            />
            <TextField
              label="Telephone"
              value={editData ? editData.telephone : ''}
              fullWidth
              margin="normal"
              name="telephone"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <TextField
              label="Address"
              value={editData ? editData.address : ''}
              fullWidth
              margin="normal"
              name="address"
              type="text"
              variant="outlined"
              onChange={handleEditChange}
            />
            <TextInput
              label="Contact Name"
              name="contact_name"
              handleChange={handleEditChange}
              value={editData ? editData.contact_name : ''}
            />
            <TextInput
              label="Contact Telephone"
              name="contact_telephone"
              handleChange={handleEditChange}
              value={editData ? editData.contact_telephone : ''}
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
        open={showActiveModal.open}
        setOpen={setShowActiveModal}
        btnAction={handleActive}
        closeAction={() => handleCloseModal(setShowActiveModal)}
        width={'450px'}
        title={`${selectedRowIds.length > 1
          ? 'Do you want to active these customers?'
          : 'Do you want to active this customer?'
          }`}
      ></ConfirmModal>
    </>
  )
}

ArchivedCustomers.layout = (page) => <Layout title="Archived Customers">{page}</Layout>
export default ArchivedCustomers
