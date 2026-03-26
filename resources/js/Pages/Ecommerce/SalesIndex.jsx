import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import { Tooltip, Button, Input, Select, Row, Col, Table, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { Pagination } from 'react-laravel-paginex'
import { columns as defaultColumns, fields, groups, filter } from './Helpers/SalesIndexProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const SalesIndex = () => {
  const { sales, campaigns, customers, affiliates, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState()
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [salesData, seteSalesData] = useState(sales)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const showColumnRef = useRef()
  const [filterByCampaigns, setFilterByCampaigns] = useState('')
  const [filterByCustomers, setFilterByCustomers] = useState('')
  const [filterByAffiliates, setFilterByAffiliates] = useState('')
  const [filterByDate, setFilterByDate] = useState({ startDate: '', endDate: '' })

  const handleEditChange = ({ target: { name, value } }) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value }))
  }

  const handleEditSelectChange = (name, value) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value ?? '' }))
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

  const affiliateOptions = affiliates.map((item) => ({
    label: item.affiliate_name,
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
        setData((prev) =>
          prev.map((item) => {
            if (item.id === editData.id) {
              return {
                ...item,
                campaign: campaignName,
                campaign_id: editData.campaign_id,
                customer: customerName,
                customer_id: editData.customer_id,
                coupon_code: res.data.data.coupon_code,
                user_ip: res.data.data.user_ip,
                order_no: res.data.data.order_no,
                subtotal: res.data.data.subtotal,
                total: res.data.data.total,
                shipping_cost: res.data.data.shipping_cost,
                shipping_zip: res.data.data.shipping_zip,
                shipping_state: res.data.data.shipping_state,
                shipping_city: res.data.data.shipping_city,
                billing_zip: res.data.data.billing_zip,
                dialed: res.data.data.dialed,
                inbound: res.data.data.inbound,
                updated_at: res.data.updated_at,
              }
            }
            return item
          })
        )
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
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(sales.data)

  const [data, setData] = useState(dataArray)

  const handleEdit = (itemId) => {
    data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const handleToolbarEdit = () => {
    if (selectedRowKeys.length !== 1) {
      toast.error('Please select exactly one row to edit')
      return
    }
    handleEdit(selectedRowKeys[0])
  }

  const optionKey = 'sales-index'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const handleToggleColumn = (key) => {
    setColumns((prev) => {
      const updated = prev.map((c) =>
        c.key === key ? { ...c, visible: c.visible === false ? true : false } : c
      )
      addTableDetails(columnDetails, setColumnDetails, updated, optionKey)
      return updated
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
    axios
      .post(route('ecommerce-sales.deleteSelected'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
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
    setSelectedRowKeys([])
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const getSearchingData = async (pageData) => {
    const page = typeof pageData === 'object' ? pageData.page : pageData
    setcurrentPage(page)
    setTableLoading(true)
    await axios
      .get(
        'ecommerce-sales?page=' +
          page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue) +
          '&filterByCampaigns=' +
          filterByCampaigns +
          '&filterByCustomers=' +
          filterByCustomers +
          '&filterByAffiliates=' +
          filterByAffiliates +
          '&filterByDate=' +
          JSON.stringify(filterByDate)
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        seteSalesData(res.data)
        setTableLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  const [filterValue, changeFilter] = useState(filter)
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

  useEffect(() => {
    getSearchingData(1)
  }, [
    itemPerPage,
    filterValue,
    filterByCampaigns,
    filterByCustomers,
    filterByAffiliates,
    filterByDate,
  ])

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
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            onClick={() => handleOpenModal(setShowDeleteModal)}
            icon={<DeleteOutlined style={toolbarIconStyle} />}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <Button
            type="text"
            onClick={handleToolbarEdit}
            icon={<EditOutlined style={toolbarIconStyle} />}
          />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
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
      .get(
        'ecommerce-sales-export?filterByCampaigns=' +
          filterByCampaigns +
          '&filterByCustomers=' +
          filterByCustomers +
          '&filterByAffiliates=' +
          filterByAffiliates +
          '&filterByDate=' +
          JSON.stringify(filterByDate)
      )
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

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
      .map((col) => {
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter:
            col.dataType === 'number'
              ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
              : col.dataType === 'string'
                ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                : undefined,
        }
        if (col.key === 'order_at') {
          base.render = (value) => {
            if (value !== undefined) {
              let d = new Date(value)
              let hours = d.getHours()
              let minutes = d.getMinutes()
              let ampm = hours >= 12 ? 'PM' : 'AM'
              hours = hours % 12
              hours = hours ? hours : 12
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
        }
        if (col.key === 'created_at' || col.key === 'updated_at') {
          base.render = (value) => {
            if (value !== undefined) {
              return DateTimeFormat(value)
            }
          }
        }
        return base
      })
  )

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
    },
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
                type="primary"
                onClick={exportHandler}
                disabled={sales == ''}
                className="capitalize text-sm"
                loading={loading}
              >
                Searched Export
              </Button>
            </div>
            <div className="top-left">
              <MultiSelect
                options={campaignOptions}
                placeholder="Campaign"
                onChange={(value) => setFilterByCampaigns(value)}
                defaultValue={filterByCampaigns}
              />
              <MultiSelect
                options={customerOptions}
                placeholder="Customer"
                onChange={(value) => setFilterByCustomers(value)}
                defaultValue={filterByCustomers}
              />
              <MultiSelect
                options={affiliateOptions}
                placeholder="Affiliate"
                onChange={(value) => setFilterByAffiliates(value)}
                defaultValue={filterByAffiliates}
              />
              <div>
                <label>Start Date</label>
                <DatePicker
                  value={filterByDate.startDate ? dayjs(filterByDate.startDate) : null}
                  onChange={(date, dateString) =>
                    dateHandleChange({ target: { name: 'startDate', value: dateString } })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label>End Date</label>
                <DatePicker
                  value={filterByDate.endDate ? dayjs(filterByDate.endDate) : null}
                  onChange={(date, dateString) =>
                    dateHandleChange({ target: { name: 'endDate', value: dateString } })
                  }
                  className="w-full"
                />
              </div>
            </div>
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={tableLoading}
          pagination={false}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />

        <div className="table-bottom">
          <Select
            value={itemPerPage}
            onChange={(value) => itemPerPageHandleChange(value)}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 100, label: '100' },
              { value: 200, label: '200' },
            ]}
          />
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
          <form>
            <div className="mb-4">
              <Select
                value={editData?.campaign_id || undefined}
                onChange={(value) => handleEditSelectChange('campaign_id', value)}
                className="w-full"
                placeholder="Select Campaign"
                allowClear
                options={campaigns.map((option, indx) => ({
                  key: indx + '-1',
                  value: option.id,
                  label: option.campaign_name,
                }))}
              />
            </div>
            <div className="mb-4">
              <Select
                value={editData?.customer_id || undefined}
                onChange={(value) => handleEditSelectChange('customer_id', value)}
                className="w-full"
                placeholder="Select Customer"
                allowClear
                options={customers.map((option, indx) => ({
                  key: indx + '-2',
                  value: option.id,
                  label: option.customer_name,
                }))}
              />
            </div>
            <div className="mb-4">
              <Select
                value={editData?.order_type || undefined}
                onChange={(value) => handleEditSelectChange('order_type', value)}
                className="w-full"
                placeholder="Select Order Type"
                allowClear
                options={[
                  { value: 'E-commerce', label: 'E-commerce' },
                  { value: 'Phone', label: 'Phone' },
                ]}
              />
            </div>
            <div className="mb-4">
              <label>Order No</label>
              <Input
                value={editData ? editData?.order_no : ''}
                className="w-full"
                type="text"
                name="order_no"
                onChange={handleEditChange}
              />
            </div>

            {editData?.order_type && editData.order_type == 'E-commerce' && (
              <>
                <div className="mb-4">
                  <label>Coupon Code</label>
                  <Input
                    value={editData ? editData?.coupon_code : ''}
                    className="w-full"
                    type="text"
                    name="coupon_code"
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label>User IP</label>
                  <Input
                    value={editData ? editData?.user_ip : ''}
                    className="w-full"
                    type="text"
                    name="user_ip"
                    onChange={handleEditChange}
                  />
                </div>
              </>
            )}

            {editData?.order_type && editData.order_type == 'Phone' && (
              <>
                <div className="mb-4">
                  <label>Dialed</label>
                  <Input
                    value={editData ? editData?.dialed : ''}
                    className="w-full"
                    type="text"
                    name="dialed"
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label>Inbound</label>
                  <Input
                    value={editData ? editData?.inbound : ''}
                    className="w-full"
                    type="text"
                    name="inbound"
                    onChange={handleEditChange}
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label>Quantity</label>
              <Input
                value={editData ? editData?.quantity : ''}
                className="w-full"
                type="text"
                name="quantity"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Subtotal</label>
              <Input
                value={editData ? editData?.subtotal : ''}
                className="w-full"
                type="text"
                name="subtotal"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Shipping Cost</label>
              <Input
                value={editData ? editData?.shipping_cost : ''}
                className="w-full"
                type="text"
                name="shipping_cost"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Total</label>
              <Input
                value={editData ? editData?.total : ''}
                className="w-full"
                type="text"
                name="total"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Shipping State</label>
              <Input
                value={editData ? editData?.shipping_state : ''}
                className="w-full"
                type="text"
                name="shipping_state"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Shipping City</label>
              <Input
                value={editData ? editData?.shipping_city : ''}
                className="w-full"
                type="text"
                name="shipping_city"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Shipping Zip</label>
              <Input
                value={editData ? editData?.shipping_zip : ''}
                className="w-full"
                type="text"
                name="shipping_zip"
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-4">
              <label>Billing Zip</label>
              <Input
                value={editData ? editData?.billing_zip : ''}
                className="w-full"
                type="text"
                name="billing_zip"
                onChange={handleEditChange}
              />
            </div>
            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">
              Update
            </Button>
          </form>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${
          selectedRowKeys.length > 1
            ? 'Do you want to delete these records?'
            : 'Do you want to delete this record?'
        }`}
      ></ConfirmModal>
    </>
  )
}

SalesIndex.layout = (page) => <Layout title="Sales Index">{page}</Layout>
export default SalesIndex
