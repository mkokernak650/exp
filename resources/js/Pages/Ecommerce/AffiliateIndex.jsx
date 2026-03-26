import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import Eye from '@/Components/Icons/Eye.jsx'
import { Tooltip, Button, Input, Select, Row, Col, Table } from 'antd'
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
import { columns as defaultColumns, filter } from './Helpers/AffiliateIndexProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const AffiliateIndex = () => {
  const defaultState = {
    revenue: '',
    order_type: '',
    coupon_code: '',
    dialed: '',
    pay_on_multiple_orders: '',
    lengths: '',
    product_code: '',
    campaign_id: '',
    customer_id: '',
    affiliate_id: '',
    affiliate_fee: '',
    consumerExp_fee: '',
    affiliate_fee_type: '',
    cash_buy: '',
    consumerEXP_cash_buy_fee_type: '',
    consumerEXP_cash_buy_fee: '',
    description: '',
    video_url: '',
  }

  const { ecommerceAffiliates, affiliates, campaigns, customers, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState(defaultState)
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()
  const [importModal, setImportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [eAffiliatesData, seteAffiliatesData] = useState(ecommerceAffiliates)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setcurrentPage] = useState(1)
  const [orderByValue, setOrderByValue] = useState('')
  const [filterByCampaigns, setFilterByCampaigns] = useState('')
  const [filterByCustomers, setFilterByCustomers] = useState('')
  const [filterByAffiliates, setFilterByAffiliates] = useState('')

  const handleEditChange = ({ target: { name, value } }) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value }))
  }

  const handleEditSelectChange = (name, value) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value ?? '' }))
  }

  const campaginHandleChange = (value) => {
    setEditData((oldEditData) => ({ ...oldEditData, description: '' }))
    setEditData((oldEditData) => ({ ...oldEditData, campaign_id: value ?? '' }))

    if (value) {
      const selectedCampaign = campaigns.filter(campaign => campaign.id == value)
      if (selectedCampaign[0].description) {
        setEditData((oldEditData) => ({ ...oldEditData, description: selectedCampaign[0].description }))
      } else {
        setEditData((oldEditData) => ({ ...oldEditData, description: '' }))
      }
    }
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

  const getAffiliateNameById = (id) => {
    const affiliate = affiliates.find((affiliate) => affiliate.id == id)
    return affiliate ? affiliate.affiliate_name : ''
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

  const handleEditSubmit = () => {
    axios
      .put(route('ecommerce-affiliates.update', editData.id), editData, headers)
      .then((res) => {
        let campaignName = getCampaignNameById(editData.campaign_id)
        let customerName = getCustomerNameById(editData.customer_id)
        let affiliateName = getAffiliateNameById(editData.affiliate_id)
        setData((prev) => prev.map((item) => {
          if (item.id === editData.id) {
            const updated = {
              ...item,
              campaign: campaignName,
              campaign_id: editData.campaign_id,
              customer: customerName,
              customer_id: editData.customer_id,
              affiliate: affiliateName,
              affiliate_id: editData.affiliate_id,
              product_code: res.data.data.product_code,
              revenue: res.data.data.revenue,
              lengths: res.data.data.lengths,
              pay_on_multiple_orders: res.data.data.pay_on_multiple_orders,
              affiliate_fee: res.data.data.affiliate_fee,
              order_type: res.data.data.order_type,
              coupon_code: res.data.data.coupon_code,
              dialed: res.data.data.dialed,
              affiliate_fee_type: res.data.data.affiliate_fee_type,
              cash_buy: res.data.data.cash_buy,
              description: res.data.data.description,
              video_url: res.data.data.video_url,
              updated_at: res.data.updated_at,
            }
            if (res.data.data.affiliate_fee_type == "2") {
              updated.percentage = res.data.data.consumerEXP_cash_buy_fee
              updated.consumerEXP_cash_buy_fee_type = res.data.data.consumerEXP_cash_buy_fee_type
              updated.consumerEXP_cash_buy_fee = `${res.data.data.consumerEXP_cash_buy_fee_type == "1" ? ((res.data.data.consumerEXP_cash_buy_fee / res.data.data.cash_buy) * 100) : res.data.data.consumerEXP_cash_buy_fee}`
            } else {
              updated.percentage = editData.revenue - editData.affiliate_fee
            }
            return updated
          }
          return item
        }))
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

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const openImportModal = () => {
    setImportModal({ open: true })
  }

  const importHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('importFile', selectedFile)
    axios
      .post(route('ecommerce-affiliates.import'), formData)
      .then((res) => {
        setSelectedFile(null)
        setImportModal({ open: false })
        setLoading(false)
        toast.success(res.data.msg)
      })
      .catch((err) => {
        setLoading(false)
        toast.error('Import failed')
      })
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      return {
        edit: item.id,
        campaign_id: item?.campaign_id,
        customer_id: item?.customer_id,
        affiliate_id: item?.affiliate_id,
        campaign: item?.campaign?.campaign_name,
        customer: item?.customer?.customer_name,
        affiliate: item?.affiliate?.affiliate_name,
        order_type: item?.order_type,
        affiliate_fee_type: item?.affiliate_fee_type,
        product_code: item?.product_code,
        coupon_code: item?.coupon_code,
        dialed: item?.dialed,
        pay_on_multiple_orders: item?.pay_on_multiple_orders,
        lengths: item?.lengths,
        revenue: item?.revenue,
        affiliate_fee: item?.affiliate_fee,
        percentage: item?.percentage,
        cash_buy: item?.cash_buy,
        consumerEXP_cash_buy_fee_type: item?.consumerEXP_cash_buy_fee_type,
        consumerEXP_cash_buy_fee: `${item?.consumerEXP_cash_buy_fee_type === 1 ? ((item?.consumerEXP_cash_buy_fee / item?.cash_buy) * 100) : item?.consumerEXP_cash_buy_fee}`,
        created_at: item.created_at,
        updated_at: item.updated_at,
        description: item.description,
        video_url: item.video_url,
        id: item.id,
        key: item.id,
      }
    })
  }

  const dataArray = mapDataArr(ecommerceAffiliates.data)

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

  const optionKey = 'affiliate-index'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const [columns, setColumns] = useState(defaultColumns)
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

  const [filterValue, changeFilter] = useState(filter)
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(
        'ecommerce-affiliates/export?filterByCampaigns=' + filterByCampaigns +
        '&filterByCustomers=' + filterByCustomers +
        '&filterByAffiliates=' + filterByAffiliates
      )
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
          toast.success('Report Exported Successfully')
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const deleteHandler = () => {
    axios
      .post(route('ecommerce-affiliates.deleteSelected'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          getSearchingData(currentPage)
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

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowKeys([])
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  const lengths = [':15', ':30', ':60', ':120', '28:30']

  const lengthOptions = lengths.map((length) => ({
    label: length,
    value: length,
  }))

  const lengthHandleChange = (val) => {
    setEditData((oldEditData) => ({ ...oldEditData, lengths: val }))
  }

  const getSearchingData = async (data) => {
    setcurrentPage(data)
    setTableLoading(true)
    await axios
      .get(
        'ecommerce-affiliates?page=' +
        data.page +
        '&itemPerPage=' +
        itemPerPage +
        '&filteredValue=' +
        JSON.stringify(filterValue) + '&orderBy=' + orderByValue +
        '&filterByCampaigns=' + filterByCampaigns +
        '&filterByCustomers=' + filterByCustomers +
        '&filterByAffiliates=' + filterByAffiliates
      )
      .then((res) => {
        setData(mapDataArr(res.data.data))
        seteAffiliatesData(res.data)
        setTableLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
  }

  useEffect(() => {
    getSearchingData(currentPage)
  }, [itemPerPage, filterValue, orderByValue, filterByCampaigns, filterByCustomers, filterByAffiliates])

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
          <Button type="text" onClick={() => handleOpenModal(setShowDeleteModal)} icon={<DeleteOutlined style={toolbarIconStyle} />} />
        </Tooltip>
        <Tooltip title="Edit">
          <Button type="text" onClick={handleToolbarEdit} icon={<EditOutlined style={toolbarIconStyle} />} />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
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
          sorter: col.dataType === 'number'
            ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
            : col.dataType === 'string'
              ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
              : undefined,
        }
        if (col.key === 'status') {
          base.render = (value) => (value == 1 ? 'Active' : 'Inactive')
        }
        if (col.key === 'order_type') {
          base.render = (value) => (value == 1 ? 'E-commerce' : 'Phone')
        }
        if (col.key === 'affiliate_fee_type') {
          base.render = (value) => (value == 1 ? 'Payout Per Order' : 'Cash Buy')
        }
        if (col.key === 'created_at' || col.key === 'updated_at') {
          base.render = (value) => DateTimeFormat(value)
        }
        if (col.key === 'pay_on_multiple_orders') {
          base.render = (value) => {
            if (value == '0') return 'No'
            else if (value == '1') return 'Yes'
          }
        }
        if (col.key === 'lengths') {
          base.render = (value) => {
            if (value != null) return value.toString().replace(/,/g, ', ')
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
      <Helmet title="E-commerce Affiliate Index" />
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
                onClick={openImportModal}
                className="capitalize text-sm"
              >
                Import
              </Button>
              <Button
                type="primary"
                onClick={exportHandler}
                className="capitalize text-sm"
                loading={loading}
              >
                Export
              </Button>
            </div>
            <div className="top-left">
              <MultiSelect
                options={[{ label: 'Created At (Ascending)', value: 'ASC' }, { label: 'Created At (Descending)', value: 'DESC' }]}
                onChange={(value) => setOrderByValue(value)}
                placeholder="Order By"
                className="w-full"
                defaultValue={orderByValue}
                singleSelect
                width="280px"
              />
              <MultiSelect
                options={campaignOptions}
                placeholder="Campaign"
                className="w-full"
                onChange={(value) => setFilterByCampaigns(value)}
                defaultValue={filterByCampaigns}
              />
              <MultiSelect
                options={customerOptions}
                placeholder="Customer"
                className="w-full"
                onChange={(value) => setFilterByCustomers(value)}
                defaultValue={filterByCustomers}
              />
              <MultiSelect
                options={affiliateOptions}
                placeholder="Affiliate"
                className="w-full"
                onChange={(value) => setFilterByAffiliates(value)}
                defaultValue={filterByAffiliates}
              />
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
          <Pagination changePage={getSearchingData} data={eAffiliatesData} />
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
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Select
                  value={editData?.campaign_id || undefined}
                  onChange={(value) => campaginHandleChange(value)}
                  className="w-full"
                  placeholder="Select Campaign"
                  allowClear
                  options={campaigns.map((option, indx) => ({
                    key: indx + '-1',
                    value: option.id,
                    label: option.campaign_name,
                  }))}
                />
              </Col>

              <Col span={24}>
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
              </Col>

              <Col span={24}>
                <Select
                  value={editData?.affiliate_id || undefined}
                  onChange={(value) => handleEditSelectChange('affiliate_id', value)}
                  className="w-full"
                  placeholder="Select Affiliate"
                  allowClear
                  options={affiliates.map((option, indx) => ({
                    key: indx + '-3',
                    value: option.id,
                    label: `${option.affiliate_name} (${option.market})`,
                  }))}
                />
              </Col>
              <Col span={24}>
                <div>
                  <label>Product Code (ISCI Code)</label>
                  <Input
                    value={editData?.product_code}
                    type="text"
                    name="product_code"
                    placeholder="ISCI Code"
                    onChange={handleEditChange}
                    className="w-full"
                  />
                </div>
              </Col>
              <Col span={24}>
                <Select
                  value={editData?.order_type || undefined}
                  onChange={(value) => handleEditSelectChange('order_type', value)}
                  className="w-full"
                  placeholder="Select Order Type"
                  allowClear
                  options={[
                    { value: '1', label: 'E-commerce' },
                    { value: '2', label: 'Phone' },
                  ]}
                />
              </Col>

              {editData?.order_type && editData.order_type == 1 && (
                <Col span={24}>
                  <div>
                    <label>Coupon Code</label>
                    <Input
                      className="w-full"
                      type="text"
                      name="coupon_code"
                      onChange={handleEditChange}
                      placeholder="Exp: #CX12345"
                      value={editData?.coupon_code}
                      required
                    />
                  </div>
                </Col>
              )}

              {editData?.order_type && editData.order_type == 2 && (
                <Col span={24}>
                  <div>
                    <label>Dialed Phone</label>
                    <Input
                      className="w-full"
                      type="text"
                      name="dialed"
                      placeholder="123123123"
                      onChange={handleEditChange}
                      value={editData?.dialed}
                      required
                    />
                  </div>
                </Col>
              )}

              <Col span={24}>
                <Select
                  value={editData?.pay_on_multiple_orders || undefined}
                  onChange={(value) => handleEditSelectChange('pay_on_multiple_orders', value)}
                  className="w-full"
                  placeholder="Pay on multiple orders"
                  allowClear
                  options={[
                    { value: '1', label: 'Yes' },
                    { value: '0', label: 'No' },
                  ]}
                />
              </Col>

              <Col span={24}>
                <MultiSelect
                  name="lengths"
                  defaultValue={editData?.lengths}
                  onChange={(val) => lengthHandleChange(val)}
                  options={lengthOptions}
                  className="!w-full"
                  placeholder="Select Length"
                />
              </Col>

              <Col span={24}>
                <Select
                  value={editData?.affiliate_fee_type || undefined}
                  onChange={(value) => handleEditSelectChange('affiliate_fee_type', value)}
                  className="w-full"
                  placeholder="Select Affiliate Fee Type"
                  allowClear
                  options={[
                    { value: '1', label: 'Payout Per Order' },
                    { value: '2', label: 'Cash Buy' },
                  ]}
                />
              </Col>

              {editData?.affiliate_fee_type && editData.affiliate_fee_type == 1 && (
                <>
                  <Col span={24}>
                    <div>
                      <label>Revenue</label>
                      <Input
                        value={editData?.revenue}
                        type="text"
                        name="revenue"
                        placeholder="Exp: 100"
                        onChange={handleEditChange}
                        className="w-full"
                        required
                      />
                    </div>
                  </Col>

                  <Col span={24}>
                    <div>
                      <label>Affiliate Fee</label>
                      <Input
                        value={editData?.affiliate_fee}
                        type="text"
                        name="affiliate_fee"
                        placeholder="Exp: 100"
                        onChange={handleEditChange}
                        className="w-full"
                        required
                      />
                    </div>
                  </Col>
                </>
              )}
              {editData?.affiliate_fee_type && editData.affiliate_fee_type == 2 && (
                <>
                  <Col span={24}>
                    <div>
                      <label>Cash Buy</label>
                      <Input
                        value={editData?.cash_buy}
                        type="text"
                        name="cash_buy"
                        placeholder="10000"
                        onChange={handleEditChange}
                        className="w-full"
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <Select
                      value={editData?.consumerEXP_cash_buy_fee_type || undefined}
                      onChange={(value) => handleEditSelectChange('consumerEXP_cash_buy_fee_type', value)}
                      className="w-full"
                      placeholder="Select ConsumerEXP Fee Type"
                      allowClear
                      options={[
                        { value: '1', label: 'Percentage' },
                        { value: '2', label: 'Fixed' },
                      ]}
                    />
                  </Col>
                  <Col span={24}>
                    <div>
                      <label>{editData?.consumerEXP_cash_buy_fee_type == 1 ? "ConsumerEXP Fee (In Percentage)" : "ConsumerEXP Fee (Fixed)"}</label>
                      <Input
                        value={editData?.consumerEXP_cash_buy_fee}
                        type="number"
                        min={0}
                        name="consumerEXP_cash_buy_fee"
                        placeholder="consumerEXP Cash Buy Fee"
                        onChange={handleEditChange}
                        className="w-full"
                        required
                        disabled={!editData?.consumerEXP_cash_buy_fee_type}
                      />
                    </div>
                  </Col>
                </>
              )}

              <Col span={24}>
                <div>
                  <label>DRTV Download Link</label>
                  <Input
                    value={editData?.video_url}
                    type="text"
                    name="video_url"
                    placeholder="DRTV Download Link"
                    onChange={handleEditChange}
                    className="w-full"
                  />
                </div>
              </Col>
              <Col span={24}>
                <div>
                  <label>Description</label>
                  <Input.TextArea
                    name="description"
                    onChange={handleEditChange}
                    value={editData?.description}
                    spellCheck
                    className="w-full"
                    rows={4}
                  />
                </div>
              </Col>

              <Col span={24}>
                <Button
                  type="primary"
                  onClick={handleEditSubmit}
                  className="mt-[15px]"
                >
                  Update
                </Button>
              </Col>
            </Row>
          </form>

        </div>
      </NormalModal>

      <NormalModal open={importModal.open} setOpen={setImportModal} width={'500px'} title={''}>
        <form onSubmit={importHandler}>
          <div className="flex items-center">
            <input
              id="importFile"
              type="file"
              name="importFile"
              onChange={handleImportChange}
              className="flex-1 bg-[#eee] p-[7px] rounded-[5px] mr-[6px]"
            />
            <Button type="primary" htmlType="submit" disabled={!selectedFile} loading={loading}>
              Next
            </Button>
          </div>
        </form>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${selectedRowKeys.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
      ></ConfirmModal>
    </>
  )
}

AffiliateIndex.layout = (page) => <Layout title="E-commerce Affiliate Index">{page}</Layout>
export default AffiliateIndex
