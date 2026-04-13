import Layout from '../Layout/Layout'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import { Table, Button, Input, Select, Pagination } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import EditModalFooter from '@/Shared/EditModalFooter'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useReportTableColumns from '@/Helpers/useReportTableColumns'
import ReportTableDndShell from '@/Helpers/ReportTableDndShell'
import { reportTableSorterProps } from '@/Helpers/reportTableSort'
import { countActiveFilters, sanitizeFilterValue } from '@/Helpers/ActiveFilterCount'
import toast from 'react-hot-toast'
import { fields, filter, columns as defaultColumns } from './Helpers/ArchivedAffiliatesProps'
import TextInput from '@/Components/Global/TextInput'
import AffiliateZipCodeSelect from '@/Components/AffiliateZipCodeSelect'

const ArchivedAffiliates = () => {
  const {
    allAffiliates,
    columnsData,
    allMarkets,
    allBroadcastGroupNames,
    allMsoNames,
    allNetworkNames,
  } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showActiveModal, setShowActiveModal] = useState({ open: false })
  const showColumnRef = useRef()
  const tablePanelRef = useRef()
  const [tablePanelHeight, setTablePanelHeight] = useState(0)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(allAffiliates.total || 0)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('')

  const mapDataArr = (rows) =>
    (rows || []).map((item) => ({
      edit: item.id,
      affiliate_id: item.affiliate_id,
      affiliate_name: item.affiliate_name,
      ownership_type: item.ownership_type,
      ownership_name: item.ownership_name,
      ownership: item.ownership_type || '',
      zip_code: item.zip_code,
      website: item.website,
      market: item.market,
      email: item.email,
      telephone: item.telephone,
      address: item.address,
      contact_name: item.contact_name,
      contact_telephone: item.contact_telephone,
      id: item.id,
      key: item.id,
    }))

  const optionKey = 'affiliate-archived'
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

  const [data, setData] = useState(mapDataArr(allAffiliates.data))

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

  const handleActive = () => {
    axios
      .post(route('active.affiliate'), { selectedRowIds: selectedRowKeys })
      .then((res) => {
        if (res.data.status_code === 200) {
          toast.success(res.data.msg)
          getSearchingData(currentPage)
          setTableToolbar(false)
          setSelectedRowKeys([])
          setShowActiveModal({ open: false })
        } else {
          toast.error(res.data.msg)
          setSelectedRowKeys([])
          setShowActiveModal({ open: false })
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
                  market: editData.market,
                  email: editData.email,
                  telephone: editData.telephone,
                  address: editData.address,
                  contact_name: editData.contact_name,
                  contact_telephone: editData.contact_telephone,
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

  const getSearchingData = async (page = 1) => {
    setCurrentPage(page)
    await axios.get('/archived-affiliates', {
      params: { page, itemPerPage, filteredValue: activeFilterJSON, sortField, sortOrder },
    })
      .then((res) => {
        setData(mapDataArr(res.data.data))
        setTotalRecords(res.data.total)
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
    if (!tablePanelRef.current || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => syncTablePanelHeight())
    resizeObserver.observe(tablePanelRef.current)
    window.addEventListener('resize', syncTablePanelHeight)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncTablePanelHeight)
    }
  }, [serachSidebar, data.length, itemPerPage])

  useEffect(() => {
    getSearchingData(1)
  }, [itemPerPage, activeFilterJSON, sortField, sortOrder])

  const TableToolbar = () => {
    const toolbarIconStyle = { color: '#031b4e', fontSize: 20 }

    return (
      <div className="table-toolbar">
        <Button
          type="text"
          icon={<EditOutlined style={toolbarIconStyle} />}
          onClick={handleToolbarEdit}
        />
        <Button
          type="primary"
          className="w-[130px] capitalize text-sm"
          onClick={() => handleOpenModal(setShowActiveModal)}
        >
          Active
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

  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter.order) {
      setSortField(sorter.field)
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc')
    } else {
      setSortField('')
      setSortOrder('')
    }
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
          numericSortColumnKeys: new Set(),
        })
        const base = {
          key: col.key,
          dataIndex: col.key,
          title: col.title || '',
          width: col.style?.width || col.width,
          sorter,
          sortOrder: colSortOrder,
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
      <Helmet title="Archived Affiliates" />
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
              pagination={false}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
              onChange={handleTableChange}
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
          <form>
            <div className="mb-4">
              <label>Affiliate Id</label>
              <Input
                value={editData ? editData.affiliate_id : ''}
                name="affiliate_id"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label>Affiliate Name</label>
              <Input
                value={editData ? editData.affiliate_name : ''}
                name="affiliate_name"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block mb-1" htmlFor="archived-affiliate-ownership-type">
                Select Ownership
              </label>
              <Select
                id="archived-affiliate-ownership-type"
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
              <div className="mb-4 w-full">
                <label className="block mb-1" htmlFor="archived-affiliate-broadcast-group">
                  Select Broadcast Group Name
                </label>
                <Select
                  id="archived-affiliate-broadcast-group"
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
              <div className="mb-4 w-full">
                <label className="block mb-1" htmlFor="archived-affiliate-mso">
                  Select MSO Name
                </label>
                <Select
                  id="archived-affiliate-mso"
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
              <div className="mb-4 w-full">
                <label className="block mb-1" htmlFor="archived-affiliate-network">
                  Select Network Name
                </label>
                <Select
                  id="archived-affiliate-network"
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
            <div className="mb-4 w-full">
              <label className="block mb-1" htmlFor="archived-affiliate-zip-code">
                Select ZipCode
              </label>
              <AffiliateZipCodeSelect
                id="archived-affiliate-zip-code"
                value={editData?.zip_code}
                mergeValue={editData?.zip_code}
                onChange={(value) => handleEditChange({ target: { name: 'zip_code', value } })}
              />
            </div>
            <div className="mb-4">
              <TextInput
                label="Website"
                name="website"
                type="url"
                handleChange={handleEditChange}
                value={editData ? editData.website ?? '' : ''}
                placeholder="https://example.com"
              />
            </div>
            <div className="mb-4">
              <label>Email</label>
              <Input
                value={editData ? editData.email : ''}
                name="email"
                type="email"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label>Telephone</label>
              <Input
                value={editData ? editData.telephone : ''}
                name="telephone"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label>Address</label>
              <Input
                value={editData ? editData.address : ''}
                name="address"
                onChange={handleEditChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <div className="mb-1">
                <label>Select Market</label>
              </div>
              <Select
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
            <div className="flex flex-col gap-4 mb-4">
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
        open={showActiveModal.open}
        setOpen={setShowActiveModal}
        btnAction={handleActive}
        closeAction={() => handleCloseModal(setShowActiveModal)}
        width={'450px'}
        title={`${selectedRowKeys.length > 1 ? 'Do you want to active these affiliate?' : 'Do you want to active this affiliate?'}`}
      />
    </>
  )
}

ArchivedAffiliates.layout = (page) => <Layout title="Archived Affiliates">{page}</Layout>
export default ArchivedAffiliates
