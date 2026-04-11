import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { InertiaLink, usePage } from '@inertiajs/inertia-react'
import { filterData } from '../filterData'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Tooltip, Switch, Button, Input, Row, Col, Table } from 'antd'
import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import EditModalFooter from '@/Shared/EditModalFooter'
import toast from 'react-hot-toast'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import CustomFilter from '@/Components/CustomFilter'
import { SearchedFields } from '@/Helpers/SearchedFields'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import { columns as defaultColumns } from './Helpers/CampaignIndexProps'
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
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)

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
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    id: item.id,
    key: item.id,
  }))

  const customersOption = customers.map((customer) => ({
    value: customer.id.toString(),
    label: customer.customer_name,
  }))

  const [data, setData] = useState(dataArray)

  const optionKey = 'campaign-index'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const [columns, setColumns] = useState(
    columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      ? JSON.parse(columnsData[0])?.[optionKey]
      : defaultColumns
  )
  const {
    DraggableResizableHeader,
    withResizableColumns,
    dndContextProps,
    sortableContextProps,
  } = useReportTableColumns({
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

  const handleReorderColumns = (reordered) => {
    setColumns(reordered)
    addTableDetails(columnDetails, setColumnDetails, reordered, optionKey)
  }

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

  const [filterValue, setFilterValue] = useState({ groupName: 'and', items: [] })
  const activeFilterCount = countActiveFilters(filterValue)
  const fields = SearchedFields(columns)

  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const headers = {
    headers: { Accept: 'application/json' },
  }

  const handleStatus = (value, rowId) => {
    let status = parseInt(value) === 1 ? 0 : 1
    axios
      .post(route('ecommerce-campaigns.status.update', rowId), { status }, headers)
      .then((res) => {
        setData((prev) =>
          prev.map((item) =>
            item.id === rowId ? { ...item, status } : item
          )
        )
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
        setData((prev) =>
          prev.map((item) =>
            item.id === editData.id
              ? {
                  ...editData,
                  updated_at: res.data.updated_at,
                  customer_name: res.data.customer_name,
                }
              : item
          )
        )
        setEditData()
        handleCloseModal(setShowEditModal)
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

  useEffect(() => {
    const syncTablePanelHeight = () => {
      if (tablePanelRef.current) {
        setTablePanelHeight(tablePanelRef.current.offsetHeight)
      }
    }

    syncTablePanelHeight()
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      syncTablePanelHeight()
    })
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [serachSidebar, data.length])

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
        {selectedRowKeys.length === 1 && (
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={toolbarIconStyle} />}
              onClick={handleToolbarEdit}
            />
          </Tooltip>
        )}
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
          sorter:
            col.dataType === 'number'
              ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
              : col.dataType === 'date'
                ? (a, b) => new Date(a[col.key] || 0) - new Date(b[col.key] || 0)
                : col.dataType === 'string'
                  ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
                  : undefined,
        }
        if (col.key === 'affiliates') {
          base.render = (value) => (
            <InertiaLink
              href={route('ecommerce.campaigns.affiliates', value)}
              className="inline-flex items-center gap-1 text-blue-600 font-medium underline decoration-blue-500/90 underline-offset-2 hover:text-blue-800 hover:decoration-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-sm"
              title="Open the affiliate list for this campaign"
            >
              <LinkOutlined className="text-[13px]" aria-hidden />
              View affiliates
            </InertiaLink>
          )
        }
        if (col.key === 'status') {
          base.render = (value, record) => {
            return (
              <Switch
                checked={parseInt(value) === 1}
                onChange={() => handleStatus(value, record.id)}
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
              {data.length > 0 && (
                <button
                  type="button"
                  className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                  onClick={handleFilter}
                  aria-label="Open filters"
                >
                  <Filter />
                  {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : ''}
                </button>
              )}
            </div>

            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} onReorderColumns={handleReorderColumns} />
              </div>
            ) : (
              ''
            )}
          </div>
        )}

        <div className={`report-content-layout ${serachSidebar ? 'with-filter' : ''}`}>
          <div
            className={`search-sidebar report-filter-sidebar ${serachSidebar ? 'filter-open' : 'filter-closed'}`}
            style={
              tablePanelHeight
                ? { height: `${tablePanelHeight}px`, maxHeight: `${tablePanelHeight}px` }
                : undefined
            }
          >
            <div className="top-element">
              <CustomFilter
                mainData={data}
                fields={fields}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
              />
            </div>
          </div>

          <div className="report-table-panel" ref={tablePanelRef}>
            <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
            <Table
              columns={antdColumns}
              dataSource={filteredData}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={false}
              components={{
                header: {
                  cell: DraggableResizableHeader,
                },
              }}
              scroll={{ x: 'max-content', y: 'calc(100vh - 217px)' }}
              size="small"
            />
            </ReportTableDndShell>
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit E-commerce Campaign'}
        onClose={() => handleCloseModal(setShowEditModal)}
        footer={
          <EditModalFooter
            onCancel={() => handleCloseModal(setShowEditModal)}
            onSubmit={handleEditSubmit}
            submitLabel="Update"
          />
        }
      >
        <div className="mt-4">
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
                  onChange={(value) => CustomerHandleChange(value)}
                  className="!w-full"
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
            </Row>
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

CampaignIndex.layout = (page) => <Layout title="E-commerce Campaign Index">{page}</Layout>
export default CampaignIndex
