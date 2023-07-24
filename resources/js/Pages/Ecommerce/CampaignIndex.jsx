import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode, PagingPosition } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { InertiaLink, usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import 'ka-table/style.scss'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import Edit from '@/Components/Icons/Edit.jsx'
import Switch from '@material-ui/core/Switch'
import { Button, TextField } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import { columns, useStyles, fields, groups, filter } from './Helpers/CampaignIndexProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CampaignIndex = () => {
  const classes = useStyles()
  const { campaigns, columnsData, customers } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const CustomerHandleChange = (value) => {
    setEditData({ ...editData, customer_id: value })
  }

  const dataArray = campaigns.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    campaign_name: item?.campaign_name,
    affiliates: item.id,
    customer_name: item?.customer?.customer_name,
    customer_id: item?.customer?.id.toString(),
    status: [item.status, item.id, index],
    created_at: item.created_at,
    updated_at: item.updated_at,
    id: item.id,
    key: index,
  }))

  const customersOption = customers.map(customer => ({
    value: customer.id.toString(),
    label: customer.customer_name,
  }))

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const optionKey = 'campaign-index'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
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
      if (column.key === 'affiliates') {
        return (
          <InertiaLink href={route('ecommerce.campaigns.affiliates', value)} >Affiliates</InertiaLink>
        )
      }
      if (column.key === 'status') {
        if (typeof value === 'string') {
          value = value.split(',')
        }
        return (
          <Switch
            checked={parseInt(value[0]) === 1 && true}
            color="primary"
            onChange={() => handleStatus(value[0], value[1], value[2])}
          />
        )
      }

      if (column.key === 'created_at' || column.key === 'updated_at') {
        return DateTimeFormat(value)
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

  const headers = {
    headers: { Accept: 'application/json' },
  }

  const handleStatus = (value, rowId, index) => {
    let status = parseInt(value) === 1 ? 0 : 1
    axios
      .post(route('ecommerce-campaigns.status.update', rowId), { status }, headers)
      .then((res) => {
        let tmpData = { ...tableProps }
        tmpData.data[index].status = [status, rowId, index]
        changeTableProps({ ...tmpData })
        toast.success(res.data.msg)
      })
      .catch((err) => {
        Object.values(err.response.data?.errors).map((error) => {
          toast.error(error[0])
        })
      })
  }

  const deleteHandler = () => {
    axios
      .post(route('ecommerce-campaigns.deleteSelected'), { selectedRowIds })
      .then((res) => {
        let tmpData = tableProps
        const newData = tmpData.data.filter((item) => !selectedRowIds.includes(item.id))
        tmpData.data = newData
        changeTableProps({ ...tmpData })

        setSelectedRowIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
        toast.success(res.data.msg)
      })
      .catch((err) => {
        setShowDeleteModal({ open: false })
        toast.error('Something went wrong, please try again')
      })
  }

  const handleEditSubmit = () => {
    axios
      .put(route('ecommerce-campaigns.update', editData.id), editData, headers)
      .then((res) => {
        let tmpData = { ...tableProps }
        let tmpEditData = { ...editData }
        tmpEditData.updated_at = res.data.updated_at
        tmpEditData.customer_name = res.data.customer_name
        tmpData.data[editData.sl - 1] = tmpEditData
        changeTableProps({ ...tmpData })
        setEditData()
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      })
      .catch((err) => {
        Object.values(err.response.data?.errors).map((error) => {
          toast.error(error[0])
        })
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
        <div className="selection-rows">{selectedRowIds.length} Row Selected</div>
      </div>
    )
  }

  return (
    <>
      <Helmet title="E-commerce Campaign Index" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
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
        title={'Edit E-commerce Campaign'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  value={editData ? editData?.campaign_name : ''}
                  label="Campaign Name"
                  type="text"
                  name="campaign_name"
                  placeholder=""
                  onChange={handleEditChange}
                  fullWidth
                  required={true}
                />
              </Grid>

              <Grid item xs={12}>
                <MultiSelect
                  singleSelect
                  placeholder="Select Customer"
                  options={customersOption}
                  defaultValue={editData?.customer_id}
                  onChange={value => CustomerHandleChange(value)}
                  style={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditSubmit}
                  className={classes.editButton}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
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

CampaignIndex.layout = (page) => <Layout title="E-commerce Campaign Index">{page}</Layout>
export default CampaignIndex
