import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import Edit from '@/Components/Icons/Edit.jsx'
import { Table, Button, Input, Select } from 'antd'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import NormalModal from '@/Shared/NormalModal'
import ConfirmModal from '@/Shared/ConfirmModal'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import toast from 'react-hot-toast'
import { fields, groups, filter, columns as defaultColumns } from './Helpers/ArchivedAffiliatesProps'
import TextInput from '@/Components/Global/TextInput'

const ArchivedAffiliates = () => {
  const { allAffiliates, columnsData, allMarkets } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editData, setEditData] = useState()
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [showActiveModal, setShowActiveModal] = useState({ open: false })
  const showColumnRef = useRef()

  const dataArray = allAffiliates.map((item, index) => ({
    edit: item.id, affiliate_id: item.affiliate_id, affiliate_name: item.affiliate_name, market: item.market, email: item.email, telephone: item.telephone, address: item.address, contact_name: item.contact_name, contact_telephone: item.contact_telephone, id: item.id, key: item.id,
  }))

  const optionKey = 'affiliate-archived'
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

  const [data, setData] = useState(dataArray)

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

  const handleEdit = (itemId) => {
    const item = data.find((item) => item.id === itemId)
    if (item) {
      setEditData(item)
      setShowEditModal({ open: true })
    }
  }

  const handleActive = () => {
    axios.post(route('active.affiliate'), { selectedRowIds: selectedRowKeys }).then((res) => {
      if (res.data.status_code === 200) {
        toast.success(res.data.msg)
        setData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)))
        setTableToolbar(false)
        setSelectedRowKeys([])
        setShowActiveModal({ open: false })
      } else {
        toast.error(res.data.msg)
        setSelectedRowKeys([])
        setShowActiveModal({ open: false })
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
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      } else { toast.error(res.data.msg) }
    }).catch((err) => { console.log(err) })
  }

  const handleCloseModal = (setOpenModal) => { setOpenModal({ open: false }); setTableToolbar(false); setSelectedRowKeys([]) }
  const handleOpenModal = (setOpenModal) => { setOpenModal({ open: true }) }

  useEffect(() => {
    const checkIfClickedOutside = (e) => { if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) { setShowColumns(false) } }
    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => { document.removeEventListener('mousedown', checkIfClickedOutside) }
  }, [showColumns])

  const TableToolbar = () => (
    <div className="table-toolbar">
      <Button type="primary" className="w-[130px] capitalize text-sm" onClick={() => handleOpenModal(setShowActiveModal)}>Active</Button>
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

      return base
    }))

  return (
    <>
      <Helmet title="Archived Affiliates" />
      <div className="selection-demo">
        {tableToolbar ? (<TableToolbar />) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}><Eye /></div>
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
          pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50, 100], showSizeChanger: true }}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />
      </div>

      <NormalModal open={showEditModal.open} setOpen={setShowEditModal} width={'600px'} title={'Edit Affiliate'}>
        <div className="edit_target">
          <form>
            <div className="mb-4"><label>Affiliate Id</label><Input value={editData ? editData.affiliate_id : ''} name="affiliate_id" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Affiliate Name</label><Input value={editData ? editData.affiliate_name : ''} name="affiliate_name" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Email</label><Input value={editData ? editData.email : ''} name="email" type="email" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Telephone</label><Input value={editData ? editData.telephone : ''} name="telephone" onChange={handleEditChange} className="w-full" /></div>
            <div className="mb-4"><label>Address</label><Input value={editData ? editData.address : ''} name="address" onChange={handleEditChange} className="w-full" /></div>
            <div className="mt-[15px] mb-[10px]">
              <div className="mb-1"><label>Select Market</label></div>
              <Select placeholder="Select Market" value={editData ? editData.market : undefined} onChange={(value) => handleEditChange({ target: { name: 'market', value } })} className="w-full" allowClear>
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

      <ConfirmModal open={showActiveModal.open} setOpen={setShowActiveModal} btnAction={handleActive} closeAction={() => handleCloseModal(setShowActiveModal)} width={'450px'} title={`${selectedRowKeys.length > 1 ? 'Do you want to active these affiliate?' : 'Do you want to active this affiliate?'}`} />
    </>
  )
}

ArchivedAffiliates.layout = (page) => <Layout title="Archived Affiliates">{page}</Layout>
export default ArchivedAffiliates
