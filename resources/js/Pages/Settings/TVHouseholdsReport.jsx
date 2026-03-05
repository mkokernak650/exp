import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Tooltip, Button, Input } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import ConfirmModal from '@/Shared/ConfirmModal'
import NormalModal from '@/Shared/NormalModal'
import { DateTimeFormat } from '@/Helpers/DateTimeFormat'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import toast from 'react-hot-toast'
import { fields, groups, filter, columns as defaultColumns } from './Helpers/TVHouseholdsReportProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CustomerReport = () => {
  const { allTVHouseholds, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const [importModal, setImportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [orderByValue, setOrderByValue] = useState('tv_households@DESC')
  const showColumnRef = useRef()

  const mapDataArr = (data) => data.map((item, index) => ({ edit: item.id, sl: index + 1, market: item.market, state: item.state, tv_households: item.tv_households, created_at: item.created_at, updated_at: item.updated_at, id: item.id, key: item.id }))

  const optionKey = 'tv-household-report'
  const [columnDetails, setColumnDetails] = useState(columnsData.length ? JSON.parse(columnsData[0]) : {})
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

  const [data, setData] = useState(mapDataArr(allTVHouseholds))

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
  const onFilterChanged = (newFilterValue) => { changeFilter(newFilterValue) }
  const [serachSidebar, setSearchSidebar] = useState(false)
  const handleSearch = () => { setSearchSidebar((prevState) => !prevState) }
  const handleColumns = () => { setShowColumns(true) }
  const closeSidebar = () => { setSearchSidebar(false) }
  const orderByOptions = [{ label: 'TV Households (Ascending)', value: 'tv_households@ASC' }, { label: 'TV Households (Descending)', value: 'tv_households@DESC' }, { label: 'Created At (Ascending)', value: 'created_at@ASC' }, { label: 'Created At (Descending)', value: 'created_at@DESC' }]

  const deleteHandler = () => {
    axios.post(route('tv.households.delete'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setSelectedRowKeys([])
        setTableToolbar(false)
        toast.success(res.data.msg)
        setShowDeleteModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setShowDeleteModal({ open: false })
      }
    }).catch((err) => { setShowDeleteModal({ open: false }) })
  }

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      const editItem = { ...item, tv_households: item.tv_households?.toString().replace(/,/g, '') }
      setEditData(editItem)
      setShowEditModal({ open: true })
    }
  }

  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }) }

  const handleEditSubmit = () => {
    axios.post(route('tv.households.edit'), editData).then((res) => {
      if (res.data.status_code === 200) {
        setData((prev) =>
          prev.map((item) => {
            if (item.id === editData.id) {
              return {
                ...item,
                market: editData.market,
                state: editData.state,
                tv_households: res.data.data.tv_households,
                updated_at: new Date(),
              }
            }
            return item
          })
        )
        setEditData()
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      } else {
        setEditData()
        setShowEditModal({ open: false })
        toast.error(res.data.msg)
      }
    }).catch((err) => { console.log(err) })
  }

  const handleCloseModal = (setOpenModal) => { setOpenModal({ open: false }); setTableToolbar(false); setSelectedRowKeys([]) }
  const handleOpenModal = (setOpenModal) => { setOpenModal({ open: true }) }
  const handleImportChange = (e) => { setSelectedFile(e.target.files[0]) }
  const openImportModal = () => { setImportModal({ open: true }) }
  const importHandler = (e) => { e.preventDefault(); setLoading(true); const formData = new FormData(); formData.append('importfile', selectedFile); axios.post(route('tv.households.import'), formData).then((res) => { setSelectedFile(null); setLoading(false); if (res.status === 200) { setImportModal({ open: false }); toast.success('Imported Successfully') } else { toast.error('Import failed') } }).catch((err) => { }) }
  const triggerExportLink = (link) => { return window.open(link) }
  const exportHandler = (e) => { e.preventDefault(); setLoading(true); axios.get('tv-households-export?filterValue=' + JSON.stringify(filterValue)).then((res) => { setLoading(false); if (res.status === 200) { triggerExportLink(res.request.responseURL) } else { toast.error('Error while importing file') } }).catch((err) => { setLoading(false) }) }

  const getSearchingData = async () => {
    setLoading(true)
    await axios.get(`/tv-households-report?orderBy=` + orderByValue + '&type=orderBy').then((res) => {
      setData(mapDataArr(res.data))
      setLoading(false)
    })
  }

  useEffect(() => { getSearchingData() }, [orderByValue])
  useEffect(() => { const checkIfClickedOutside = (e) => { if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) { setShowColumns(false) } }; document.addEventListener('mousedown', checkIfClickedOutside); return () => { document.removeEventListener('mousedown', checkIfClickedOutside) } }, [showColumns])

  const TableToolbar = () => (
    <div className="table-toolbar">
      <Tooltip title="Delete"><Button type="text" icon={<DeleteOutlined style={{ color: '#031b4e' }} />} onClick={() => handleOpenModal(setShowDeleteModal)} /></Tooltip>
      <div className="selection-rows">{selectedRowKeys.length} Row Selected</div>
    </div>
  )

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
      if (col.key === 'created_at' || col.key === 'updated_at') {
        base.render = (value) => DateTimeFormat(value)
      }

      return base
    }))

  return (
    <>
      <Helmet title="TV Households Report" />
      <div className="selection-demo">
        {tableToolbar ? (<TableToolbar />) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}><Eye /></div>
              <Button type="primary" className="capitalize text-sm" onClick={openImportModal}>Import</Button>
              <Button type="primary" className="capitalize text-sm" onClick={exportHandler} disabled={allTVHouseholds == ''} loading={loading}>Searched Export</Button>
              <div className="top-left"><MultiSelect options={orderByOptions} onChange={(value) => setOrderByValue(value)} placeholder="Order By" className="w-[280px]" defaultValue={orderByValue} singleSelect /></div>
            </div>
            <div className="search-icon" onClick={handleSearch}><span>Search Here</span><Search /></div>
            {serachSidebar ? (<div className="search-sidebar"><div className="search-top"><div className="title"><span>Search</span></div><a className="close-nav" onClick={closeSidebar}><Cancel /></a></div><div className="top-element"><FilterControl {...{ fields, groups, filterValue, onFilterValueChanged: onFilterChanged }} /></div></div>) : ''}
            {showColumns ? (<div className="column-settings" ref={showColumnRef}><ColumnSettings columns={columns} onToggleColumn={handleToggleColumn} /></div>) : ''}
          </div>
        )}
        <Table
          columns={antdColumns}
          components={{ header: { cell: ResizableTitle } }}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />
      </div>

      <NormalModal open={showEditModal.open} setOpen={setShowEditModal} width={'600px'} title={'Edit TV Households'}>
        <div className="edit_target">
          <form>
            <div className="mb-4"><span>Market:</span><Input value={editData ? editData.market : ''} name="market" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><span>State:</span><Input value={editData ? editData.state : ''} name="state" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><span>TV Households:</span><Input value={editData ? editData.tv_households : ''} name="tv_households" onChange={handleEditChange} className="w-full" /></div>
            <Button type="primary" onClick={handleEditSubmit} className="mt-[15px]">Edit</Button>
          </form>
          <div onClick={() => handleCloseModal(setShowEditModal)} className="close-modal-icon"><Cancel /></div>
        </div>
      </NormalModal>

      <NormalModal open={importModal.open} setOpen={setImportModal} width={'500px'} title={''}>
        <div><input id="importfile" type="file" name="importfile" onChange={handleImportChange} /><Button type="primary" onClick={importHandler} disabled={!selectedFile} loading={loading}>Next</Button></div>
      </NormalModal>

      <ConfirmModal open={showDeleteModal.open} setOpen={setShowDeleteModal} btnAction={deleteHandler} closeAction={() => handleCloseModal(setShowDeleteModal)} width={'400px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to delete these records?' : 'Do you want to delete this record?'}`} />
    </>
  )
}

CustomerReport.layout = (page) => <Layout title="Customer Report">{page}</Layout>
export default CustomerReport
