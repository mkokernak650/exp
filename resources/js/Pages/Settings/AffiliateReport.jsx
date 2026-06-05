import Layout from '../Layout/Layout'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Tooltip, Button, Select, Pagination } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import EditModalFooter from '@/Shared/EditModalFooter'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { AFFILIATE_REPORT_NUMERIC_SORT_KEYS } from '@/Helpers/ecommerceReportNumericSortKeys'
import { reportTableSorterProps } from '@/Helpers/reportTableSort'
import { countActiveFilters, sanitizeFilterValue } from '@/Helpers/ActiveFilterCount'
import { fields, filter, columns as defaultColumns } from './Helpers/AffiliateReportProps'

import TextInput from '@/Components/Global/TextInput'
import AffiliateZipCodeSelect from '@/Components/AffiliateZipCodeSelect'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const AffiliateReport = () => {
  const {
    allAffiliates,
    columnsData,
    allMarkets,
    allBroadcastGroupNames,
    allMsoNames,
    allNetworkNames,
    allCorporations = [],
    filterByCustomer = null,
  } = usePage().props

  const corporationOptions = allCorporations.map((c) => ({
    value: `${c.type}:${c.id}`,
    label: `${c.name} (${c.type_label})`,
    type: c.type,
    id: c.id,
  }))

  const corporationsToCompositeValues = (corporations) =>
    (corporations || []).map((c) => `${c.type}:${c.id}`)

  const compositeValuesToPayload = (compositeValues) =>
    (compositeValues || [])
      .map((v) => {
        const match = corporationOptions.find((opt) => opt.value === v)
        return match
          ? {
              type: match.type,
              id: match.id,
              name: match.label.replace(/ \([^)]*\)$/, ''),
              type_label: match.label.match(/\(([^)]*)\)$/)?.[1] || '',
            }
          : null
      })
      .filter(Boolean)
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [showArchivedModal, setShowArchivedModal] = useState({ open: false })
  const [orderByValue, setOrderByValue] = useState('affiliate_name@ASC')
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [totalRecords, setTotalRecords] = useState(allAffiliates.total || 0)

  const parseTvHouseholds = (value) => {
    if (value === null || value === undefined || value === '') return null
    const parsedValue = Number(value.toString().replace(/,/g, ''))
    return Number.isNaN(parsedValue) ? null : parsedValue
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => {
      const corporations = item.corporations || []
      return {
        edit: item.id,
        affiliate_id: item.affiliate_id,
        affiliate_name: item.affiliate_name,
        ownership_type: item.ownership_type,
        ownership_name: item.ownership_name,
        ownership: item.ownership_type || '',
        zip_code: item.zip_code,
        website: item.website,
        tv_households: parseTvHouseholds(item.tv_households),
        market: item.market,
        email: item.email,
        telephone: item.telephone,
        address: item.address,
        contact_name: item.contact_name,
        contact_telephone: item.contact_telephone,
        corporations,
        corporations_display: corporations
          .map((c) => `${c.name} (${c.type_label})`)
          .join(', '),
        id: item.id,
        key: item.id,
      }
    })
  }

  const optionKey = 'affiliate-report'
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

  const [data, setData] = useState(mapDataArr(allAffiliates.data || []))

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

  const [filterValue, changeFilter] = useState(filter)
  const activeFilterJSON = useMemo(
    () => JSON.stringify(sanitizeFilterValue(filterValue)),
    [filterValue]
  )
  const [serachSidebar, setSearchSidebar] = useState(false)
  const activeFilterCount = countActiveFilters(filterValue)
  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }
  const handleColumns = () => {
    setShowColumns(true)
  }

  const orderByOptions = [
    { label: 'Affiliate Name (Ascending)', value: 'affiliate_name@ASC' },
    { label: 'Affiliate Name (Descending)', value: 'affiliate_name@DESC' },
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
  ]

  const deleteHandler = () => {
    axios
      .post(route('affiliate.delete'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.success(res.data.msg)
          setShowDeleteModal({ open: false })
          getSearchingData(currentPage)
        } else {
          setSelectedRowKeys([])
          setTableToolbar(false)
          toast.error(res.data.msg)
          setShowDeleteModal({ open: false })
        }
      })
      .catch((err) => {
        setSelectedRowKeys([])
        setTableToolbar(false)
        setShowDeleteModal({ open: false })
      })
  }

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      setEditData(item)
      setShowEditModal({ open: true })
    }
  }

  const handleToolbarEdit = () => {
    if (selectedRowKeys.length !== 1) {
      toast.error('Please select exactly one row to edit')
      return
    }
    handleEdit(selectedRowKeys[0])
  }

  const handleArchived = () => {
    axios
      .post(route('move.affiliate.archive'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          setTableToolbar(false)
          setSelectedRowKeys([])
          setShowArchivedModal({ open: false })
          getSearchingData(currentPage)
        } else {
          toast.error(res.data.msg)
          setSelectedRowKeys([])
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
      .post(route('affiliate.edit'), editData)
      .then((res) => {
        if (res.data.status_code === 200) {
          setData((prev) =>
            prev.map((item) => {
              if (item.id === editData.id) {
                return {
                  ...item,
                  affiliate_id: editData.affiliate_id,
                  affiliate_name: editData.affiliate_name,
                  ownership_type: editData.ownership_type,
                  ownership_name: editData.ownership_name,
                  ownership: editData.ownership_type || '',
                  zip_code: editData.zip_code,
                  website: editData.website,
                  email: editData.email,
                  telephone: editData.telephone,
                  address: editData.address,
                  market: editData.market,
                  contact_name: editData.contact_name,
                  contact_telephone: editData.contact_telephone,
                  corporations: editData.corporations || [],
                  corporations_display: (editData.corporations || [])
                    .map((c) => `${c.name} (${c.type_label})`)
                    .join(', '),
                }
              }
              return item
            })
          )
          setEditData()
          handleCloseModal(setShowEditModal)
          toast.success(res.data.msg)
        } else {
          toast.error(res.data.msg)
        }
      })
      .catch((err) => {
        const validationErrors = err.response?.data?.errors
        if (validationErrors) {
          const first = Object.values(validationErrors)[0]?.[0]
          if (first) toast.error(first)
        }
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

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter.order) {
      setSortField(sorter.field)
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSortField('')
      setSortOrder('')
    }
  }

  const getSearchingData = async (page = 1) => {
    setLoading(true)
    setCurrentPage(page)
    await axios
      .get('/affiliate-report', {
        params: {
          page,
          itemPerPage,
          orderBy: orderByValue,
          filteredValue: activeFilterJSON,
          sortField,
          sortOrder,
          filterByCustomer: filterByCustomer?.id,
        },
      })
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setTotalRecords(res.data.total)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const itemPerPageHandleChange = (value) => {
    setItemPerPage(value)
    setCurrentPage(1)
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
  }, [serachSidebar, data.length, loading, itemPerPage])

  useEffect(() => {
    getSearchingData(1)
  }, [orderByValue, itemPerPage, activeFilterJSON, sortField, sortOrder])

  const TableToolbar = () => {
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined style={toolbarIconStyle} />}
            onClick={() => handleOpenModal(setShowDeleteModal)}
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
        <Button
          type="primary"
          className="w-[130px] capitalize text-sm"
          onClick={() => handleOpenModal(setShowArchivedModal)}
        >
          Archived
        </Button>
        <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
      </div>
    )
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setTableToolbar(newSelectedRowKeys.length > 0)
    },
  }

  const antdColumns = withResizableColumns(
    columns
      .filter((c) => c.visible !== false && c.key !== 'selection-cell' && c.key !== 'edit')
      .map((col) => {
        const hasSorter = col.dataType === 'number' || col.dataType === 'date' || col.dataType === 'string'
        const { sorter, sortOrder: colSortOrder } = reportTableSorterProps(col, {
          sortField,
          sortOrder,
          hasSorter,
          numericSortColumnKeys: AFFILIATE_REPORT_NUMERIC_SORT_KEYS,
        })
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter,
          sortOrder: colSortOrder,
        }

        if (col.key === 'tv_households') {
          base.render = (value) =>
            value === null || value === undefined || value === ''
              ? ''
              : Number(value).toLocaleString()
        }

        if (col.key === 'website') {
          base.render = (value) =>
            value ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">
                {value}
              </a>
            ) : (
              ''
            )
        }

        return base
      })
  )

  return (
    <>
      <Helmet title="Affiliate Report" />
      {filterByCustomer && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 mb-2 flex items-center justify-between">
          <div className="text-sm">
            Showing affiliates for customer:{' '}
            <strong>{filterByCustomer.name}</strong>
          </div>
          <a href="/affiliate-report" className="text-blue-700 underline text-sm">
            Clear filter
          </a>
        </div>
      )}
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
              <MultiSelect
                options={orderByOptions}
                onChange={(value) => setOrderByValue(value)}
                placeholder="Order By"
                className="w-[280px]"
                defaultValue={orderByValue}
                singleSelect
              />
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
                fields={fields}
                filterValue={filterValue}
                setFilterValue={changeFilter}
              />
            </div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <ReportTableDndShell dndContextProps={dndContextProps} sortableContextProps={sortableContextProps}>
              <Table
                columns={antdColumns}
                components={{ header: { cell: DraggableResizableHeader } }}
                dataSource={data}
                rowKey="id"
                rowSelection={rowSelection}
                loading={loading}
                onChange={handleTableChange}
                pagination={false}
                scroll={{ y: 'calc(100vh - 217px)' }}
                size="small"
              />
            </ReportTableDndShell>

            <div className="table-bottom">
              <Select
                value={itemPerPage}
                onChange={(value) => itemPerPageHandleChange(value)}
                options={[
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
              />
              <Pagination
                current={currentPage}
                total={totalRecords}
                pageSize={itemPerPage}
                onChange={(page) => getSearchingData(page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={'600px'}
        title={'Edit Affiliate'}
        onClose={() => handleCloseModal(setShowEditModal)}
        footer={
          <EditModalFooter
            onCancel={() => handleCloseModal(setShowEditModal)}
            onSubmit={handleEditSubmit}
          />
        }
      >
        <div className="mt-4">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-4 mb-4">
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
              <div className="w-full">
                <label
                  className="block mb-1 text-sm text-gray-600"
                  htmlFor="edit-affiliate-ownership-type"
                >
                  Select Ownership
                </label>
                <Select
                  id="edit-affiliate-ownership-type"
                  placeholder="Select Ownership"
                  value={editData?.ownership_type ?? undefined}
                  onChange={(value) => {
                    setEditData((prev) => ({ ...prev, ownership_type: value, ownership_name: undefined }))
                  }}
                  className="w-full"
                  allowClear
                  onClear={() => {
                    setEditData((prev) => ({ ...prev, ownership_type: undefined, ownership_name: undefined }))
                  }}
                >
                  <Select.Option value="Broadcast Group">Broadcast Group</Select.Option>
                  <Select.Option value="MSO">MSO</Select.Option>
                  <Select.Option value="Network">Network</Select.Option>
                </Select>
              </div>
              {editData?.ownership_type === 'Broadcast Group' && (
                <div className="w-full">
                  <label
                    className="block mb-1 text-sm text-gray-600"
                    htmlFor="edit-affiliate-broadcast-group"
                  >
                    Select Broadcast Group Name
                  </label>
                  <Select
                    id="edit-affiliate-broadcast-group"
                    placeholder="Select Broadcast Group Name"
                    value={editData?.ownership_name ?? undefined}
                    onChange={(value) => handleEditChange({ target: { name: 'ownership_name', value } })}
                    className="w-full"
                    allowClear
                  >
                    {allBroadcastGroupNames.map((item) => (
                      <Select.Option key={item.broadcast_group_name} value={item.broadcast_group_name}>
                        {item.broadcast_group_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
              {editData?.ownership_type === 'MSO' && (
                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600" htmlFor="edit-affiliate-mso">
                    Select MSO Name
                  </label>
                  <Select
                    id="edit-affiliate-mso"
                    placeholder="Select MSO Name"
                    value={editData?.ownership_name ?? undefined}
                    onChange={(value) => handleEditChange({ target: { name: 'ownership_name', value } })}
                    className="w-full"
                    allowClear
                  >
                    {allMsoNames.map((item) => (
                      <Select.Option key={item.mso_name} value={item.mso_name}>
                        {item.mso_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
              {editData?.ownership_type === 'Network' && (
                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600" htmlFor="edit-affiliate-network">
                    Select Network Name
                  </label>
                  <Select
                    id="edit-affiliate-network"
                    placeholder="Select Network Name"
                    value={editData?.ownership_name ?? undefined}
                    onChange={(value) => handleEditChange({ target: { name: 'ownership_name', value } })}
                    className="w-full"
                    allowClear
                  >
                    {allNetworkNames.map((item) => (
                      <Select.Option key={item.network_name} value={item.network_name}>
                        {item.network_name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="w-full">
                <label
                  className="block mb-1 text-sm text-gray-600"
                  htmlFor="edit-affiliate-corporations"
                >
                  Corporations (multi-link) <small className="text-gray-500">— optional</small>
                </label>
                <Select
                  id="edit-affiliate-corporations"
                  mode="multiple"
                  placeholder="Link to broadcast groups, MSOs and/or networks"
                  value={corporationsToCompositeValues(editData?.corporations)}
                  onChange={(vals) =>
                    setEditData((prev) => ({
                      ...prev,
                      corporations: compositeValuesToPayload(vals),
                    }))
                  }
                  options={corporationOptions}
                  className="w-full"
                  allowClear
                  optionFilterProp="label"
                />
                <small className="text-gray-500">
                  One station may belong to multiple corporations (e.g. a broadcast group + a network).
                </small>
              </div>
              <div className="w-full">
                <label
                  className="block mb-1 text-sm text-gray-600"
                  htmlFor="edit-affiliate-zip-code"
                >
                  Select ZipCode
                </label>
                <AffiliateZipCodeSelect
                  id="edit-affiliate-zip-code"
                  value={editData?.zip_code}
                  mergeValue={editData?.zip_code}
                  onChange={(value) => handleEditChange({ target: { name: 'zip_code', value } })}
                />
              </div>
              <TextInput
                label="Website"
                name="website"
                type="url"
                handleChange={handleEditChange}
                value={editData ? editData.website ?? '' : ''}
                placeholder="https://example.com"
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
              <div className="w-full">
                <label className="block mb-1 text-sm text-gray-600" htmlFor="edit-affiliate-market">
                  Select Market
                </label>
                <Select
                  id="edit-affiliate-market"
                  placeholder="Select Market"
                  value={editData ? editData.market : undefined}
                  onChange={(value) => handleEditChange({ target: { name: 'market', value } })}
                  className="w-full"
                  allowClear
                >
                  {allMarkets.map((item) => (
                    <Select.Option key={item.market} value={item.market}>
                      {item.market}
                    </Select.Option>
                  ))}
                </Select>
              </div>
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
            </div>
          </form>
        </div>
      </NormalModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={'400px'}
        title={`${selectedRowKeys.length > 1 ? 'Do you want to delete these records?' : 'Do you want to delete this record?'}`}
      />
      <ConfirmModal
        open={showArchivedModal.open}
        setOpen={setShowArchivedModal}
        btnAction={handleArchived}
        closeAction={() => handleCloseModal(setShowArchivedModal)}
        width={'450px'}
        title={`${selectedRowKeys.length > 1 ? 'Do you want to move these records to archive?' : 'Do you want to move this record to archive?'}`}
      />
    </>
  )
}

AffiliateReport.layout = (page) => <Layout title="Affiliate Report">{page}</Layout>
export default AffiliateReport
