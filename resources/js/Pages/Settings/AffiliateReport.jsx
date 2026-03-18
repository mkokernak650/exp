import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import CustomFilter from '@/Components/CustomFilter'
import Eye from '@/Components/Icons/Eye.jsx'
import Filter from '@/Components/Icons/Filter.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Tooltip, Button, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import toast from 'react-hot-toast'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import { countActiveFilters } from '@/Helpers/ActiveFilterCount'
import { fields, filter, columns as defaultColumns } from './Helpers/AffiliateReportProps'
import TextInput from '@/Components/Global/TextInput'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const AffiliateReport = () => {
  const { allAffiliates, columnsData, allMarkets } = usePage().props
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

  const parseTvHouseholds = (value) => {
    if (value === null || value === undefined || value === '') return null
    const parsedValue = Number(value.toString().replace(/,/g, ''))
    return Number.isNaN(parsedValue) ? null : parsedValue
  }

  const mapDataArr = (data) => {
    return data.map((item, index) => ({
      edit: item.id,
      affiliate_id: item.affiliate_id,
      affiliate_name: item.affiliate_name,
      tv_households: parseTvHouseholds(item.tv_households),
      market: item.market,
      email: item.email,
      telephone: item.telephone,
      address: item.address,
      contact_name: item.contact_name,
      contact_telephone: item.contact_telephone,
      id: item.id,
      key: item.id,
    }))
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
  const { ResizableTitle, withResizableColumns } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const [data, setData] = useState(mapDataArr(allAffiliates))

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
  const [serachSidebar, setSearchSidebar] = useState(false)
  const activeFilterCount = countActiveFilters(filterValue)
  const handleFilter = () => {
    setSearchSidebar((prevState) => !prevState)
    setShowColumns(false)
  }
  const handleColumns = () => { setShowColumns(true) }

  const orderByOptions = [
    { label: 'Affiliate Name (Ascending)', value: 'affiliate_name@ASC' },
    { label: 'Affiliate Name (Descending)', value: 'affiliate_name@DESC' },
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
  ]

  const deleteHandler = () => {
    axios.post(route('affiliate.delete'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
        setTableToolbar(false)
        toast.success(res.data.msg)
        setShowDeleteModal({ open: false })
      } else {
        setSelectedRowKeys([])
        setTableToolbar(false)
        toast.error(res.data.msg)
        setShowDeleteModal({ open: false })
      }
    }).catch((err) => {
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

  const handleArchived = () => {
    axios.post(route('move.affiliate.archive'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        toast.success(res.data.msg)
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setTableToolbar(false)
        setSelectedRowKeys([])
        setShowArchivedModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setSelectedRowKeys([])
        setShowArchivedModal({ open: false })
      }
    }).catch((err) => { })
  }

  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }) }

  const handleEditSubmit = () => {
    axios.post(route('affiliate.edit'), editData).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) =>
          prev.map((item) => {
            if (item.id === editData.id) {
              return {
                ...item,
                affiliate_id: editData.affiliate_id,
                affiliate_name: editData.affiliate_name,
                email: editData.email,
                telephone: editData.telephone,
                address: editData.address,
                market: editData.market,
                contact_name: editData.contact_name,
                contact_telephone: editData.contact_telephone,
              }
            }
            return item
          })
        )
        setEditData()
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      } else { toast.error(res.data.msg) }
    }).catch((err) => { console.log(err) })
  }

  const handleCloseModal = (setOpenModal) => { setOpenModal({ open: false }); setTableToolbar(false); setSelectedRowKeys([]) }
  const handleOpenModal = (setOpenModal) => { setOpenModal({ open: true }) }

  const getSearchingData = async () => {
    setLoading(true)
    await axios.get(`/affiliate-report?orderBy=` + orderByValue + '&type=orderBy').then((res) => {
      setData(mapDataArr(res.data))
      setLoading(false)
    })
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) { setShowColumns(false) }
    }
    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => { document.removeEventListener('mousedown', checkIfClickedOutside) }
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
  }, [serachSidebar, data.length, loading])

  useEffect(() => { getSearchingData() }, [orderByValue])

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} />
        </Tooltip>
        <Button type="primary" className="w-[130px] capitalize text-sm" onClick={() => handleOpenModal(setShowArchivedModal)}>Archived</Button>
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

  const antdColumns = withResizableColumns(columns
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

      if (col.key === 'tv_households') {
        base.render = (value) =>
          value === null || value === undefined || value === ''
            ? ''
            : Number(value).toLocaleString()
      }

      return base
    }))

  return (
    <>
      <Helmet title="Affiliate Report" />
      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}><Eye /></div>
              <button
                type="button"
                className={`filter-trigger ${activeFilterCount ? 'active' : ''}`}
                onClick={handleFilter}
                aria-label="Open filters"
              >
                <Filter />
                {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : ''}
              </button>
              <MultiSelect options={orderByOptions} onChange={(value) => setOrderByValue(value)} placeholder="Order By" className="w-[280px]" defaultValue={orderByValue} singleSelect />
            </div>
            {showColumns ? (<div className="column-settings" ref={showColumnRef}><ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} /></div>) : ''}
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
            <div className="top-element"><CustomFilter fields={fields} filterValue={filterValue} setFilterValue={changeFilter} /></div>
          </div>
          <div className="report-table-panel" ref={tablePanelRef}>
            <Table
              columns={antdColumns}
              components={{ header: { cell: ResizableTitle } }}
              dataSource={data}
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading}
              pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50, 100], showSizeChanger: true }}
              scroll={{ y: 'calc(100vh - 217px)' }}
              size="small"
            />
          </div>
        </div>
      </div>

      <NormalModal open={showEditModal.open} setOpen={setShowEditModal} width={'600px'} title={'Edit Affiliate'}>
        <div className="edit_target">
          <form>
            <TextInput label="Affiliate Id" name="affiliate_id" required={true} handleChange={handleEditChange} value={editData ? editData.affiliate_id : ''} />
            <TextInput label="Affiliate Name" name="affiliate_name" required={true} handleChange={handleEditChange} value={editData ? editData.affiliate_name : ''} />
            <TextInput label="Email" name="email" type="email" handleChange={handleEditChange} value={editData ? editData.email : ''} />
            <TextInput label="Telephone" name="telephone" handleChange={handleEditChange} value={editData ? editData.telephone : ''} />
            <TextInput label="Address" name="address" handleChange={handleEditChange} value={editData ? editData.address : ''} />
            <div className="mt-[15px] mb-[10px]">
              <div className="mb-1"><label>Select Market</label></div>
              <Select id="market" placeholder="Select Market" value={editData ? editData.market : undefined} onChange={(value) => handleEditChange({ target: { name: 'market', value } })} className="w-full" allowClear>
                {allMarkets.map((item) => (<Select.Option key={item.market} value={item.market}>{item.market}</Select.Option>))}
              </Select>
            </div>
            <TextInput label="Contact Name" name="contact_name" handleChange={handleEditChange} value={editData ? editData.contact_name : ''} />
            <TextInput label="Contact Telephone" name="contact_telephone" handleChange={handleEditChange} value={editData ? editData.contact_telephone : ''} />
            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">Edit</Button>
          </form>
          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon"><Cancel /></div>
        </div>
      </NormalModal>

      <ConfirmModal open={showDeleteModal.open} setOpen={setShowDeleteModal} btnAction={deleteHandler} closeAction={() => handleCloseModal(setShowDeleteModal)} width={'400px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to delete these records?' : 'Do you want to delete this record?'}`} />
      <ConfirmModal open={showArchivedModal.open} setOpen={setShowArchivedModal} btnAction={handleArchived} closeAction={() => handleCloseModal(setShowArchivedModal)} width={'450px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to move these records to archive?' : 'Do you want to move this record to archive?'}`} />
    </>
  )
}

AffiliateReport.layout = (page) => <Layout title="Affiliate Report">{page}</Layout>
export default AffiliateReport
