import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { kaPropsUtils } from 'ka-table/utils'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
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
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField from '@material-ui/core/TextField'
import { Button } from '@material-ui/core'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import SelectionHeader from '@/Components/TableComponents/SelectionHeader'
import SelectionCell from '@/Components/TableComponents/SelectionCell'
import addTableDetails from '@/Helpers/AddTableDetails'
import handleSelects from '@/Helpers/HandleSelects'
import { Pagination } from 'react-laravel-paginex'
import { columns, useStyles, fields, groups, filter } from './Helpers/SalesIndexProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const SalesIndex = () => {
  const classes = useStyles()
  const { sales, campaigns, customers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [loading, setLoading] = useState(false)
  const [salesData, seteSalesData] = useState(sales)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const showColumnRef = useRef()
  const [filterByCampaigns, setFilterByCampaigns] = useState('')
  const [filterByCustomers, setFilterByCustomers] = useState('')
  const [filterByDate, setFilterByDate] = useState({ startDate: '', endDate: '' })

  const handleEditChange = ({ target: { name, value } }) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value }))
  }

  const headers = {
    headers: { Accept: 'application/json' },
  }

  const getCustomerNameById = (id) => {
    const customer = customers.find((customer) => customer.id == id)
    return customer ? customer.customer_name : ''
  }

  const getCampaignNameById = (id) => {
    const campaign = campaigns.find((campaign) => campaign.id == id)
    return campaign ? campaign.campaign_name : ''
  }

  const campaignOptions = campaigns.map((item) => ({
    label: item.campaign_name,
    value: item.id.toString(),
  }))

  const customerOptions = customers.map((item) => ({
    label: item.customer_name,
    value: item.id.toString(),
  }))

  const dateHandleChange = (event) => {
    setFilterByDate((oldValues) => ({ ...oldValues, [event.target.name]: event.target.value }))
  }

  const handleEditSubmit = () => {
    axios
      .put(route('ecommerce-sales.update', editData?.id), editData, headers)
      .then((res) => {
        console.log(res)
        let campaignName = getCampaignNameById(editData?.campaign_id)
        let customerName = getCustomerNameById(editData?.customer_id)
        const tmpTableProps = { ...tableProps }
        tablePropsRef.current.filter((item) => {
          if (item.id === editData.id) {
            item.campaign = campaignName
            item.campaign_id = editData.campaign_id
            item.customer = customerName
            item.customer_id = editData.customer_id
            item.coupon_code = res.data.data.coupon_code
            item.user_ip = res.data.data.user_ip
            item.order_no = res.data.data.order_no
            item.subtotal = res.data.data.subtotal
            item.total = res.data.data.total
            item.shipping_cost = res.data.data.shipping_cost
            item.shipping_zip = res.data.data.shipping_zip
            item.shipping_state = res.data.data.shipping_state
            item.shipping_city = res.data.data.shipping_city
            item.billing_zip = res.data.data.billing_zip
            item.dialed = res.data.data.dialed
            item.inbound = res.data.data.inbound
            item.updated_at = res.data.updated_at
          }
        })

        tmpTableProps.data = tablePropsRef.current
        changeTableProps(tmpTableProps)
        setEditData()
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      })
      .catch((err) => {
        let errors = ''
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + '\n'
          })
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg
        }
        toast.error(errors)
      })
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        edit: item.id,
        campaign_id: item?.campaign_id,
        customer_id: item?.customer_id,
        campaign: item?.campaign?.campaign_name,
        customer: item?.customer?.customer_name,
        affiliate_name: item?.affiliate_name,
        order_type: item?.order_type == 1 ? 'E-commerce' : 'Phone',
        dialed: item?.dialed,
        inbound: item?.inbound,
        revenue: item?.revenue,
        order_no: item.order_no,
        coupon_code: item.coupon_code,
        user_ip: item.user_ip,
        shipping_city: item.shipping_city,
        shipping_state: item.shipping_state,
        shipping_zip: item.shipping_zip,
        billing_zip: item.billing_zip,
        quantity: item.quantity,
        subtotal: item.subtotal,
        shipping_cost: item.shipping_cost,
        total: item.total,
        order_at: item.formatted_order_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        id: item.id,
        key: index,
      }
    })
  }

  const dataArray = mapDataArr(sales.data)

  const handleEdit = (itemId) => {
    tablePropsRef.current.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const optionKey = 'sales-index'
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
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <Edit />
          </div>
        )
      }
      if (column.key === 'order_at') {
        if (value !== undefined) {
          let d = new Date(value)
          let hours = d.getHours()
          let minutes = d.getMinutes()
          let ampm = hours >= 12 ? 'PM' : 'AM'
          hours = hours % 12
          hours = hours ? hours : 12 // the hour "0" should be "12"
          minutes = minutes < 10 ? '0' + minutes : minutes
          let strTime = hours + ':' + minutes + ' ' + ampm
          return (
            d.getDate() +
            '-' +
            new Intl.DateTimeFormat('en', { month: 'short' }).format(d) +
            '-' +
            d.getFullYear().toString() +
            ' ' +
            strTime
          )
        }
      }
      if (column.key === 'created_at' || column.key === 'updated_at') {
        if (value !== undefined) {
          return DateTimeFormat(value)
        }
      }
    },
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)
  const tablePropsRef = useRef(tableProps.data)

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
      .post(route('ecommerce-sales.deleteSelected'), { selectedRowIds })
      .then((res) => {
        let filteredData = tableProps
        const newData = filteredData.data.filter((item) => !selectedRowIds.includes(item.id))
        filteredData.data = newData
        changeTableProps(filteredData)
        tablePropsRef.current = filteredData?.data
        setSelectedRowIds([])
        getSearchingData(currentPage)
        setTableToolbar(false)
        toast.success(res.data.msg)
        setShowDeleteModal({ open: false })
      })
      .catch((err) => {
        toast.error(err.response.data.msg)
        setShowDeleteModal({ open: false })
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

  const getSearchingData = async (data) => {
    setcurrentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'ecommerce-sales?page=' +
        data.page +
        '&itemPerPage=' +
        itemPerPage +
        '&filteredValue=' +
        JSON.stringify(filterValue) +
        '&filterByCampaigns=' + filterByCampaigns +
        '&filterByCustomers=' + filterByCustomers +
        '&filterByDate=' + JSON.stringify(filterByDate)
      )
      .then((res) => {
        const tmpTableProps = { ...tableProps }
        tmpTableProps.data = mapDataArr(res.data.data)
        changeTableProps(tmpTableProps)
        tablePropsRef.current = mapDataArr(res.data.data)
        seteSalesData(res.data)
        dispatch(hideLoading())
      })
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(currentPage)
  }, [itemPerPage, filterValue, filterByCampaigns, filterByCustomers, filterByDate])

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

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get('ecommerce-sales-export?filterValue=' + JSON.stringify(filterValue))
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          console.log(res)
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  return (
    <>
      <Helmet title="Sales Index" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top-flex-start">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <Eye />
              </div>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={exportHandler}
                disabled={sales == ''}
              >
                {loading ? (
                  <CircularProgress color="inherit" thickness={3} size="1.5rem" />
                ) : (
                  'Searched Export'
                )}
              </Button>
            </div>
            <div className="top-left">
              <MultiSelect
                options={campaignOptions}
                placeholder="Campaign"
                style={{ width: '250px' }}
                onChange={(value) => setFilterByCampaigns(value)}
                defaultValue={filterByCampaigns}
              />
              <MultiSelect
                options={customerOptions}
                placeholder="Customer"
                style={{ width: '250px' }}
                onChange={(value) => setFilterByCustomers(value)}
                defaultValue={filterByCustomers}
              />
              <div>
                <TextField
                  label="Start Date"
                  id="startDate"
                  variant="outlined"
                  size="small"
                  type="date"
                  name="startDate"
                  onChange={dateHandleChange}
                  value={filterByDate.startDate}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
              <div>
                <TextField
                  label="End Date"
                  id="endDate"
                  variant="outlined"
                  size="small"
                  type="date"
                  name="endDate"
                  onChange={dateHandleChange}
                  value={filterByDate.endDate}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </div>
            {/* <div className="search-icon" onClick={handleSearch}>
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
            )} */}
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
          <Pagination changePage={getSearchingData} data={salesData} />
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit E-commerce Affiliate'}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <TextField
              value={editData ? editData?.campaign_id : ''}
              select
              name="campaign_id"
              margin="normal"
              onChange={handleEditChange}
              fullWidth
              required={false}
            >
              <option value="">Select Campaign</option>
              {campaigns.map((option, indx) => (
                <option key={indx + `-1`} value={option.id}>
                  {option.campaign_name}
                </option>
              ))}
            </TextField>
            <TextField
              value={editData ? editData?.customer_id : ''}
              select
              name="customer_id"
              margin="normal"
              onChange={handleEditChange}
              fullWidth
              required={true}
            >
              <option value="">Select Customer</option>
              {customers.map((option, indx) => (
                <option key={indx + `-2`} value={option.id}>
                  {option.customer_name}
                </option>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              required={true}
              name="order_type"
              margin="normal"
              onChange={handleEditChange}
              value={editData ? editData?.order_type : ''}
            >
              <option value="">Select Order Type</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Phone">Phone</option>
            </TextField>
            <TextField
              value={editData ? editData?.order_no : ''}
              fullWidth
              type="text"
              margin="normal"
              name="order_no"
              label="Order No"
              onChange={handleEditChange}
            />

            {editData?.order_type && editData.order_type == 'E-commerce' && (
              <>
                <TextField
                  value={editData ? editData?.coupon_code : ''}
                  fullWidth
                  type="text"
                  margin="normal"
                  required={true}
                  name="coupon_code"
                  label="Coupon Code"
                  onChange={handleEditChange}
                />
                <TextField
                  value={editData ? editData?.user_ip : ''}
                  fullWidth
                  type="text"
                  margin="normal"
                  name="user_ip"
                  label="User IP"
                  onChange={handleEditChange}
                />
              </>
            )}

            {editData?.order_type && editData.order_type == 'Phone' && (
              <>
                <TextField
                  value={editData ? editData?.dialed : ''}
                  fullWidth
                  type="text"
                  margin="normal"
                  required={true}
                  name="dialed"
                  label="Dialed"
                  onChange={handleEditChange}
                />
                <TextField
                  value={editData ? editData?.inbound : ''}
                  fullWidth
                  type="text"
                  margin="normal"
                  name="inbound"
                  label="Inbound"
                  onChange={handleEditChange}
                />
              </>
            )}

            <TextField
              value={editData ? editData?.quantity : ''}
              fullWidth
              type="text"
              margin="normal"
              name="quantity"
              label="Quantity"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.subtotal : ''}
              fullWidth
              type="text"
              margin="normal"
              name="subtotal"
              label="Subtotal"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.shipping_cost : ''}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_cost"
              label="Shipping Cost"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.total : ''}
              fullWidth
              type="text"
              margin="normal"
              name="total"
              label="Total"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.shipping_state : ''}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_state"
              label="Shipping State"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.shipping_city : ''}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_city"
              label="Shipping City"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.shipping_zip : ''}
              fullWidth
              type="text"
              margin="normal"
              name="shipping_zip"
              label="Shipping Zip"
              onChange={handleEditChange}
            />
            <TextField
              value={editData ? editData?.billing_zip : ''}
              fullWidth
              type="text"
              margin="normal"
              name="billing_zip"
              label="Billing Zip"
              onChange={handleEditChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              className={classes.editButton}
            >
              Update
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

SalesIndex.layout = (page) => <Layout title="Sales Index">{page}</Layout>
export default SalesIndex
