import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { InertiaLink, usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import { filterData } from '../filterData'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import { Tooltip, Switch, Button, Input, Row, Col, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import Edit from '@/Components/Icons/Edit.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { columns as defaultColumns, fields, groups, filter } from './Helpers/CampaignIndexProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CampaignIndex = () => {
  const { campaigns, columnsData, customers } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
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
    description: item.description,
    length_url: item.length_url,
    status: [item.status, item.id, index],
    created_at: item.created_at,
    updated_at: item.updated_at,
    id: item.id,
    key: item.id,
  }))

  const customersOption = customers.map(customer => ({
    value: customer.id.toString(),
    label: customer.customer_name,
  }))

  const [data, setData] = useState(dataArray)

  const optionKey = 'campaign-index'
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

  const handleEdit = (itemId) => {
    data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
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
        setData((prev) => prev.map((item, idx) =>
          item.id === rowId ? { ...item, status: [status, rowId, idx] } : item
        ))
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
      .post(route('ecommerce-campaigns.deleteSelected'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
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
        setData((prev) => prev.map((item) =>
          item.id === editData.id
            ? { ...editData, updated_at: res.data.updated_at, customer_name: res.data.customer_name }
            : item
        ))
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
    setSelectedRowKeys([])
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
          <Button type="text" onClick={() => handleOpenModal(setShowDeleteModal)} icon={<DeleteOutlined style={{ color: '#031b4e' }} />} />
        </Tooltip>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell')
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
        if (col.key === 'edit') {
          base.render = (value) => (
            <div className="edit-icon" onClick={() => handleEdit(value)}>
              <Edit />
            </div>
          )
        }
        if (col.key === 'affiliates') {
          base.render = (value) => (
            <InertiaLink href={route('ecommerce.campaigns.affiliates', value)}>Affiliates</InertiaLink>
          )
        }
        if (col.key === 'status') {
          base.render = (value) => {
            if (typeof value === 'string') {
              value = value.split(',')
            }
            return (
              <Switch
                checked={parseInt(value[0]) === 1}
                onChange={() => handleStatus(value[0], value[1], value[2])}
              />
            )
          }
        }
        if (col.key === 'created_at' || col.key === 'updated_at') {
          base.render = (value) => DateTimeFormat(value)
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

  const filteredData = filterData(data, filterValue)

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
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          columns={antdColumns}
          dataSource={filteredData}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={false}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit E-commerce Campaign'}
      >
        <div className="edit_target">
          <form>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <div>
                  <label>Campaign Name</label>
                  <Input
                    value={editData ? editData?.campaign_name : ''}
                    type="text"
                    name="campaign_name"
                    onChange={handleEditChange}
                    className="w-full"
                    required
                  />
                </div>
              </Col>

              <Col span={24}>
                <MultiSelect
                  singleSelect
                  placeholder="Select Customer"
                  options={customersOption}
                  defaultValue={editData?.customer_id}
                  onChange={value => CustomerHandleChange(value)}
                  className="w-full"
                />
              </Col>

              <Col span={24}>
                <div>
                  <label>Description</label>
                  <Input.TextArea
                    name="description"
                    onChange={handleEditChange}
                    value={editData ? editData?.description : ''}
                    spellCheck
                    className="w-full"
                    rows={4}
                  />
                </div>
              </Col>

              <Col span={24}>
                <div>
                  <label>Length and URL</label>
                  <Input.TextArea
                    name="length_url"
                    onChange={handleEditChange}
                    value={editData ? editData?.length_url : ''}
                    spellCheck
                    className="w-full"
                    rows={3}
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
        title={`${selectedRowKeys.length > 1
          ? 'Do you want to delete these records?'
          : 'Do you want to delete this record?'
          }`}
      ></ConfirmModal>
    </>
  )
}

CampaignIndex.layout = (page) => <Layout title="E-commerce Campaign Index">{page}</Layout>
export default CampaignIndex
