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
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import handleSelects from '@/Helpers/HandleSelects'
import { useStyles, fields, groups, filter, columns } from './Helpers/AffiliateReportProps'
import TextInput from '@/Components/Global/TextInput'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const AffiliateReport = () => {
  const classes = useStyles()
  const { allAffiliates, columnsData, allMarkets } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showArchivedModal, setShowArchivedModal] = useState({
    open: false,
  })
  const [orderByValue, setOrderByValue] = useState('affiliate_name@ASC')
  const showColumnRef = useRef()

  const mapDataArr = (data) => {
    return data.map((item, index) => ({
      edit: item.id,
      affiliate_id: item.affiliate_id,
      affiliate_name: item.affiliate_name,
      tv_households: item.tv_households,
      market: item.market,
      email: item.email,
      telephone: item.telephone,
      address: item.address,
      contact_name: item.contact_name,
      contact_telephone: item.contact_telephone,
      id: item.id,
      key: index,
    }))
  }

  const dataArray = mapDataArr(allAffiliates)

  const optionKey = 'affiliate-report'
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
  const tablePropsRef = useRef(tableProps.data)


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

  const orderByOptions = [
    { label: 'Affiliate Name (Ascending)', value: 'affiliate_name@ASC' },
    { label: 'Affiliate Name (Descending)', value: 'affiliate_name@DESC' },
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
    // { label: 'Created At (Ascending)', value: 'created_at@ASC' },
    // { label: 'Created At (Descending)', value: 'created_at@DESC' }
  ]

  const deleteHandler = () => {
    axios
      .post(route('affiliate.delete'), { selectedRowIds })
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
          setSelectedRowIds([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setSelectedRowIds([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handleEdit = (itemId) => {
    tablePropsRef.current.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const handleArchived = () => {
    axios
      .post(route('move.affiliate.archive'), { selectedRowIds })
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
      .catch((err) => { })
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = () => {
    axios
      .post(route('affiliate.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          filteredData.data.filter((item, indx) => {
            if (item.id === editData.id) {
              filteredData.data[indx].affiliate_id = editData.affiliate_id
              filteredData.data[indx].affiliate_name = editData.affiliate_name
              filteredData.data[indx].email = editData.email
              filteredData.data[indx].telephone = editData.telephone
              filteredData.data[indx].address = editData.address
              filteredData.data[indx].market = editData.market
              filteredData.data[indx].contact_name = editData.contact_name
              filteredData.data[indx].contact_telephone = editData.contact_telephone
            }
          })
          tablePropsRef.current = filteredData.data
          setEditData()
          setShowEditModal({ open: false })
          toast.success(res.data.msg)
        } else {
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

  const getSearchingData = async () => {
    dispatch(showLoading())
    await axios
      .get(
        `/affiliate-report?orderBy=` + orderByValue
        + '&type=orderBy'
      )
      .then((res) => {
        const tmpTableProps = { ...tableProps }
        tmpTableProps.data = mapDataArr(res.data)
        tablePropsRef.current = mapDataArr(res.data)
        changeTableProps(tmpTableProps)
        dispatch(hideLoading())
      })
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

  useEffect(() => {
    getSearchingData()
  }, [orderByValue])

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
      <Helmet title="Affiliate Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              <div className="top-left">
                <MultiSelect
                  options={orderByOptions}
                  onChange={(value) => setOrderByValue(value)}
                  placeholder="Order By"
                  style={{ width: '280px' }}
                  defaultValue={orderByValue}
                  singleSelect
                />
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
        title={'Edit Affiliate'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <TextInput
              label="Affiliate Id"
              name="affiliate_id"
              required={true}
              handleChange={handleEditChange}
              value={editData ? editData.affiliate_id : ''}
            />
            <TextInput
              label="Affiliate Name"
              name="affiliate_name"
              required={true}
              handleChange={handleEditChange}
              value={editData ? editData.affiliate_name : ''}
            />
            <TextInput
              label="Email"
              name="email"
              type="email"
              handleChange={handleEditChange}
              value={editData ? editData.email : ''}
            />
            <TextInput
              label="Telephone"
              name="telephone"
              handleChange={handleEditChange}
              value={editData ? editData.telephone : ''}
            />
            <TextInput
              label="Address"
              name="address"
              handleChange={handleEditChange}
              value={editData ? editData.address : ''}
            />
            <FormControl variant="outlined" className={classes.formControl} fullWidth>
              <InputLabel id="market-label">Select Market</InputLabel>
              <Select
                labelId="market-label"
                id="market"
                name="market"
                value={editData ? editData.market : ''}
                onChange={handleEditChange}
                label="Select Market"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {allMarkets.map((item) => (
                  <MenuItem key={item.market} value={item.market}>{item.market}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

      <ConfirmModal
        open={showArchivedModal.open}
        setOpen={setShowArchivedModal}
        btnAction={handleArchived}
        closeAction={() => handleCloseModal(setShowArchivedModal)}
        width={'450px'}
        title={`${selectedRowIds.length > 1
          ? 'Do you want to move these records to archive?'
          : 'Do you want to move this record to archive?'
          }`}
      ></ConfirmModal>
    </>
  )
}

AffiliateReport.layout = (page) => <Layout title="Affiliate Report">{page}</Layout>
export default AffiliateReport
